// AppSync Schema Deployment Script
// Uses AWS SDK for JavaScript to deploy GraphQL schema

const fs = require('fs');
const path = require('path');
const { AppSyncClient, StartSchemaCreationCommand, GetSchemaCreationStatusCommand } = require('@aws-sdk/client-appsync');

// Configuration
const configPath = path.join(__dirname, 'appsync-config.json');
const schemaPath = path.join(__dirname, 'schema.graphql');

// Load configuration
let config;
try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (error) {
    console.error('❌ Error: Failed to load appsync-config.json');
    process.exit(1);
}

const { ApiId, Region } = config;

console.log('🚀 Deploying GraphQL Schema to AppSync');
console.log(`API ID: ${ApiId}`);
console.log(`Region: ${Region}`);
console.log();

// Read schema
let schemaContent;
try {
    schemaContent = fs.readFileSync(schemaPath, 'utf8');
    console.log(`📄 Read schema (${schemaContent.length} characters)`);
} catch (error) {
    console.error('❌ Error: Failed to read schema.graphql');
    process.exit(1);
}

// Initialize AWS AppSync client
const client = new AppSyncClient({ region: Region });

async function deploySchema() {
    try {
        console.log('⬆️  Uploading schema to AppSync...');
        
        // Start schema creation
        const startCommand = new StartSchemaCreationCommand({
            apiId: ApiId,
            definition: Buffer.from(schemaContent, 'utf8')
        });
        
        const startResponse = await client.send(startCommand);
        console.log(`✅ Schema upload started (status: ${startResponse.status})`);
        
        // Poll for completion
        console.log('⏳ Waiting for deployment to complete...');
        const maxAttempts = 60;
        let attempt = 0;
        let deployed = false;
        
        while (attempt < maxAttempts && !deployed) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            attempt++;
            
            const statusCommand = new GetSchemaCreationStatusCommand({ apiId: ApiId });
            const statusResponse = await client.send(statusCommand);
            const status = statusResponse.status;
            
            console.log(`  Status: ${status} (attempt ${attempt}/${maxAttempts})`);
            
            if (status === 'SUCCESS') {
                deployed = true;
                console.log();
                console.log('✅ Schema deployed successfully!');
            } else if (status === 'FAILED') {
                const details = statusResponse.details || 'No details provided';
                console.log();
                console.error(`❌ Schema deployment failed: ${details}`);
                process.exit(1);
            } else if (status === 'PROCESSING' || status === 'PENDING') {
                // Continue waiting
            } else {
                console.warn(`⚠️  Unknown status: ${status}`);
            }
        }
        
        if (!deployed) {
            console.log();
            console.error(`❌ Deployment timed out after ${maxAttempts} attempts`);
            process.exit(1);
        }
        
        console.log();
        console.log('═'.repeat(50));
        console.log('🎉 Schema Deployment Complete!');
        console.log('═'.repeat(50));
        console.log();
        console.log('Next steps:');
        console.log('1. Deploy resolvers: .\\deploy-resolvers-only.ps1');
        console.log('2. Test queries in AppSync console');
        console.log('3. Refresh your web app');
        console.log();
        
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        if (error.$metadata) {
            console.error('Details:', error.$metadata);
        }
        process.exit(1);
    }
}

deploySchema();
