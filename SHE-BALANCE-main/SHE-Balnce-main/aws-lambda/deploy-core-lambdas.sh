#!/bin/bash
# Automated deployment script for core Lambda functions (Linux/Mac)
# SHE-BALANCE Platform

echo "========================================"
echo " SHE-BALANCE Core Lambda Deployment"
echo "========================================"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "ERROR: AWS CLI is not installed"
    echo "Please install AWS CLI: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo "Please install Node.js: https://nodejs.org/"
    exit 1
fi

echo "[1/4] Installing dependencies for all Lambda functions..."
echo ""

# Function to install dependencies
install_deps() {
    local func_name=$1
    echo "Installing $func_name dependencies..."
    cd "$func_name" || exit 1
    npm install --production
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install $func_name dependencies"
        exit 1
    fi
    cd ..
}

# Authentication functions
install_deps "auth-login"
install_deps "auth-register"

# User management functions
install_deps "user-get-profile"
install_deps "user-update-profile"

# Order management functions
install_deps "order-create"
install_deps "order-list"
install_deps "order-update-status"
install_deps "order-update-progress"

# Artisan management functions
install_deps "artisan-list"
install_deps "artisan-get-details"

echo ""
echo "[2/4] Creating deployment packages..."
echo ""

# Function to create zip package
create_package() {
    local func_name=$1
    echo "Packaging $func_name..."
    cd "$func_name" || exit 1
    zip -r "../${func_name}.zip" . -x "*.git*" "*.DS_Store"
    cd ..
}

# Create packages for all functions
create_package "auth-login"
create_package "auth-register"
create_package "user-get-profile"
create_package "user-update-profile"
create_package "order-create"
create_package "order-list"
create_package "order-update-status"
create_package "order-update-progress"
create_package "artisan-list"
create_package "artisan-get-details"

echo ""
echo "[3/4] Deployment packages created successfully!"
echo ""
echo "The following ZIP files are ready for deployment:"
echo "  - auth-login.zip"
echo "  - auth-register.zip"
echo "  - user-get-profile.zip"
echo "  - user-update-profile.zip"
echo "  - order-create.zip"
echo "  - order-list.zip"
echo "  - order-update-status.zip"
echo "  - order-update-progress.zip"
echo "  - artisan-list.zip"
echo "  - artisan-get-details.zip"
echo ""

echo "[4/4] Next Steps:"
echo ""
echo "1. Deploy Lambda functions using AWS CLI or Console"
echo "2. Configure environment variables for each function"
echo "3. Set up API Gateway endpoints"
echo "4. Test all endpoints"
echo ""
echo "For detailed deployment instructions, see:"
echo "  CORE_LAMBDAS_DEPLOYMENT_GUIDE.md"
echo ""

echo "========================================"
echo " Deployment packages ready!"
echo "========================================"
echo ""
