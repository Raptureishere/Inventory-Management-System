# API Testing Script for PowerShell

Write-Host "=== Testing Inventory Management API ===" -ForegroundColor Cyan
Write-Host ""

# 1. Health Check
Write-Host "1. Health Check..." -ForegroundColor Yellow
$health = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method Get
Write-Host "Status: $($health.status)" -ForegroundColor Green
Write-Host ""

# 2. Register Admin User
Write-Host "2. Registering Admin User..." -ForegroundColor Yellow
$registerBody = @{
    username = "admin"
    password = "admin123"
    role = "admin"
    fullName = "System Administrator"
    email = "admin@clinic.com"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/register" `
        -Method Post `
        -ContentType "application/json" `
        -Body $registerBody
    Write-Host "User registered successfully!" -ForegroundColor Green
    Write-Host "User ID: $($registerResponse.user.id)" -ForegroundColor Green
} catch {
    Write-Host "Registration failed (user may already exist): $($_.Exception.Message)" -ForegroundColor Yellow
}
Write-Host ""

# 3. Login
Write-Host "3. Logging in..." -ForegroundColor Yellow
$loginBody = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $loginBody

Write-Host "Login successful!" -ForegroundColor Green
Write-Host "Token: $($loginResponse.token.Substring(0, 50))..." -ForegroundColor Green
$token = $loginResponse.token
Write-Host ""

# 4. Test Protected Endpoint - Get Items
Write-Host "4. Testing Protected Endpoint (Get Items)..." -ForegroundColor Yellow
$headers = @{
    Authorization = "Bearer $token"
}

$items = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/items" `
    -Method Get `
    -Headers $headers

Write-Host "Items retrieved successfully!" -ForegroundColor Green
Write-Host "Total items: $($items.data.Count)" -ForegroundColor Green
Write-Host ""

# 5. Get Users (Admin only)
Write-Host "5. Testing Admin Endpoint (Get Users)..." -ForegroundColor Yellow
$users = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/users" `
    -Method Get `
    -Headers $headers

Write-Host "Users retrieved successfully!" -ForegroundColor Green
Write-Host "Total users: $($users.Count)" -ForegroundColor Green
Write-Host ""

Write-Host "=== All Tests Passed! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Your JWT Token (save this):" -ForegroundColor Cyan
Write-Host $token -ForegroundColor White
