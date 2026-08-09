param(
    [string]$OutputPath = (Join-Path $PSScriptRoot 'decorative-metal-stands-panel-true-vector.svg')
)

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$fontRoot = Join-Path $projectRoot 'week-1-qobban-v2\assets\fonts\almarai'
$templatePath = Join-Path $PSScriptRoot 'decorative-metal-stands-panel-vector.template.svg'

$regular = [Convert]::ToBase64String([IO.File]::ReadAllBytes((Join-Path $fontRoot 'Almarai-Regular.ttf')))
$bold = [Convert]::ToBase64String([IO.File]::ReadAllBytes((Join-Path $fontRoot 'Almarai-Bold.ttf')))
$extraBold = [Convert]::ToBase64String([IO.File]::ReadAllBytes((Join-Path $fontRoot 'Almarai-ExtraBold.ttf')))

$svg = [IO.File]::ReadAllText($templatePath)
$svg = $svg.Replace('__ALMARAI_REGULAR__', $regular)
$svg = $svg.Replace('__ALMARAI_BOLD__', $bold)
$svg = $svg.Replace('__ALMARAI_EXTRABOLD__', $extraBold)

[IO.File]::WriteAllText($OutputPath, $svg, [Text.UTF8Encoding]::new($false))
Write-Output $OutputPath
