param(
  [string]$SourcePath = ''
)

$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing

$repoRoot = Split-Path -Parent $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($SourcePath)) {
  $SourcePath = Join-Path $repoRoot 'public\assets\tactical-atlas-brand.png'
}

if (-not (Test-Path -LiteralPath $SourcePath)) {
  throw "Approved Tactical ATLAS artwork was not found at: $SourcePath"
}

$brandBackground = [System.Drawing.ColorTranslator]::FromHtml('#020B08')
$fullArtwork = [System.Drawing.RectangleF]::new(0, 0, 1254, 1254)
$discArtwork = [System.Drawing.RectangleF]::new(92, 0, 1070, 1070)
$sourceImage = [System.Drawing.Image]::FromFile($SourcePath)

function Export-BrandPng {
  param(
    [Parameter(Mandatory)]
    [string]$Destination,
    [Parameter(Mandatory)]
    [int]$Width,
    [Parameter(Mandatory)]
    [int]$Height,
    [Parameter(Mandatory)]
    [System.Drawing.RectangleF]$SourceRectangle,
    [double]$Scale = 1
  )

  $destinationDirectory = Split-Path -Parent $Destination
  [System.IO.Directory]::CreateDirectory($destinationDirectory) | Out-Null

  $bitmap = [System.Drawing.Bitmap]::new(
    $Width,
    $Height,
    [System.Drawing.Imaging.PixelFormat]::Format24bppRgb
  )
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)

  try {
    $graphics.Clear($brandBackground)
    $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

    $availableWidth = $Width * $Scale
    $availableHeight = $Height * $Scale
    $sourceRatio = $SourceRectangle.Width / $SourceRectangle.Height
    $destinationRatio = $availableWidth / $availableHeight

    if ($sourceRatio -gt $destinationRatio) {
      $drawWidth = $availableWidth
      $drawHeight = $drawWidth / $sourceRatio
    }
    else {
      $drawHeight = $availableHeight
      $drawWidth = $drawHeight * $sourceRatio
    }

    $destinationRectangle = [System.Drawing.RectangleF]::new(
      [single](($Width - $drawWidth) / 2),
      [single](($Height - $drawHeight) / 2),
      [single]$drawWidth,
      [single]$drawHeight
    )

    $graphics.DrawImage(
      $sourceImage,
      $destinationRectangle,
      $SourceRectangle,
      [System.Drawing.GraphicsUnit]::Pixel
    )

    $bitmap.Save($Destination, [System.Drawing.Imaging.ImageFormat]::Png)
  }
  finally {
    $graphics.Dispose()
    $bitmap.Dispose()
  }
}

try {
  Export-BrandPng -Destination (Join-Path $repoRoot 'public\assets\tactical-atlas-icon.png') -Width 512 -Height 512 -SourceRectangle $discArtwork -Scale 0.96
  Export-BrandPng -Destination (Join-Path $repoRoot 'public\icons\tactical-atlas-192.png') -Width 192 -Height 192 -SourceRectangle $fullArtwork
  Export-BrandPng -Destination (Join-Path $repoRoot 'public\icons\tactical-atlas-512.png') -Width 512 -Height 512 -SourceRectangle $fullArtwork
  Export-BrandPng -Destination (Join-Path $repoRoot 'public\icons\tactical-atlas-maskable-512.png') -Width 512 -Height 512 -SourceRectangle $fullArtwork -Scale 0.78
  Export-BrandPng -Destination (Join-Path $repoRoot 'public\icons\apple-touch-icon.png') -Width 180 -Height 180 -SourceRectangle $fullArtwork

  $iosIcon = Join-Path $repoRoot 'ios\App\App\Assets.xcassets\AppIcon.appiconset\AppIcon-512@2x.png'
  Export-BrandPng -Destination $iosIcon -Width 1024 -Height 1024 -SourceRectangle $fullArtwork

  $iosSplashDirectory = Join-Path $repoRoot 'ios\App\App\Assets.xcassets\Splash.imageset'
  foreach ($filename in @('splash-2732x2732.png', 'splash-2732x2732-1.png', 'splash-2732x2732-2.png')) {
    Export-BrandPng -Destination (Join-Path $iosSplashDirectory $filename) -Width 2732 -Height 2732 -SourceRectangle $fullArtwork -Scale 0.9
  }

  $androidResourceRoot = Join-Path $repoRoot 'android\app\src\main\res'
  $androidIcons = @(
    @{ Density = 'mdpi'; Legacy = 48; Foreground = 108 },
    @{ Density = 'hdpi'; Legacy = 72; Foreground = 162 },
    @{ Density = 'xhdpi'; Legacy = 96; Foreground = 216 },
    @{ Density = 'xxhdpi'; Legacy = 144; Foreground = 324 },
    @{ Density = 'xxxhdpi'; Legacy = 192; Foreground = 432 }
  )

  foreach ($icon in $androidIcons) {
    $directory = Join-Path $androidResourceRoot "mipmap-$($icon.Density)"
    Export-BrandPng -Destination (Join-Path $directory 'ic_launcher.png') -Width $icon.Legacy -Height $icon.Legacy -SourceRectangle $fullArtwork
    Export-BrandPng -Destination (Join-Path $directory 'ic_launcher_round.png') -Width $icon.Legacy -Height $icon.Legacy -SourceRectangle $discArtwork -Scale 0.9
    Export-BrandPng -Destination (Join-Path $directory 'ic_launcher_foreground.png') -Width $icon.Foreground -Height $icon.Foreground -SourceRectangle $discArtwork -Scale 0.68
  }

  $androidSplashes = @(
    @{ Folder = 'drawable'; Width = 480; Height = 320 },
    @{ Folder = 'drawable-land-mdpi'; Width = 480; Height = 320 },
    @{ Folder = 'drawable-land-hdpi'; Width = 800; Height = 480 },
    @{ Folder = 'drawable-land-xhdpi'; Width = 1280; Height = 720 },
    @{ Folder = 'drawable-land-xxhdpi'; Width = 1600; Height = 960 },
    @{ Folder = 'drawable-land-xxxhdpi'; Width = 1920; Height = 1280 },
    @{ Folder = 'drawable-port-mdpi'; Width = 320; Height = 480 },
    @{ Folder = 'drawable-port-hdpi'; Width = 480; Height = 800 },
    @{ Folder = 'drawable-port-xhdpi'; Width = 720; Height = 1280 },
    @{ Folder = 'drawable-port-xxhdpi'; Width = 960; Height = 1600 },
    @{ Folder = 'drawable-port-xxxhdpi'; Width = 1280; Height = 1920 }
  )

  foreach ($splash in $androidSplashes) {
    $destination = Join-Path $androidResourceRoot "$($splash.Folder)\splash.png"
    Export-BrandPng -Destination $destination -Width $splash.Width -Height $splash.Height -SourceRectangle $fullArtwork -Scale 0.9
  }
}
finally {
  $sourceImage.Dispose()
}

Write-Output 'Tactical ATLAS brand assets generated for web, Android, and iOS.'
