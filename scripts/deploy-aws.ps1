$ErrorActionPreference = "Stop"
$AWS_REGION = if ($env:AWS_REGION) { $env:AWS_REGION } else { "us-east-1" }

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  Consenzo AWS Serverless Production Deployment Pipeline" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verify AWS Identity
Write-Host "[1/5] Verifying AWS authentication..." -ForegroundColor Yellow
$identityJson = aws sts get-caller-identity --output json | ConvertFrom-Json
Write-Host "[OK] Authenticated Principal: $($identityJson.Arn)" -ForegroundColor Green
Write-Host "[OK] Target Account:          $($identityJson.Account)" -ForegroundColor Green
Write-Host "[OK] Target Region:           $AWS_REGION" -ForegroundColor Green
Write-Host ""

# 2. Build Backend
Write-Host "[2/5] Building TypeScript Backend..." -ForegroundColor Yellow
npm --prefix backend run build
Write-Host "[OK] Backend build completed." -ForegroundColor Green
Write-Host ""

# 3. SAM Build & Deploy
Write-Host "[3/5] Building and Deploying SAM Serverless Stack..." -ForegroundColor Yellow
sam build
sam deploy --stack-name consenzo-core-dev --region $AWS_REGION --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM --resolve-s3 --no-confirm-changeset
Write-Host "[OK] Serverless Stack deployed." -ForegroundColor Green
Write-Host ""

# 4. Discover Stack Outputs
Write-Host "[4/5] Discovering Production Stack Endpoints..." -ForegroundColor Yellow
$stack = aws cloudformation describe-stacks --stack-name consenzo-core-dev --region $AWS_REGION --output json | ConvertFrom-Json
$outputs = $stack.Stacks[0].Outputs

$apiUrl = ($outputs | Where-Object { $_.OutputKey -eq "ApiEndpoint" }).OutputValue
$bucketName = ($outputs | Where-Object { $_.OutputKey -eq "FrontendBucketName" }).OutputValue
$s3WebsiteUrl = ($outputs | Where-Object { $_.OutputKey -eq "FrontendWebsiteUrl" }).OutputValue
$cloudFrontUrl = ($outputs | Where-Object { $_.OutputKey -eq "CloudFrontWebsiteUrl" }).OutputValue
$cloudFrontId = ($outputs | Where-Object { $_.OutputKey -eq "CloudFrontDistributionId" }).OutputValue

Write-Host "[OK] API Gateway Endpoint: $apiUrl" -ForegroundColor Green
Write-Host "[OK] Frontend S3 Bucket:   $bucketName" -ForegroundColor Green
if ($cloudFrontUrl) { Write-Host "[OK] CloudFront HTTPS URL: $cloudFrontUrl" -ForegroundColor Green }
Write-Host ""

# 5. Build and Deploy Frontend
Write-Host "[5/5] Building and Deploying Frontend SPA..." -ForegroundColor Yellow
$env:VITE_API_URL = $apiUrl
npm --prefix frontend run build
aws s3 sync frontend/dist "s3://$bucketName/" --delete --region $AWS_REGION
Write-Host "[OK] Frontend synced to S3." -ForegroundColor Green

if ($cloudFrontId) {
    Write-Host "Invalidating CloudFront Edge Cache..." -ForegroundColor Yellow
    aws cloudfront create-invalidation --distribution-id $cloudFrontId --paths "/*"
    Write-Host "[OK] CloudFront cache invalidation triggered." -ForegroundColor Green
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  CONSENZO SUCCESSFULLY DEPLOYED TO AWS!" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
if ($cloudFrontUrl) {
    Write-Host "  Secure Web App (Mobile/Desktop): $cloudFrontUrl" -ForegroundColor Green
}
Write-Host "  S3 Website (Direct HTTP):        $s3WebsiteUrl" -ForegroundColor Green
Write-Host "  API Gateway URL:                 $apiUrl" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Cyan
