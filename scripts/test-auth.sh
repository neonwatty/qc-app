#!/bin/bash

# Quick authentication test script

echo "Testing authentication flow..."
echo ""

# Test login endpoint
echo "1. Testing login with alex@example.com..."
response=$(curl -s -X POST http://localhost:3000/api/auth/sign_in \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5173" \
  -d '{
    "user": {
      "email": "alex@example.com",
      "password": "password123"
    }
  }' \
  -i)

# Check for Authorization header (case-insensitive)
if echo "$response" | grep -iq "authorization: bearer"; then
  echo "✓ Authentication successful! JWT token received in Authorization header"

  # Extract the token (case-insensitive)
  token=$(echo "$response" | grep -i "authorization: bearer" | sed 's/[Aa]uthorization: [Bb]earer //' | tr -d '\r')
  echo "  Token: ${token:0:50}..."

  # Check response body
  if echo "$response" | grep -q "Alex Chen"; then
    echo "✓ User data received in response body"
  else
    echo "✗ User data missing from response"
  fi

  # Extract refresh token
  if echo "$response" | grep -q "refresh_token"; then
    echo "✓ Refresh token received"
  else
    echo "✗ Refresh token missing"
  fi
else
  echo "✗ Authentication failed"
  echo ""
  echo "Response:"
  echo "$response"
fi

echo ""
echo "Done!"
