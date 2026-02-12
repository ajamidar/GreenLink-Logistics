# Test script to verify Python endpoint works
$body = @{
    orders = @(
        @{
            id = "411791c9-3a81-4972-ad51-ff0f2d5cbe17"
            latitude = 40.7128
            longitude = -74.006
            weightKg = 20.0
            serviceDurationMin = 15.0
        },
        @{
            id = "5b0f0905-31b3-4db4-abc9-2e92d5189fe0"
            latitude = 40.7306
            longitude = -73.9352
            weightKg = 10.0
            serviceDurationMin = 20.0
        }
    )
    vehicles = @(
        @{
            id = "7b430aa1-550a-4dbd-9d90-ed914abaa4cc"
            capacityKg = 1500.0
            startLat = 40.7128
            startLon = -74.006
        }
    )
} | ConvertTo-Json -Depth 10

Write-Host "Sending request to Python..."
Write-Host $body

try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/solve" -Method Post -Body $body -ContentType "application/json"
    Write-Host "Success! Response:"
    Write-Host $response.Content
} catch {
    Write-Host "Error:"
    Write-Host $_.Exception.Message
    Write-Host $_.Exception.Response
}
