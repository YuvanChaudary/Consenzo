$ErrorActionPreference = "Stop"
$AWS_REGION = "us-east-1"
$STACK_NAME = "consenzo-core-dev"

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  Consenzo AWS CloudFront & HTTPS Production Deployment" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Build Backend
Write-Host "[1/4] Building Backend Lambda..." -ForegroundColor Yellow
npm --prefix backend run build
Write-Host "[OK] Backend built successfully." -ForegroundColor Green
Write-Host ""

# 2. SAM Build & Deploy
Write-Host "[2/4] Deploying Serverless Stack with CloudFront CDN..." -ForegroundColor Yellow
sam build
sam deploy --stack-name $STACK_NAME --region $AWS_REGION --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM --resolve-s3 --no-confirm-changeset
Write-Host "[OK] Stack deployment complete." -ForegroundColor Green
Write-Host ""

# 3. Retrieve Outputs
Write-Host "[3/4] Discovering Endpoints..." -ForegroundColor Yellow
$stack = aws cloudformation describe-stacks --stack-name $STACK_NAME --region $AWS_REGION --output json | ConvertFrom-Json
$outputs = $stack.Stacks[0].Outputs

$apiUrl = ($outputs | Where-Object { $_.OutputKey -eq "ApiEndpoint" }).OutputValue
$bucketName = ($outputs | Where-Object { $_.OutputKey -eq "FrontendBucketName" }).OutputValue
$s3WebsiteUrl = ($outputs | Where-Object { $_.OutputKey -eq "FrontendWebsiteUrl" }).OutputValue
$cloudFrontUrl = ($outputs | Where-Object { $_.OutputKey -eq "CloudFrontWebsiteUrl" }).OutputValue
$cloudFrontId = ($outputs | Where-Object { $_.OutputKey -eq "CloudFrontDistributionId" }).OutputValue

Write-Host "[OK] API Gateway:   $apiUrl" -ForegroundColor Green
Write-Host "[OK] S3 Bucket:     $bucketName" -ForegroundColor Green
if ($cloudFrontUrl) {
    Write-Host "[OK] CloudFront:    $cloudFrontUrl" -ForegroundColor Green
}
Write-Host ""

# 4. Build and Sync Frontend
Write-Host "[4/4] Building & Syncing Frontend SPA..." -ForegroundColor Yellow
$env:VITE_API_URL = $apiUrl
npm --prefix frontend run build
aws s3 sync frontend/dist "s3://$bucketName/" --delete --region $AWS_REGION
Write-Host "[OK] Frontend synced to S3." -ForegroundColor Green

if ($cloudFrontId) {
    Write-Host "Invalidating CloudFront Edge Cache..." -ForegroundColor Yellow
    aws cloudfront create-invalidation --distribution-id $cloudFrontId --paths "/*"
    Write-Host "[OK] Cache invalidation triggered." -ForegroundColor Green
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  DEPLOYMENT COMPLETE!" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
if ($cloudFrontUrl) {
    Write-Host "  SECURE HTTPS URL (Mobile & Desktop): $cloudFrontUrl" -ForegroundColor Green
}
Write-Host "  S3 Fallback URL:                     $s3WebsiteUrl" -ForegroundColor Yellow
Write-Host "  API Gateway URL:                     $apiUrl" -ForegroundColor Yellow
Write-Host "================================================================" -ForegroundColor Cyan
