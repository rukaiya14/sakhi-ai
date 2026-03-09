@echo off
echo ========================================
echo  SHE-BALANCE DynamoDB Deployment
echo ========================================
echo.

echo Creating DynamoDB tables...
echo.

REM Users Table
aws dynamodb create-table ^
    --table-name SheBalance-Users ^
    --attribute-definitions ^
        AttributeName=user_id,AttributeType=S ^
        AttributeName=email,AttributeType=S ^
        AttributeName=role,AttributeType=S ^
    --key-schema AttributeName=user_id,KeyType=HASH ^
    --global-secondary-indexes ^
        "[{\"IndexName\":\"EmailIndex\",\"KeySchema\":[{\"AttributeName\":\"email\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}},{\"IndexName\":\"RoleIndex\",\"KeySchema\":[{\"AttributeName\":\"role\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}}]" ^
    --billing-mode PAY_PER_REQUEST ^
    --region us-east-1

echo Users table created!
timeout /t 2 >nul

REM Artisan Profiles Table
aws dynamodb create-table ^
    --table-name SheBalance-ArtisanProfiles ^
    --attribute-definitions ^
        AttributeName=artisan_id,AttributeType=S ^
        AttributeName=user_id,AttributeType=S ^
    --key-schema AttributeName=artisan_id,KeyType=HASH ^
    --global-secondary-indexes ^
        "[{\"IndexName\":\"UserIdIndex\",\"KeySchema\":[{\"AttributeName\":\"user_id\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}}]" ^
    --billing-mode PAY_PER_REQUEST ^
    --region us-east-1

echo Artisan Profiles table created!
timeout /t 2 >nul

REM Products Table
aws dynamodb create-table ^
    --table-name SheBalance-Products ^
    --attribute-definitions ^
        AttributeName=product_id,AttributeType=S ^
        AttributeName=artisan_id,AttributeType=S ^
        AttributeName=category,AttributeType=S ^
    --key-schema AttributeName=product_id,KeyType=HASH ^
    --global-secondary-indexes ^
        "[{\"IndexName\":\"ArtisanIdIndex\",\"KeySchema\":[{\"AttributeName\":\"artisan_id\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}},{\"IndexName\":\"CategoryIndex\",\"KeySchema\":[{\"AttributeName\":\"category\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}}]" ^
    --billing-mode PAY_PER_REQUEST ^
    --region us-east-1

echo Products table created!
timeout /t 2 >nul

REM Orders Table
aws dynamodb create-table ^
    --table-name SheBalance-Orders ^
    --attribute-definitions ^
        AttributeName=order_id,AttributeType=S ^
        AttributeName=buyer_id,AttributeType=S ^
        AttributeName=artisan_id,AttributeType=S ^
    --key-schema AttributeName=order_id,KeyType=HASH ^
    --global-secondary-indexes ^
        "[{\"IndexName\":\"BuyerIdIndex\",\"KeySchema\":[{\"AttributeName\":\"buyer_id\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}},{\"IndexName\":\"ArtisanIdIndex\",\"KeySchema\":[{\"AttributeName\":\"artisan_id\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}}]" ^
    --billing-mode PAY_PER_REQUEST ^
    --region us-east-1

echo Orders table created!
timeout /t 2 >nul

REM SkillScan Results Table
aws dynamodb create-table ^
    --table-name SheBalance-SkillScanResults ^
    --attribute-definitions ^
        AttributeName=scan_id,AttributeType=S ^
        AttributeName=artisan_id,AttributeType=S ^
    --key-schema AttributeName=scan_id,KeyType=HASH ^
    --global-secondary-indexes ^
        "[{\"IndexName\":\"ArtisanIdIndex\",\"KeySchema\":[{\"AttributeName\":\"artisan_id\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}}]" ^
    --billing-mode PAY_PER_REQUEST ^
    --region us-east-1

echo SkillScan Results table created!
timeout /t 2 >nul

REM Messages Table
aws dynamodb create-table ^
    --table-name SheBalance-Messages ^
    --attribute-definitions ^
        AttributeName=message_id,AttributeType=S ^
        AttributeName=sender_id,AttributeType=S ^
        AttributeName=receiver_id,AttributeType=S ^
    --key-schema AttributeName=message_id,KeyType=HASH ^
    --global-secondary-indexes ^
        "[{\"IndexName\":\"SenderIdIndex\",\"KeySchema\":[{\"AttributeName\":\"sender_id\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}},{\"IndexName\":\"ReceiverIdIndex\",\"KeySchema\":[{\"AttributeName\":\"receiver_id\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}}]" ^
    --billing-mode PAY_PER_REQUEST ^
    --region us-east-1

echo Messages table created!
timeout /t 2 >nul

REM Health Alerts Table
aws dynamodb create-table ^
    --table-name SheBalance-HealthAlerts ^
    --attribute-definitions ^
        AttributeName=alert_id,AttributeType=S ^
        AttributeName=artisan_id,AttributeType=S ^
    --key-schema AttributeName=alert_id,KeyType=HASH ^
    --global-secondary-indexes ^
        "[{\"IndexName\":\"ArtisanIdIndex\",\"KeySchema\":[{\"AttributeName\":\"artisan_id\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}}]" ^
    --billing-mode PAY_PER_REQUEST ^
    --region us-east-1

echo Health Alerts table created!
echo.
echo ========================================
echo  All DynamoDB tables created successfully!
echo ========================================
echo.
echo Listing tables...
aws dynamodb list-tables --region us-east-1

pause
