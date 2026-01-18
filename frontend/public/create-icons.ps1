# Create simple PNG icons for PWA
Add-Type -AssemblyName System.Drawing

function Create-Icon($size, $outputPath) {
    $bitmap = New-Object System.Drawing.Bitmap $size, $size
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)

    # Fill background (green color)
    $backgroundColor = [System.Drawing.Color]::FromArgb(16, 185, 129) # #10b981
    $graphics.Clear($backgroundColor)

    # Draw "T" letter in dark color
    $font = New-Object System.Drawing.Font("Arial", $size * 0.5, [System.Drawing.FontStyle]::Bold)
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(10, 10, 15))
    $stringFormat = [System.Drawing.StringFormat]::GenericDefault
    $stringFormat.Alignment = [System.Drawing.StringAlignment]::Center
    $stringFormat.LineAlignment = [System.Drawing.StringAlignment]::Center

    $graphics.DrawString("T", $font, $brush, $size / 2, $size / 2, $stringFormat)

    $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $bitmap.Dispose()
}

# Create icons
Create-Icon 192 "frontend/public/icon-192x192.png"
Create-Icon 512 "frontend/public/icon-512x512.png"

Write-Host "Icons created successfully!"
