# AppSync Schema Deployment Script
# Uses AWS CLI to deploy GraphQL schema

import json
import boto3
import time
import sys
from pathlib import Path

# Configuration
SCRIPT_DIR = Path(__file__).parent
CONFIG_FILE = SCRIPT_DIR / "appsync-config.json"
SCHEMA_FILE = SCRIPT_DIR / "schema.graphql"

# Load configuration
try:
    with open(CONFIG_FILE, 'r') as f:
        config = json.load(f)
        API_ID = config['ApiId']
        REGION = config['Region']
except FileNotFoundError:
    print("❌ Error: appsync-config.json not found")
    sys.exit(1)
except KeyError as e:
    print(f"❌ Error: Missing key in config: {e}")
    sys.exit(1)

print("🚀 Deploying GraphQL Schema to AppSync")
print(f"API ID: {API_ID}")
print(f"Region: {REGION}")
print()

# Read schema
try:
    with open(SCHEMA_FILE, 'r', encoding='utf-8') as f:
        schema_content = f.read()
except FileNotFoundError:
    print(f"❌ Error: {SCHEMA_FILE} not found")
    sys.exit(1)

print(f"📄 Read schema ({len(schema_content)} characters)")

# Initialize AWS AppSync client
client = boto3.client('appsync', region_name=REGION)

try:
    print("⬆️  Uploading schema to AppSync...")
    
    # Start schema creation
    response = client.start_schema_creation(
        apiId=API_ID,
        definition=schema_content.encode('utf-8')
    )
    
    print(f"✅ Schema upload started (status: {response['status']})")
    
    # Poll for completion
    print("⏳ Waiting for deployment to complete...")
    max_attempts = 60
    attempt = 0
    
    while attempt < max_attempts:
        time.sleep(2)
        attempt += 1
        
        status_response = client.get_schema_creation_status(apiId=API_ID)
        status = status_response['status']
        
        print(f"  Status: {status} (attempt {attempt}/{max_attempts})")
        
        if status == 'SUCCESS':
            print()
            print("✅ Schema deployed successfully!")
            break
        elif status == 'FAILED':
            details = status_response.get('details', 'No details provided')
            print()
            print(f"❌ Schema deployment failed: {details}")
            sys.exit(1)
        elif status in ['PROCESSING', 'PENDING']:
            # Continue waiting
            pass
        else:
            print(f"⚠️  Unknown status: {status}")
    
    if status != 'SUCCESS':
        print()
        print(f"❌ Deployment timed out after {max_attempts} attempts")
        sys.exit(1)
    
    print()
    print("═" * 50)
    print("🎉 Schema Deployment Complete!")
    print("═" * 50)
    print()
    print("Next steps:")
    print("1. Deploy resolvers: .\\deploy-resolvers-only.ps1")
    print("2. Test queries in AppSync console")
    print("3. Refresh your web app")
    print()
    
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
