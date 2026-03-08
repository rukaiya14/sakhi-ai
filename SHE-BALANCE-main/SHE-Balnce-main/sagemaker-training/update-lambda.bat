@echo off
echo ============================================================
echo Updating Lambda for SageMaker Integration
echo ============================================================
echo.

echo Step 1: Adding SageMaker permissions to Lambda role...
aws iam attach-role-policy --role-name SheBalance-SkillScan-Lambda-production --policy-arn arn:aws:iam::aws:policy/AmazonSageMakerFullAccess

if %ERRORLEVEL% EQU 0 (
    echo ✅ Permissions added
) else (
    echo ⚠️  Permission may already exist or role name different
)

echo.
echo Step 2: Updating Lambda environment variables...
aws lambda update-function-configuration --function-name SheBalance-SkillScan-Analysis --environment Variables="{SKILLSCAN_TABLE=SheBalance-SkillScan,S3_BUCKET=shebalance-skillscan-images-065538523474,SAGEMAKER_ENDPOINT=shebalance-skill-classifier,USE_SAGEMAKER=true}" --region us-east-1

if %ERRORLEVEL% EQU 0 (
    echo ✅ Lambda updated successfully!
) else (
    echo ❌ Lambda update failed
    echo Check function name and permissions
)

echo.
echo ============================================================
echo Integration Complete!
echo ============================================================
echo.
echo Test your system:
echo http://localhost:8000/skills.html
echo.
echo Upload an image and check for:
echo - "enhanced_by_sagemaker": true
echo - "sagemaker_prediction": {...}
echo.
pause
