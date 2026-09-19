@echo off
setlocal enabledelayedexpansion

echo ================================================================
echo   Consenzo AWS Serverless Production Deployment Pipeline
echo ================================================================
echo.

if "%AWS_PROFILE%"=="" set AWS_PROFILE=consenzo
if "%AWS_REGION%"=="" set AWS_REGION=us-east-1

REM 1. Check AWS Authentication
echo [1/5] Verifying AWS authentication with profile '%AWS_PROFILE%'...
for /f "tokens=*" %%i in ('aws sts get-caller-identity --query "Arn" --output text 2^>nul') do set CALLER_ARN=%%i
for /f "tokens=*" %%i in ('aws sts get-caller-identity --query "Account" --output text 2^>nul') do set AWS_ACCOUNT_ID=%%i

if "%CALLER_ARN%"=="" (
    echo [ERROR] No active AWS credentials found for profile '%AWS_PROFILE%'.
    echo Please run 'aws sso login --profile %AWS_PROFILE%' first.
    exit /b 1
)

echo [OK] Authenticated Principal: %CALLER_ARN%
echo [OK] Target Account:          %AWS_ACCOUNT_ID%
echo [OK] Target Region:           %AWS_REGION%

REM 2. Build Backend Lambda
echo.
echo [2/5] Building TypeScript Backend...
call npm --prefix backend run build
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Backend build failed.
    exit /b 1
)

REM 3. Package and Deploy Serverless Infrastructure
echo.
echo [3/5] Building and Deploying SAM Serverless Stack...
call sam build
if %ERRORLEVEL% neq 0 (
    echo [ERROR] SAM build failed.
    exit /b 1
)

call sam deploy --stack-name consenzo-core-dev --region %AWS_REGION% --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM --resolve-s3 --no-confirm-changeset
if %ERRORLEVEL% neq 0 (
    echo [ERROR] SAM deploy failed.
    exit /b 1
)

REM 4. Retrieve Outputs
echo.
echo [4/5] Discovering Production Stack Endpoints...
for /f "tokens=*" %%a in ('aws cloudformation describe-stacks --stack-name consenzo-core-dev --region %AWS_REGION% --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" --output text') do set API_URL=%%a
for /f "tokens=*" %%b in ('aws cloudformation describe-stacks --stack-name consenzo-core-dev --region %AWS_REGION% --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" --output text') do set BUCKET_NAME=%%b
for /f "tokens=*" %%c in ('aws cloudformation describe-stacks --stack-name consenzo-core-dev --region %AWS_REGION% --query "Stacks[0].Outputs[?OutputKey=='FrontendWebsiteUrl'].OutputValue" --output text') do set WEBSITE_URL=%%c

echo [OK] API Gateway Endpoint: %API_URL%
echo [OK] Frontend S3 Bucket:   %BUCKET_NAME%

REM 5. Build and Deploy Frontend
echo.
echo [5/5] Building and Deploying Frontend SPA...
set VITE_API_URL=%API_URL%
call npm --prefix frontend run build
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Frontend build failed.
    exit /b 1
)

aws s3 sync frontend/dist s3://%BUCKET_NAME%/ --delete --region %AWS_REGION%
if %ERRORLEVEL% neq 0 (
    echo [ERROR] S3 frontend sync failed.
    exit /b 1
)

echo.
echo ================================================================
echo   CONSENZO SUCCESSFULLY DEPLOYED TO AWS!
echo ================================================================
echo   Web Application URL: %WEBSITE_URL%
echo   API Gateway URL:     %API_URL%
echo ================================================================
