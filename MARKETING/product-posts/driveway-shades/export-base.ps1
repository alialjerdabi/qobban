param(
    [Parameter(Mandatory = $true)]
    [string]$InputPath,

    [Parameter(Mandatory = $true)]
    [string]$OutputPath
)

Add-Type -AssemblyName System.Drawing

$source = [System.Drawing.Image]::FromFile($InputPath)
try {
    $targetWidth = 1080
    $targetHeight = 1350
    $targetAspect = $targetWidth / $targetHeight
    $sourceAspect = $source.Width / $source.Height

    if ($sourceAspect -gt $targetAspect) {
        $cropHeight = $source.Height
        $cropWidth = [int][Math]::Round($cropHeight * $targetAspect)
        $cropX = [int][Math]::Round(($source.Width - $cropWidth) / 2)
        $cropY = 0
    }
    else {
        $cropWidth = $source.Width
        $cropHeight = [int][Math]::Round($cropWidth / $targetAspect)
        $cropX = 0
        $cropY = [int][Math]::Round(($source.Height - $cropHeight) / 2)
    }

    $outputDirectory = Split-Path -Parent $OutputPath
    if (-not (Test-Path -LiteralPath $outputDirectory)) {
        New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
    }

    $bitmap = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight)
    try {
        $bitmap.SetResolution(300, 300)
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        try {
            $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
            $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
            $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
            $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

            $destinationRectangle = New-Object System.Drawing.Rectangle(0, 0, $targetWidth, $targetHeight)
            $sourceRectangle = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropWidth, $cropHeight)
            $graphics.DrawImage($source, $destinationRectangle, $sourceRectangle, [System.Drawing.GraphicsUnit]::Pixel)
        }
        finally {
            $graphics.Dispose()
        }

        $bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    }
    finally {
        $bitmap.Dispose()
    }
}
finally {
    $source.Dispose()
}

Write-Output $OutputPath
