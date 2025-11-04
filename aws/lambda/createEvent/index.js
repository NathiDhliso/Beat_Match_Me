/**
 * Create Event Lambda Function
 * Creates a new event for performers
 */

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

async function generateQRCode(eventId) {
  const url = `beatmatchme://event/${eventId}`;
  
  // Generate QR code as data URL
  const qrCodeDataUrl = await QRCode.toDataURL(url, {
    width: 512,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });

  // Convert data URL to buffer
  const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');

  // Upload to S3
  const key = `qr-codes/${eventId}.png`;
  await s3
    .putObject({
      Bucket: process.env.S3_BUCKET_NAME || 'beatmatchme-assets',
      Key: key,
      Body: buffer,
      ContentType: 'image/png',
      ACL: 'public-read',
    })
    .promise();

  return `https://${process.env.S3_BUCKET_NAME || 'beatmatchme-assets'}.s3.amazonaws.com/${key}`;
}

exports.handler = async (event) => {
  console.log('Creating event:', JSON.stringify(event, null, 2));

  try {
    const input = event.arguments.input;
    const performerId = event.identity.sub; // From Cognito

    // Validate performer
    const userResult = await dynamodb
      .get({
        TableName: 'beatmatchme-users',
        Key: { userId: performerId },
      })
      .promise();

    if (!userResult.Item || userResult.Item.role !== 'PERFORMER') {
      throw new Error('Only performers can create events');
    }

    // Create event
    const eventId = uuidv4();
    
    // Handle venueLocation - support both old and new format
    const venueLocation = input.venueLocation || {
      address: input.venueAddress || '',
      city: input.venueCity || '',
      province: input.venueProvince || '',
    };
    
    // Ensure venueLocation has all required fields
    if (!venueLocation.address) venueLocation.address = '';
    if (!venueLocation.city) venueLocation.city = '';
    if (!venueLocation.province) venueLocation.province = '';
    
    const newEvent = {
      eventId,
      performerId,
      venueName: input.venueName,
      venueLocation,
      startTime: input.startTime,
      endTime: input.endTime,
      status: input.status || 'SCHEDULED',
      settings: {
        basePrice: input.basePrice || 20,
        requestCapPerHour: input.requestCapPerHour || 20,
        spotlightSlotsPerBlock: input.spotlightSlotsPerBlock || 1,
        allowDedications: input.allowDedications !== undefined ? input.allowDedications : true,
        allowGroupRequests: input.allowGroupRequests !== undefined ? input.allowGroupRequests : true,
      },
      theme: input.theme || 'default',
      createdAt: Date.now(),
      totalRevenue: 0,
      totalRequests: 0,
    };

    // Generate QR code
    try {
      const qrCodeUrl = await generateQRCode(eventId);
      newEvent.qrCode = qrCodeUrl;
    } catch (qrError) {
      console.error('QR code generation failed:', qrError);
      // Continue without QR code
    }

    // Save event
    await dynamodb
      .put({
        TableName: 'beatmatchme-events',
        Item: newEvent,
      })
      .promise();

    // Initialize empty queue
    await dynamodb
      .put({
        TableName: 'beatmatchme-queues',
        Item: {
          eventId,
          orderedRequestIds: [],
          lastUpdated: Date.now(),
        },
      })
      .promise();

    console.log('Event created successfully:', eventId);

    return newEvent;
  } catch (error) {
    console.error('Event creation failed:', error);
    throw error;
  }
};
