Add-Type -AssemblyName System.Drawing

$project = Split-Path -Parent $MyInvocation.MyCommand.Path
$exports = Join-Path $project 'exports'
New-Item -ItemType Directory -Force -Path $exports | Out-Null

$sets = @(
    @{
        Name = 'base-images'
        Items = @(
            'launch-offer-base-01-metal-stands-v2.png',
            'launch-offer-base-02-gas-cabinet-v2.png',
            'launch-offer-base-03-metal-side-table-v2.png'
        )
    },
    @{
        Name = 'covers'
        Items = @(
            'launch-offer-cover-01-centered-stack-v2.png',
            'launch-offer-cover-02-centered-frame-v2.png',
            'launch-offer-cover-03-centered-band-v2.png'
        )
    }
)

function Export-Instagram45 {
    param(
        [Parameter(Mandatory = $true)][string]$SourcePath,
        [Parameter(Mandatory = $true)][string]$OutputPath
    )

    $source = [System.Drawing.Image]::FromFile($SourcePath)
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

            if ($x -gt 0) {
                $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(92, 255, 194, 32)), 1
                try {
                    $graphics.DrawLine($pen, $x - 1, 0, $x - 1, 1350)
                    $graphics.DrawLine($pen, $x + $width, 0, $x + $width, 1350)
                }
                finally {
                    $pen.Dispose()
                }
            }
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
    $rendered = @()
    $sourceDir = Join-Path $project $set.Name

    foreach ($fileName in $set.Items) {
        $sourcePath = Join-Path $sourceDir $fileName
        $outputName = [System.IO.Path]::GetFileNameWithoutExtension($fileName) + '-1080x1350.png'
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

    $sheetPath = Join-Path $exports ("launch-offer-v2-{0}-contact-sheet.png" -f $set.Name)
    $sheet.Save($sheetPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $sheet.Dispose()
}

Get-ChildItem -LiteralPath $exports -Filter '*.png' | Select-Object Name, Length
