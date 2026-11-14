param([int]$Port=8081)
$ErrorActionPreference='Stop'
$pythonCommand=Get-Command python -ErrorAction SilentlyContinue
if($pythonCommand -and $pythonCommand.Source -notlike '*WindowsApps*'){$assistantPython=$pythonCommand.Source}
elseif(Get-Command uv -ErrorAction SilentlyContinue){$assistantPython=(& uv python find --offline --no-python-downloads).Trim()}
if(-not $assistantPython -or -not (Test-Path -LiteralPath $assistantPython)){throw 'Python 3.11+ não encontrado. O jogo e a demonstração continuam disponíveis por Start-Game.ps1.'}
& $assistantPython -c "import sys; sys.exit(0 if sys.version_info >= (3,11) else 1)"
if($LASTEXITCODE -ne 0){throw 'O backend requer Python 3.11 ou mais recente.'}
& $assistantPython (Join-Path $PSScriptRoot 'server/assistant_server.py') --port $Port
