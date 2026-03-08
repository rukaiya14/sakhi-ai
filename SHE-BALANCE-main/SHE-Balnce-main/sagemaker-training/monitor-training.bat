@echo off
:loop
cls
echo ============================================================
echo SageMaker Training Monitor
echo ============================================================
echo.
echo Job Name: shebalance-skillscan-v2
echo Time: %TIME%
echo.

aws sagemaker describe-training-job --training-job-name shebalance-skillscan-v2 --region us-east-1 --query "{Status:TrainingJobStatus,SecondaryStatus:SecondaryStatus,Duration:TrainingTimeInSeconds}" --output table

echo.
echo ============================================================
echo.
echo Options:
echo - Press Ctrl+C to stop monitoring
echo - Refreshing every 30 seconds...
echo.
echo AWS Console:
echo https://console.aws.amazon.com/sagemaker/home?region=us-east-1#/jobs/shebalance-skillscan-v2
echo.

timeout /t 30 /nobreak
goto loop
