@echo off
echo Creating SageMaker IAM Role...

REM Create trust policy
echo { > trust-policy.json
echo   "Version": "2012-10-17", >> trust-policy.json
echo   "Statement": [ >> trust-policy.json
echo     { >> trust-policy.json
echo       "Effect": "Allow", >> trust-policy.json
echo       "Principal": { >> trust-policy.json
echo         "Service": "sagemaker.amazonaws.com" >> trust-policy.json
echo       }, >> trust-policy.json
echo       "Action": "sts:AssumeRole" >> trust-policy.json
echo     } >> trust-policy.json
echo   ] >> trust-policy.json
echo } >> trust-policy.json

REM Create role
aws iam create-role --role-name SageMakerRole --assume-role-policy-document file://trust-policy.json

REM Attach policies
aws iam attach-role-policy --role-name SageMakerRole --policy-arn arn:aws:iam::aws:policy/AmazonSageMakerFullAccess
aws iam attach-role-policy --role-name SageMakerRole --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

REM Clean up
del trust-policy.json

echo.
echo ✅ SageMaker Role created successfully!
echo Role ARN: arn:aws:iam::065538523474:role/SageMakerRole
echo.
pause
