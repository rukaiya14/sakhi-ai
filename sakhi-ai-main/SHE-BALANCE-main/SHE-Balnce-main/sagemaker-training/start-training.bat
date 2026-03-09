@echo off
echo ============================================================
echo SheBalance SkillScan - SageMaker Training
echo ============================================================
echo.
echo Current Status:
echo - Dataset: 489 images prepared
echo - Categories: Embroidery, Henna, Tailoring, Crochet
echo - Claude AI: Already working!
echo.
echo ============================================================
echo IMPORTANT: Training Costs
echo ============================================================
echo - GPU Training: $3-5 (one-time, ~60 minutes)
echo - Inference Endpoint: $50/month (ongoing)
echo - Total First Month: ~$55
echo.
echo ============================================================
echo RECOMMENDATION:
echo ============================================================
echo For hackathon demo, your Claude-only system is excellent!
echo - Already provides detailed analysis
echo - No additional cost
echo - Working right now
echo.
echo Consider SageMaker training AFTER hackathon when you have:
echo - 500+ images per category
echo - Real user data
echo - Production budget
echo.
echo ============================================================
set /p CONTINUE="Do you want to start SageMaker training now? (y/n): "

if /i "%CONTINUE%" NEQ "y" (
    echo.
    echo ✅ Keeping Claude-only setup (recommended)
    echo Your SkillScan AI is ready to use!
    echo.
    echo Test it at: http://localhost:8000/skills.html
    echo.
    pause
    exit /b 0
)

echo.
echo ============================================================
echo Starting SageMaker Training...
echo ============================================================
echo This will:
echo 1. Upload dataset to S3
echo 2. Start training job (60 minutes)
echo 3. Deploy endpoint
echo 4. Test the model
echo.
echo Press Ctrl+C to cancel, or wait...
timeout /t 5

python deploy_sagemaker.py

echo.
echo ============================================================
echo Training Complete!
echo ============================================================
echo.
echo Next steps:
echo 1. Update Lambda environment variables
echo 2. Test integration
echo 3. Deploy to production
echo.
echo See SAGEMAKER_QUICKSTART.md for details
echo.
pause
