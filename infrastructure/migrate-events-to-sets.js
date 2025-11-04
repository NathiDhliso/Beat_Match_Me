/**
 * Migration Script: Events to DJ Sets
 * Converts existing Event records into Event + DJSet architecture
 */

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

const EVENTS_TABLE = 'beatmatchme-events-dev';
const DJSETS_TABLE = 'beatmatchme-djsets-dev';
const REQUESTS_TABLE = 'beatmatchme-requests-dev';

async function migrateEvents() {
  console.log('🔄 Starting migration: Events → DJ Sets...\n');

  // Step 1: Scan all existing events
  const eventsResponse = await dynamodb.scan({ TableName: EVENTS_TABLE }).promise();
  const events = eventsResponse.Items || [];
  
  console.log(`📋 Found ${events.length} events to migrate\n`);

  for (const event of events) {
    console.log(`\n🎵 Processing event: ${event.venueName} (${event.eventId})`);
    
    // Step 2: Create DJ Set from event data
    const djSet = {
      setId: `SET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventId: event.eventId,
      performerId: event.performerId,
      setStartTime: event.startTime,
      setEndTime: event.endTime,
      status: event.status,
      settings: event.settings || {
        basePrice: 50.0,
        requestCapPerHour: 10,
        spotlightSlotsPerBlock: 2,
        allowDedications: true,
        allowGroupRequests: true
      },
      isAcceptingRequests: event.status === 'ACTIVE',
      revenue: event.totalRevenue || 0,
      requestCount: event.totalRequests || 0,
      createdAt: event.createdAt || Date.now()
    };

    // Insert DJ Set
    await dynamodb.put({
      TableName: DJSETS_TABLE,
      Item: djSet
    }).promise();
    
    console.log(`  ✅ Created DJ Set: ${djSet.setId}`);

    // Step 3: Update Event (remove performerId, add createdBy)
    await dynamodb.update({
      TableName: EVENTS_TABLE,
      Key: { eventId: event.eventId },
      UpdateExpression: 'SET createdBy = :createdBy REMOVE performerId, settings',
      ExpressionAttributeValues: {
        ':createdBy': event.performerId
      }
    }).promise();
    
    console.log(`  ✅ Updated Event structure`);

    // Step 4: Update all requests for this event to include setId and performerId
    const requestsResponse = await dynamodb.query({
      TableName: REQUESTS_TABLE,
      IndexName: 'eventId-submittedAt-index',
      KeyConditionExpression: 'eventId = :eventId',
      ExpressionAttributeValues: {
        ':eventId': event.eventId
      }
    }).promise();

    const requests = requestsResponse.Items || [];
    
    if (requests.length > 0) {
      console.log(`  📝 Updating ${requests.length} requests...`);
      
      for (const request of requests) {
        await dynamodb.update({
          TableName: REQUESTS_TABLE,
          Key: { requestId: request.requestId },
          UpdateExpression: 'SET setId = :setId, performerId = :performerId',
          ExpressionAttributeValues: {
            ':setId': djSet.setId,
            ':performerId': event.performerId
          }
        }).promise();
      }
      
      console.log(`  ✅ Updated ${requests.length} requests with setId`);
    } else {
      console.log(`  ℹ️  No requests to update`);
    }
  }

  console.log('\n\n🎉 Migration complete!\n');
  console.log('Summary:');
  console.log(`- Events migrated: ${events.length}`);
  console.log(`- DJ Sets created: ${events.length}`);
  console.log('\nNext steps:');
  console.log('1. Test queries in AppSync console');
  console.log('2. Update frontend to use DJ Sets');
  console.log('3. Deploy updated application\n');
}

// Run migration
migrateEvents().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
