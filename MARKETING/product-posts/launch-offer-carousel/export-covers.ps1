Add-Type -AssemblyName System.Drawing

$project = Split-Path -Parent $MyInvocation.MyCommand.Path
$backgrounds = Join-Path $project 'backgrounds'
$exports = Join-Path $project 'exports'

$items = @(
    @{ Source = 'launch-offer-cover-01-metal-stands-generated.png'; Export = 'launch-offer-cover-01-metal-stands-1080x1350.png' },
    @{ Source = 'launch-offer-cover-02-gas-cabinet-generated.png'; Export = 'launch-offer-cover-02-gas-cabinet-1080x1350.png' },
    @{ Source = 'launch-offer-cover-03-metal-side-table-generated.png'; Export = 'launch-offer-cover-03-metal-side-table-1080x1350.png' }
)

$rendered = @()

foreach ($item in $items) {
    $sourcePath = Join-Path $backgrounds $item.Source
    $exportPath = Join-Path $exports $item.Export
    $source = [System.Drawing.Image]::FromFile($sourcePath)
    try {
        $canvas = New-Object System.Drawing.Bitmap 1080, 1350
        $canvas.SetResolution(144, 144)
        $graphics = [System.Drawing.Graphics]::FromImage($canvas)
        try {
            $graphics.Clear([System.Drawing.Color]::FromArgb(17, 19, 19))
            $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
            $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
            $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

            $scale = [Math]::Min(1080.0 / $source.Width, 1350.0 / $source.Height)
            $width = [int][Math]::Round($source.Width * $scale)
            $height = [int][Math]::Round($source.Height * $scale)
            $x = [int][Math]::Floor((1080 - $width) / 2)
            $y = [int][Math]::Floor((1350 - $height) / 2)
            $graphics.DrawImage($source, $x, $y, $width, $height)

            $edgePen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(72, 255, 194, 32)), 1
            try {
                if ($x -gt 0) {
                    $graphics.DrawLine($edgePen, $x - 1, 0, $x - 1, 1350)
                    $graphics.DrawLine($edgePen, $x + $width, 0, $x + $width, 1350)
                }
            }
            finally {
                $edgePen.Dispose()
            }
        }
        finally {
            $graphics.Dispose()
        }

        $canvas.Save($exportPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $rendered += $exportPath
        $canvas.Dispose()
    }
    finally {
        $source.Dispose()
    }
}

$sheet = New-Object System.Drawing.Bitmap 1160, 510
$sheet.SetResolution(144, 144)
$sheetGraphics = [System.Drawing.Graphics]::FromImage($sheet)
try {
    $sheetGraphics.Clear([System.Drawing.Color]::FromArgb(10, 11, 11))
    $sheetGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    for ($i = 0; $i -lt $rendered.Count; $i++) {
        $cover = [System.Drawing.Image]::FromFile($rendered[$i])
        try {
            $sheetGraphics.DrawImage($cover, 20 + ($i * 380), 30, 360, 450)
        }
        finally {
            $cover.Dispose()
        }
    }
}
finally {
    $sheetGraphics.Dispose()
}
$sheet.Save((Join-Path $exports 'launch-offer-covers-contact-sheet.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$sheet.Dispose()

$rendered | ForEach-Object { Get-Item $_ | Select-Object FullName, Length }
Get-Item (Join-Path $exports 'launch-offer-covers-contact-sheet.png') | Select-Object FullName, Length
