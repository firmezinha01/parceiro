# Auto-reconnecting tunnel loop for Pinggy
$ErrorActionPreference = "SilentlyContinue"

while ($true) {
    if (Test-Path "tunnel_out.log") {
        Remove-Item "tunnel_out.log" -Force
    }

    $proc = Start-Process ssh -ArgumentList "-p 443 -o StrictHostKeyChecking=no -o ServerAliveInterval=15 -R0:localhost:5173 a.pinggy.io" -NoNewWindow -PassThru -RedirectStandardOutput "tunnel_out.log"
    
    for ($i = 0; $i -lt 15; $i++) {
        Start-Sleep -Seconds 1
        if (Test-Path "tunnel_out.log") {
            $content = Get-Content "tunnel_out.log" -Raw
            if ($content -match "(https://[a-zA-Z0-9-]+\.run\.pinggy-free\.link)") {
                $url = $matches[1]
                Set-Content -Path "tunnel_url.txt" -Value $url -Force
                break
            }
        }
    }

    $proc.WaitForExit()
    Start-Sleep -Seconds 3
}
