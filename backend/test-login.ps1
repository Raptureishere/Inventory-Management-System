$body = @{
    username = 'admin'
    password = 'admin123'
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri 'http://localhost:5000/api/v1/auth/login' -Method POST -Body $body -ContentType 'application/json'

Write-Host "Login Response:" -ForegroundColor Green
$response | ConvertTo-Json -Depth 10
