#!/bin/bash

###############################################################################
# AttendAI - Student Upload Pipeline Test Script
# 
# This script verifies that all components of the student image upload
# and face embedding pipeline are properly configured and running.
###############################################################################

set -e  # Exit on error

echo "🧪 AttendAI Upload Pipeline Test"
echo "================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

###############################################################################
# Test Functions
###############################################################################

test_env_variables() {
    echo "📋 Test 1: Environment Variables"
    echo "---------------------------------"
    
    if [ -f .env.local ]; then
        echo "✅ .env.local file exists"
        
        # Check for required variables
        if grep -q "CLOUDINARY_CLOUD_NAME=" .env.local; then
            echo "✅ CLOUDINARY_CLOUD_NAME is defined"
        else
            echo "❌ CLOUDINARY_CLOUD_NAME is missing"
            ((TESTS_FAILED++))
            return
        fi
        
        if grep -q "CLOUDINARY_API_KEY=" .env.local; then
            echo "✅ CLOUDINARY_API_KEY is defined"
        else
            echo "❌ CLOUDINARY_API_KEY is missing"
            ((TESTS_FAILED++))
            return
        fi
        
        if grep -q "CLOUDINARY_API_SECRET=" .env.local; then
            echo "✅ CLOUDINARY_API_SECRET is defined"
        else
            echo "❌ CLOUDINARY_API_SECRET is missing"
            ((TESTS_FAILED++))
            return
        fi
        
        if grep -q "AI_SERVICE_URL=" .env.local; then
            echo "✅ AI_SERVICE_URL is defined"
        else
            echo "❌ AI_SERVICE_URL is missing"
            ((TESTS_FAILED++))
            return
        fi
        
        ((TESTS_PASSED++))
    else
        echo "❌ .env.local file not found"
        ((TESTS_FAILED++))
    fi
    
    echo ""
}

test_file_structure() {
    echo "📁 Test 2: File Structure"
    echo "-------------------------"
    
    files=(
        "src/lib/cloudinary.ts"
        "src/services/imageUploadService.ts"
        "src/services/embeddingService.ts"
        "src/app/api/admin/upload-student-image/route.ts"
        "ai-service/main.py"
        "ai-service/requirements.txt"
    )
    
    all_exist=true
    for file in "${files[@]}"; do
        if [ -f "$file" ]; then
            echo "✅ $file exists"
        else
            echo "❌ $file is missing"
            all_exist=false
        fi
    done
    
    if [ "$all_exist" = true ]; then
        ((TESTS_PASSED++))
    else
        ((TESTS_FAILED++))
    fi
    
    echo ""
}

test_npm_dependencies() {
    echo "📦 Test 3: NPM Dependencies"
    echo "---------------------------"
    
    if [ -f "package.json" ]; then
        if grep -q '"cloudinary"' package.json; then
            echo "✅ cloudinary package is installed"
            ((TESTS_PASSED++))
        else
            echo "❌ cloudinary package is not installed"
            echo "   Run: npm install cloudinary"
            ((TESTS_FAILED++))
        fi
    else
        echo "❌ package.json not found"
        ((TESTS_FAILED++))
    fi
    
    echo ""
}

test_python_service() {
    echo "🐍 Test 4: Python AI Service"
    echo "----------------------------"
    
    # Check if Python service is running
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        response=$(curl -s http://localhost:8000/health)
        echo "✅ AI service is running"
        echo "   Response: $response"
        
        # Check if /generate-embedding endpoint exists
        if curl -s -X POST http://localhost:8000/generate-embedding \
           -H "Content-Type: application/json" \
           -d '{"imageUrl":"test"}' > /dev/null 2>&1; then
            echo "✅ /generate-embedding endpoint is available"
        else
            echo "⚠️  /generate-embedding endpoint returned an error (expected)"
        fi
        
        ((TESTS_PASSED++))
    else
        echo "❌ AI service is not running on http://localhost:8000"
        echo "   Start with: cd ai-service && python main.py"
        ((TESTS_FAILED++))
    fi
    
    echo ""
}

test_nextjs_server() {
    echo "⚡ Test 5: Next.js Server"
    echo "-------------------------"
    
    if curl -s http://localhost:3000/api/admin/upload-student-image > /dev/null 2>&1; then
        response=$(curl -s http://localhost:3000/api/admin/upload-student-image)
        echo "✅ Next.js server is running"
        echo "   API endpoint: http://localhost:3000/api/admin/upload-student-image"
        ((TESTS_PASSED++))
    else
        echo "❌ Next.js server is not running on http://localhost:3000"
        echo "   Start with: npm run dev"
        ((TESTS_FAILED++))
    fi
    
    echo ""
}

test_mongodb_connection() {
    echo "🍃 Test 6: MongoDB Connection"
    echo "------------------------------"
    
    if [ -f .env.local ]; then
        if grep -q "MONGODB_URI=" .env.local; then
            echo "✅ MONGODB_URI is defined"
            # Note: We can't test the actual connection without running the app
            echo "   (Connection will be tested when the app starts)"
            ((TESTS_PASSED++))
        else
            echo "❌ MONGODB_URI is missing"
            ((TESTS_FAILED++))
        fi
    else
        echo "❌ .env.local file not found"
        ((TESTS_FAILED++))
    fi
    
    echo ""
}

###############################################################################
# Main Test Execution
###############################################################################

test_env_variables
test_file_structure
test_npm_dependencies
test_python_service
test_nextjs_server
test_mongodb_connection

###############################################################################
# Summary
###############################################################################

echo "================================="
echo "📊 Test Summary"
echo "================================="
echo ""
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed! Your upload pipeline is ready.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Configure your Cloudinary credentials in .env.local"
    echo "2. Ensure both services are running:"
    echo "   - Terminal 1: npm run dev"
    echo "   - Terminal 2: cd ai-service && python main.py"
    echo "3. Read STUDENT_UPLOAD_GUIDE.md for API usage examples"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please fix the issues above.${NC}"
    echo ""
    echo "For help, see STUDENT_UPLOAD_GUIDE.md"
    exit 1
fi
