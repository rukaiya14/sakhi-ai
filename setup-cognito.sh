#!/bin/bash

echo "========================================="
echo "AWS Cognito Setup for SHE-BALANCE"
echo "========================================="
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install it first:"
    echo "   https://aws.amazon.com/cli/"
    exit 1
fi

echo "✅ AWS CLI found"
echo ""

# Set region
REGION="us-east-1"
POOL_NAME="she-balance-users"

echo "Creating Cognito User Pool..."
POOL_ID=$(aws cognito-idp create-user-pool \
    --pool-name "$POOL_NAME" \
    --policies "PasswordPolicy={MinimumLength=8,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true,RequireSymbols=false}" \
    --auto-verified-attributes email \
    --username-attributes email \
    --schema Name=email,Required=true,Mutable=false \
            Name=custom:role,AttributeDataType=String,Mutable=true \
            Name=custom:fullName,AttributeDataType=String,Mutable=true \
    --region $REGION \
    --query 'UserPool.Id' \
    --output text)

echo "✅ User Pool created: $POOL_ID"
echo ""

echo "Creating App Client..."
CLIENT_ID=$(aws cognito-idp create-user-pool-client \
    --user-pool-id "$POOL_ID" \
    --client-name "she-balance-web" \
    --no-generate-secret \
    --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH ALLOW_USER_SRP_AUTH \
    --region $REGION \
    --query 'UserPoolClient.ClientId' \
    --output text)

echo "✅ App Client created: $CLIENT_ID"
echo ""

echo "Creating test users..."

# Create Rukaiya (Artisan)
aws cognito-idp admin-create-user \
    --user-pool-id "$POOL_ID" \
    --username "rukaiya@example.com" \
    --user-attributes Name=email,Value=rukaiya@example.com Name=email_verified,Value=true Name=custom:role,Value=artisan Name=custom:fullName,Value="Rukaiya Khan" \
    --temporary-password "TempPass123!" \
    --message-action SUPPRESS \
    --region $REGION

aws cognito-idp admin-set-user-password \
    --user-pool-id "$POOL_ID" \
    --username "rukaiya@example.com" \
    --password "artisan123" \
    --permanent \
    --region $REGION

echo "✅ Created: rukaiya@example.com / artisan123"

# Create Rahul (Buyer)
aws cognito-idp admin-create-user \
    --user-pool-id "$POOL_ID" \
    --username "rahul@example.com" \
    --user-attributes Name=email,Value=rahul@example.com Name=email_verified,Value=true Name=custom:role,Value=buyer Name=custom:fullName,Value="Rahul Kumar" \
    --temporary-password "TempPass123!" \
    --message-action SUPPRESS \
    --region $REGION

aws cognito-idp admin-set-user-password \
    --user-pool-id "$POOL_ID" \
    --username "rahul@example.com" \
    --password "buyer123" \
    --permanent \
    --region $REGION

echo "✅ Created: rahul@example.com / buyer123"

# Create Corporate Buyer
aws cognito-idp admin-create-user \
    --user-pool-id "$POOL_ID" \
    --username "corporate@shebalance.com" \
    --user-attributes Name=email,Value=corporate@shebalance.com Name=email_verified,Value=true Name=custom:role,Value=corporate Name=custom:fullName,Value="Corporate Buyer" \
    --temporary-password "TempPass123!" \
    --message-action SUPPRESS \
    --region $REGION

aws cognito-idp admin-set-user-password \
    --user-pool-id "$POOL_ID" \
    --username "corporate@shebalance.com" \
    --password "corporate123" \
    --permanent \
    --region $REGION

echo "✅ Created: corporate@shebalance.com / corporate123"

# Create Admin
aws cognito-idp admin-create-user \
    --user-pool-id "$POOL_ID" \
    --username "admin@shebalance.com" \
    --user-attributes Name=email,Value=admin@shebalance.com Name=email_verified,Value=true Name=custom:role,Value=admin Name=custom:fullName,Value="Admin User" \
    --temporary-password "TempPass123!" \
    --message-action SUPPRESS \
    --region $REGION

aws cognito-idp admin-set-user-password \
    --user-pool-id "$POOL_ID" \
    --username "admin@shebalance.com" \
    --password "admin123" \
    --permanent \
    --region $REGION

echo "✅ Created: admin@shebalance.com / admin123"
echo ""

echo "========================================="
echo "✅ Cognito Setup Complete!"
echo "========================================="
echo ""
echo "Add these to your .env file:"
echo ""
echo "COGNITO_USER_POOL_ID=$POOL_ID"
echo "COGNITO_CLIENT_ID=$CLIENT_ID"
echo "COGNITO_REGION=$REGION"
echo ""
echo "Next steps:"
echo "1. Copy the above values to SHE-BALANCE-main/SHE-Balnce-main/backend/.env"
echo "2. Run: cd SHE-BALANCE-main/SHE-Balnce-main/backend && npm install @aws-sdk/client-cognito-identity-provider"
echo "3. Restart your backend server"
echo ""
