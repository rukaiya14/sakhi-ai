@echo off
echo Creating SageMaker Training Job...
echo.

set JOB_NAME=shebalance-skillscan-%RANDOM%%RANDOM%
set ROLE_ARN=arn:aws:iam::065538523474:role/SageMakerRole
set BUCKET=shebalance-sagemaker-065538523474
set REGION=us-east-1
set TRAINING_IMAGE=382416733822.dkr.ecr.us-east-1.amazonaws.com/image-classification:latest

echo Job Name: %JOB_NAME%
echo.

aws sagemaker create-training-job ^
  --training-job-name %JOB_NAME% ^
  --role-arn %ROLE_ARN% ^
  --algorithm-specification TrainingImage=%TRAINING_IMAGE%,TrainingInputMode=File ^
  --input-data-config "[{\"ChannelName\":\"train\",\"DataSource\":{\"S3DataSource\":{\"S3DataType\":\"S3Prefix\",\"S3Uri\":\"s3://%BUCKET%/skillscan/training/train\",\"S3DataDistributionType\":\"FullyReplicated\"}},\"ContentType\":\"application/x-image\",\"CompressionType\":\"None\"},{\"ChannelName\":\"validation\",\"DataSource\":{\"S3DataSource\":{\"S3DataType\":\"S3Prefix\",\"S3Uri\":\"s3://%BUCKET%/skillscan/training/val\",\"S3DataDistributionType\":\"FullyReplicated\"}},\"ContentType\":\"application/x-image\",\"CompressionType\":\"None\"}]" ^
  --output-data-config S3OutputPath=s3://%BUCKET%/skillscan/output ^
  --resource-config InstanceType=ml.p3.2xlarge,InstanceCount=1,VolumeSizeInGB=50 ^
  --stopping-condition MaxRuntimeInSeconds=86400 ^
  --hyper-parameters num_layers=18,use_pretrained_model=1,image_shape=3x224x224,num_classes=3,num_training_samples=280,mini_batch_size=32,epochs=50,learning_rate=0.001,optimizer=adam,top_k=2,precision_dtype=float32 ^
  --region %REGION%

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================================
    echo Training Job Created Successfully!
    echo ============================================================
    echo.
    echo Job Name: %JOB_NAME%
    echo Status: Starting
    echo.
    echo Monitor at: https://console.aws.amazon.com/sagemaker/home?region=us-east-1#/jobs
    echo.
    echo Or check status:
    echo aws sagemaker describe-training-job --training-job-name %JOB_NAME%
    echo.
    echo Training will take 30-60 minutes
    echo.
) else (
    echo.
    echo ============================================================
    echo Training Job Creation Failed
    echo ============================================================
    echo.
    echo Possible issues:
    echo 1. Instance quota exceeded - Request ml.p3.2xlarge quota increase
    echo 2. IAM role permissions
    echo 3. Invalid hyperparameters
    echo.
)

pause
