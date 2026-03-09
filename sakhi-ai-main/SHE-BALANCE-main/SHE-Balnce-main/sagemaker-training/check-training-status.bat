@echo off
echo ============================================================
echo SageMaker Training Status
echo ============================================================
echo.

aws sagemaker describe-training-job --training-job-name shebalance-skillscan-v2 --region us-east-1 --query "{Status:TrainingJobStatus,Instance:ResourceConfig.InstanceType,StartTime:TrainingStartTime,Duration:TrainingTimeInSeconds,SecondaryStatus:SecondaryStatus}" --output table

echo.
echo ============================================================
echo.
echo To view logs:
echo aws logs tail /aws/sagemaker/TrainingJobs --follow --filter-pattern shebalance-skillscan-v2
echo.
echo To check in AWS Console:
echo https://console.aws.amazon.com/sagemaker/home?region=us-east-1#/jobs/shebalance-skillscan-v2
echo.
pause
