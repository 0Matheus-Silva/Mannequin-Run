param([string]$Page = 'tests/movement.html', [string]$Capture = '', [int]$Port = 8080,[switch]$Hardware,[switch]$FakeMicrophone)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$outputRoot = Join-Path $projectRoot '.tmp-qa'
New-Item -ItemType Directory -Path $outputRoot -Force | Out-Null
$browserPath = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
if (-not (Test-Path -LiteralPath $browserPath)) { throw 'Microsoft Edge não encontrado.' }
$profile = Join-Path $projectRoot ('.tmp-edge-' + [Guid]::NewGuid().ToString('N'))
$argsList = @('--headless', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-first-run', "--user-data-dir=$profile", '--window-size=1920,1080', '--hide-scrollbars', '--virtual-time-budget=15000')
if($Hardware){$argsList=@($argsList|Where-Object {$_ -ne '--use-angle=swiftshader' -and $_ -ne '--enable-unsafe-swiftshader'})}
if($FakeMicrophone){$argsList+=@('--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream','--autoplay-policy=no-user-gesture-required')}
if ($Capture) { $argsList += '--screenshot=' + (Join-Path $outputRoot $Capture) }
$argsList += @('--dump-dom', "http://localhost:$Port/$Page")
Start-Process -FilePath $browserPath -WindowStyle Hidden -ArgumentList $argsList -RedirectStandardOutput (Join-Path $outputRoot 'result.html') -RedirectStandardError (Join-Path $outputRoot 'edge.log') -Wait
$html = Get-Content -LiteralPath (Join-Path $outputRoot 'result.html') -Raw
if ($html -match '(?s)<pre id="result">(.*?)</pre>') {
    Write-Output $Matches[1]
    if ($Matches[1] -notmatch 'ALL PASS' -or $Matches[1] -match 'FAIL') { exit 1 }
} elseif ($Capture) { Write-Output "Captura salva: $Capture" }
else { throw 'Resultado de teste ausente.' }
