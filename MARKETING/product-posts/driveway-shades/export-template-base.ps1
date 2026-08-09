param(
    [Parameter(Mandatory = $true)]
    [string]$InputPath,

    [Parameter(Mandatory = $true)]
    [string]$OutputPath
)

Add-Type -AssemblyName System.Drawing

$targetWidth = 577
$targetHeight = 1266
$source = [System.Drawing.Image]::FromFile($InputPath)

try {
    $sourceAspect = $source.Width / $source.Height
    $targetAspect = $targetWidth / $targetHeight
    if ([Math]::Abs($sourceAspect - $targetAspect) -gt 0.002) {
        throw "Input aspect ratio does not match the template's 577:1266 image zone."
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
            $graphics.DrawImage($source, 0, 0, $targetWidth, $targetHeight)
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
