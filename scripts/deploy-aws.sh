#!/usr/bin/env bash
set -e

echo "================================================================"
echo "  Consenzo AWS Serverless Production Deployment Pipeline"
echo "================================================================"
echo ""

# 1. Check AWS Authentication (supports IAM, SSO, Identity Center, Named Profile, Env)
echo "[1/5] Verifying AWS authentication..."
CALLER_ARN=$(aws sts get-caller-identity --query "Arn" --output text 2>/dev/null || true)
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text 2>/dev/null || true)

if [ -z "$CALLER_ARN" ]; then
    echo "[ERROR] No active AWS credentials found."
    echo "Please authenticate using your AWS setup:"
    echo "  - AWS SSO:  aws sso login --profile <your-profile>"
    echo "  - Named:    export AWS_PROFILE=<your-profile>"
    echo "  - Standard: aws configure"
    exit 1
fi

# Detect Region
AWS_REGION="${AWS_REGION:-$(aws configure get region 2>/dev/null || echo 'us-east-1')}"

echo "[OK] Authenticated Principal: $CALLER_ARN"
echo "[OK] Target Account:          $AWS_ACCOUNT_ID"
echo "[OK] Target Region:           $AWS_REGION"

# 2. Build Backend Lambda
echo ""
echo "[2/5] Building TypeScript Backend..."
npm --prefix backend run build

# 3. Package and Deploy Serverless Infrastructure (ZIP Lambda + API GW + DynamoDB + S3)
echo ""
echo "[3/5] Building and Deploying SAM Serverless Stack..."
sam build
sam deploy \
  --stack-name consenzo-prod \
  --region "$AWS_REGION" \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
  --resolve-s3 \
  --no-confirm-changeset

# 4. Retrieve Outputs
echo ""
echo "[4/5] Discovering Production Stack Endpoints..."
API_URL=$(aws cloudformation describe-stacks --stack-name consenzo-prod --region "$AWS_REGION" --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" --output text)
BUCKET_NAME=$(aws cloudformation describe-stacks --stack-name consenzo-prod --region "$AWS_REGION" --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" --output text)
WEBSITE_URL=$(aws cloudformation describe-stacks --stack-name consenzo-prod --region "$AWS_REGION" --query "Stacks[0].Outputs[?OutputKey=='FrontendWebsiteUrl'].OutputValue" --output text)

echo "[OK] API Gateway Endpoint: $API_URL"
echo "[OK] Frontend S3 Bucket:   $BUCKET_NAME"

# 5. Build and Deploy Frontend
echo ""
echo "[5/5] Building and Deploying Frontend SPA..."
VITE_API_URL="$API_URL" npm --prefix frontend run build
aws s3 sync frontend/dist "s3://${BUCKET_NAME}/" --delete --region "$AWS_REGION"

echo ""
echo "================================================================"
echo "  CONSENZO SUCCESSFULLY DEPLOYED TO AWS!"
echo "================================================================"
echo "  Web Application URL: $WEBSITE_URL"
echo "  API Gateway URL:     $API_URL"
echo "================================================================"
