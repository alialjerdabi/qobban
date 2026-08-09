Add-Type -AssemblyName System.Drawing

$project = Split-Path -Parent $MyInvocation.MyCommand.Path
$exports = Join-Path $project 'exports'
New-Item -ItemType Directory -Force -Path $exports | Out-Null

$sets = @(
    @{
        Name = 'base-images'
        Items = @(
            'editorial-base-01-metal-stands-v3.png',
            'editorial-base-02-gas-cabinet-correct-mechanism-v3.png',
            'editorial-base-03-metal-side-table-v3.png'
        )
    },
    @{
        Name = 'covers'
        Items = @(
            'editorial-cover-01-masthead-v3.png',
            'editorial-cover-02-warm-plate-gas-correct-v3.png',
            'editorial-cover-03-type-horizon-v3.png'
        )
    }
)

function Export-Instagram45 {
    param([string]$SourcePath, [string]$OutputPath)

    $source = [System.Drawing.Image]::FromFile($SourcePath)
    try {
        $canvas = New-Object System.Drawing.Bitmap 1080, 1350
        $canvas.SetResolution(144, 144)
        $graphics = [System.Drawing.Graphics]::FromImage($canvas)
        try {
            $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
            $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
            $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

            # Fill the narrow side extensions with the same photograph, then tint them
            # so the complete native composition can remain undistorted in the center.
            $graphics.DrawImage($source, 0, 0, 1080, 1350)

            $scale = [Math]::Min(1080.0 / $source.Width, 1350.0 / $source.Height)
            $width = [int][Math]::Round($source.Width * $scale)
            $height = [int][Math]::Round($source.Height * $scale)
            $x = [int][Math]::Floor((1080 - $width) / 2)
            $y = [int][Math]::Floor((1350 - $height) / 2)

            if ($x -gt 0) {
                $sideTint = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(90, 17, 19, 19))
                try {
                    $graphics.FillRectangle($sideTint, 0, 0, $x, 1350)
                    $graphics.FillRectangle($sideTint, $x + $width, 0, 1080 - ($x + $width), 1350)
                }
                finally {
                    $sideTint.Dispose()
                }
            }

            $graphics.DrawImage($source, $x, $y, $width, $height)
        }
        finally {
            $graphics.Dispose()
        }

        $canvas.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $canvas.Dispose()
    }
    finally {
        $source.Dispose()
    }
}

foreach ($set in $sets) {
    $sourceDir = Join-Path $project $set.Name
    $rendered = @()

    foreach ($file in $set.Items) {
        $sourcePath = Join-Path $sourceDir $file
        $outputName = [System.IO.Path]::GetFileNameWithoutExtension($file) + '-1080x1350.png'
        $outputPath = Join-Path $exports $outputName
        Export-Instagram45 -SourcePath $sourcePath -OutputPath $outputPath
        $rendered += $outputPath
    }

    $sheet = New-Object System.Drawing.Bitmap 1160, 510
    $sheet.SetResolution(144, 144)
    $sheetGraphics = [System.Drawing.Graphics]::FromImage($sheet)
    try {
        $sheetGraphics.Clear([System.Drawing.Color]::FromArgb(10, 11, 11))
        $sheetGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        for ($i = 0; $i -lt $rendered.Count; $i++) {
            $image = [System.Drawing.Image]::FromFile($rendered[$i])
            try {
                $sheetGraphics.DrawImage($image, 20 + ($i * 380), 30, 360, 450)
            }
            finally {
                $image.Dispose()
            }
        }
    }
    finally {
        $sheetGraphics.Dispose()
    }

    $sheetPath = Join-Path $exports ("launch-offer-v3-editorial-{0}-contact-sheet.png" -f $set.Name)
    $sheet.Save($sheetPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $sheet.Dispose()
}

Get-ChildItem -LiteralPath $exports -Filter '*.png' | Select-Object Name, Length
