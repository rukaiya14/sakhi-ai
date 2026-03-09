@echo off
echo ============================================================
echo SageMaker Endpoint Status
echo ============================================================
echo.

aws sagemaker describe-endpoint --endpoint-name shebalance-skill-classifier --region us-east-1 --query "{Status:EndpointStatus,Instance:ProductionVariants[0].InstanceType,Count:ProductionVariants[0].CurrentInstanceCount}" --output table

echo.
echo ============================================================
echo.
echo If Status = InService, endpoint is ready!
echo Then run: update-lambda.bat
echo.
pause
