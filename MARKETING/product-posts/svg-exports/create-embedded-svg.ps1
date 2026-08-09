param(
    [Parameter(Mandatory = $true)]
    [string]$InputPath,

    [Parameter(Mandatory = $true)]
    [string]$OutputPath,

    [Parameter(Mandatory = $true)]
    [string]$Title
)

Add-Type -AssemblyName System.Drawing

$image = [System.Drawing.Image]::FromFile($InputPath)
try {
    $width = $image.Width
    $height = $image.Height
}
finally {
    $image.Dispose()
}

$bytes = [System.IO.File]::ReadAllBytes($InputPath)
$base64 = [Convert]::ToBase64String($bytes)
$escapedTitle = [System.Security.SecurityElement]::Escape($Title)
$outputDirectory = Split-Path -Parent $OutputPath

if (-not (Test-Path -LiteralPath $outputDirectory)) {
    New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
}

$svg = @"
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg"
     width="$width"
     height="$height"
     viewBox="0 0 $width $height"
     role="img"
     aria-labelledby="title description">
  <title id="title">$escapedTitle</title>
  <desc id="description">Self-contained Qobban artwork. The photographic design is embedded as a lossless PNG layer, so no external image link is required.</desc>
  <metadata>
    Qobban marketing artwork; embedded image/png; native canvas ${width}x${height}px.
  </metadata>
  <rect id="canvas-background" x="0" y="0" width="$width" height="$height" fill="#101112"/>
  <image id="qobban-artwork"
         x="0"
         y="0"
         width="$width"
         height="$height"
         preserveAspectRatio="xMidYMid meet"
         href="data:image/png;base64,$base64"/>
</svg>
"@

[System.IO.File]::WriteAllText($OutputPath, $svg, [System.Text.UTF8Encoding]::new($false))
Write-Output $OutputPath
