@echo off
echo ============================================================
echo SageMaker Training - Live Monitor
echo ============================================================
echo Job: shebalance-skillscan-working
echo.

:loop
aws sagemaker describe-training-job --training-job-name shebalance-skillscan-working --region us-east-1 --query "{Status:TrainingJobStatus,SecondaryStatus:SecondaryStatus,Duration:TrainingTimeInSeconds}" --output table

echo.
echo Time: %TIME%
echo Refreshing in 30 seconds... (Press Ctrl+C to stop)
echo.

timeout /t 30 /nobreak >nul
cls
goto loop
