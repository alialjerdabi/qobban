Add-Type -AssemblyName System.Drawing

$project = Split-Path -Parent $MyInvocation.MyCommand.Path
$exports = Join-Path $project 'exports'
New-Item -ItemType Directory -Force -Path $exports | Out-Null

$items = @(
    @{ Source = 'base-images/custom-transport-trolley-editorial-base-v1.png'; Output = 'custom-transport-trolley-editorial-base-v1-1080x1350.png' },
    @{ Source = 'covers/custom-transport-trolley-launch-cover-v1.png'; Output = 'custom-transport-trolley-launch-cover-v1-1080x1350.png' },
    @{ Source = 'base-images/custom-transport-trolley-metal-deck-base-v2.png'; Output = 'custom-transport-trolley-metal-deck-base-v2-1080x1350.png' },
    @{ Source = 'covers/custom-transport-trolley-metal-deck-launch-cover-v2.png'; Output = 'custom-transport-trolley-metal-deck-launch-cover-v2-1080x1350.png' }
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

            $graphics.DrawImage($source, 0, 0, 1080, 1350)
            $scale = [Math]::Min(1080.0 / $source.Width, 1350.0 / $source.Height)
            $width = [int][Math]::Round($source.Width * $scale)
            $height = [int][Math]::Round($source.Height * $scale)
            $x = [int][Math]::Floor((1080 - $width) / 2)
            $y = [int][Math]::Floor((1350 - $height) / 2)

            if ($x -gt 0) {
                $tint = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(90, 17, 19, 19))
                try {
                    $graphics.FillRectangle($tint, 0, 0, $x, 1350)
                    $graphics.FillRectangle($tint, $x + $width, 0, 1080 - ($x + $width), 1350)
                }
                finally {
                    $tint.Dispose()
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

$rendered = @()
foreach ($item in $items) {
    $sourcePath = Join-Path $project $item.Source
    $outputPath = Join-Path $exports $item.Output
    Export-Instagram45 -SourcePath $sourcePath -OutputPath $outputPath
    $rendered += $outputPath
}

$sheet = New-Object System.Drawing.Bitmap (20 + ($rendered.Count * 380)), 510
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
$sheet.Save((Join-Path $exports 'custom-transport-trolley-versions-contact-sheet.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$sheet.Dispose()

Get-ChildItem -LiteralPath $exports -Filter '*.png' | Select-Object Name, Length
