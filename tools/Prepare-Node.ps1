$ErrorActionPreference='Stop'
$projectRoot=Split-Path $PSScriptRoot -Parent
$releases=Invoke-RestMethod 'https://nodejs.org/dist/index.json'
$release=@($releases | ForEach-Object {$_} | Where-Object {$_.version -like 'v24.*' -and $_.lts})[0]
$version=[string]$release.version
if($version -notmatch '^v24\.\d+\.\d+$'){throw 'Versão LTS inesperada.'}
$folder=Join-Path $projectRoot '.tools';New-Item -ItemType Directory -Path $folder -Force | Out-Null
$archive=Join-Path $folder 'node-win-x64.zip'
Invoke-WebRequest "https://nodejs.org/dist/$version/node-$version-win-x64.zip" -OutFile $archive -UseBasicParsing
$checksums=(Invoke-WebRequest "https://nodejs.org/dist/$version/SHASUMS256.txt" -UseBasicParsing).Content
$expected=(($checksums -split "`n" | Where-Object {$_ -like "* node-$version-win-x64.zip"}) -split '\s+')[0]
if((Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash.ToLowerInvariant() -ne $expected){throw 'Checksum inválido.'}
Expand-Archive -LiteralPath $archive -DestinationPath $folder -Force
Write-Host "Node $version portátil preparado em .tools. Nenhum serviço ou PATH global foi alterado."
