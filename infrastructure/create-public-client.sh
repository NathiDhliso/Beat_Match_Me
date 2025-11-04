#!/bin/bash
# Create Public Cognito App Client (No Secret)
# This creates a new app client without a client secret for mobile/web apps

set -e

echo "========================================"
echo "Create Public Cognito App Client"
echo "========================================"
echo ""

# Configuration
USER_POOL_ID="us-east-1_m1PhjZ4yD"
REGION="us-east-1"
CLIENT_NAME="beatmatchme-public-client"

echo "User Pool ID: $USER_POOL_ID"
echo "Region: $REGION"
echo "Client Name: $CLIENT_NAME"
echo ""

# Create App Client WITHOUT secret
echo "Creating public app client (no secret)..."

RESULT=$(aws cognito-idp create-user-pool-client \
    --user-pool-id "$USER_POOL_ID" \
    --client-name "$CLIENT_NAME" \
    --no-generate-secret \
    --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH ALLOW_USER_SRP_AUTH \
    --read-attributes "email" "name" \
    --write-attributes "email" "name" \
    --refresh-token-validity 30 \
    --access-token-validity 60 \
    --id-token-validity 60 \
    --token-validity-units AccessToken=minutes,IdToken=minutes,RefreshToken=days \
    --region "$REGION" 2>&1)

if [ $? -eq 0 ]; then
    APP_CLIENT_ID=$(echo "$RESULT" | jq -r '.UserPoolClient.ClientId')
    
    echo ""
    echo "========================================"
    echo "✓ SUCCESS!"
    echo "========================================"
    echo ""
    echo "New App Client ID: $APP_CLIENT_ID"
    echo ""
    echo "Next Steps:"
    echo "1. Update web/.env:"
    echo "   VITE_USER_POOL_CLIENT_ID=$APP_CLIENT_ID"
    echo ""
    echo "2. Update mobile/.env:"
    echo "   EXPO_PUBLIC_USER_POOL_CLIENT_ID=$APP_CLIENT_ID"
    echo ""
    echo "3. Restart both apps"
    echo ""
    
    # Optionally update .env files automatically
    read -p "Update .env files automatically? (y/n) " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Update web/.env
        if [ -f "web/.env" ]; then
            echo "Updating web/.env..."
            sed -i.bak "s/VITE_USER_POOL_CLIENT_ID=.*/VITE_USER_POOL_CLIENT_ID=$APP_CLIENT_ID/" web/.env
            echo "✓ Updated web/.env"
        fi
        
        # Update mobile/.env
        if [ -f "mobile/.env" ]; then
            echo "Updating mobile/.env..."
            sed -i.bak "s/EXPO_PUBLIC_USER_POOL_CLIENT_ID=.*/EXPO_PUBLIC_USER_POOL_CLIENT_ID=$APP_CLIENT_ID/" mobile/.env
            echo "✓ Updated mobile/.env"
        fi
        
        echo ""
        echo "✓ .env files updated!"
        echo "Now restart your apps:"
        echo "  Web: cd web && npm run dev"
        echo "  Mobile: cd mobile && npm start -- --clear"
    fi
    
else
    echo ""
    echo "✗ Failed to create app client"
    echo "Error: $RESULT"
    echo ""
    echo "Try creating manually in AWS Console:"
    echo "1. Go to: https://console.aws.amazon.com/cognito/"
    echo "2. Select region: us-east-1"
    echo "3. Select user pool: beatmatchme-users"
    echo "4. Go to App integration > App clients"
    echo "5. Create new app client (Public, no secret)"
    exit 1
fi

echo ""
echo "========================================"
echo "Done!"
echo "========================================"
