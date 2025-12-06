Write-Host "Testing API Health..." -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri 'http://localhost:5000/health' -Method GET
    Write-Host "✅ Health Check: " -ForegroundColor Green -NoNewline
    Write-Host "$($health.status)" -ForegroundColor White
} catch {
    Write-Host "❌ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTesting API Root..." -ForegroundColor Cyan
try {
    $api = Invoke-RestMethod -Uri 'http://localhost:5000/api/v1' -Method GET
    Write-Host "✅ API Root: " -ForegroundColor Green -NoNewline
    Write-Host "$($api.message)" -ForegroundColor White
} catch {
    Write-Host "❌ API Root Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTesting Login Endpoint..." -ForegroundColor Cyan
try {
    $body = @{
        username = 'admin'
        password = 'admin123'
    } | ConvertTo-Json
    
    $login = Invoke-RestMethod -Uri 'http://localhost:5000/api/v1/auth/login' -Method POST -Body $body -ContentType 'application/json'
    Write-Host "✅ Login: " -ForegroundColor Green -NoNewline
    Write-Host "Token received for user: $($login.user.username) (role: $($login.user.role))" -ForegroundColor White
} catch {
    Write-Host "❌ Login Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTesting Items Endpoint (with auth)..." -ForegroundColor Cyan
try {
    # First login
    $body = @{
        username = 'admin'
        password = 'admin123'
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri 'http://localhost:5000/api/v1/auth/login' -Method POST -Body $body -ContentType 'application/json'
    $token = $loginResponse.token
    
    # Then get items
    $headers = @{
        'Authorization' = "Bearer $token"
    }
    $items = Invoke-RestMethod -Uri 'http://localhost:5000/api/v1/items' -Method GET -Headers $headers
    Write-Host "✅ Items: " -ForegroundColor Green -NoNewline
    Write-Host "Retrieved $($items.data.Count) items (Total: $($items.pagination.total))" -ForegroundColor White
} catch {
    Write-Host "❌ Items Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nFrontend Status..." -ForegroundColor Cyan
try {
    $frontend = Invoke-WebRequest -Uri 'http://localhost:8000' -Method GET -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Frontend: " -ForegroundColor Green -NoNewline
    Write-Host "Responding (Status: $($frontend.StatusCode))" -ForegroundColor White
} catch {
    Write-Host "❌ Frontend Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n" -NoNewline
Write-Host "============================================" -ForegroundColor Yellow
Write-Host "System Status Summary" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Yellow
Write-Host "Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Health:   http://localhost:5000/health" -ForegroundColor Cyan
Write-Host "API Docs: http://localhost:5000/api/v1" -ForegroundColor Cyan
