param([int]$Port=8084,[int]$AssistantPort=8081)
$ErrorActionPreference='Stop'
$projectRoot=Split-Path $PSScriptRoot -Parent
Write-Output 'Diagnóstico Nexus: nenhuma chave, senha, token ou conversa é exibida.'
Write-Output ('Arquivo .env local: '+(Test-Path -LiteralPath (Join-Path $projectRoot '.env')))
$pythonCommand=Get-Command python -ErrorAction SilentlyContinue
$uvCommand=Get-Command uv -ErrorAction SilentlyContinue
Write-Output ('Python no PATH: '+[bool]($pythonCommand -and $pythonCommand.Source -notlike '*WindowsApps*')+' / uv disponível: '+[bool]$uvCommand)
$nodeCommand=Get-Command node -ErrorAction SilentlyContinue
$portable=Get-ChildItem -LiteralPath (Join-Path $projectRoot '.tools') -Directory -Filter 'node-*-win-x64' -ErrorAction SilentlyContinue
Write-Output ('Node no PATH ou portátil: '+[bool]($nodeCommand -or $portable))
$mysql=Get-Service -Name '*mysql*' -ErrorAction SilentlyContinue
if($mysql){$mysql|ForEach-Object {Write-Output ('Serviço MySQL: '+$_.Name+' / '+$_.Status)}}else{Write-Output 'Serviço MySQL não encontrado. Confira a instalação do MySQL Server.'}
foreach($entry in @(
 @{Name='Backend Gemini direto';Url="http://127.0.0.1:$AssistantPort/api/assistant/config"},
 @{Name='Gemini pelo servidor completo';Url="http://127.0.0.1:$Port/api/assistant/config"},
 @{Name='Banco pelo servidor completo';Url="http://127.0.0.1:$Port/api/local/config"}
)){
 try{
  $config=Invoke-RestMethod -Uri $entry.Url -TimeoutSec 4
  if($null -eq $config.ready){Write-Output ($entry.Name+': resposta inesperada; confira se a porta pertence ao Nexus.');continue}
  Write-Output ($entry.Name+': ready='+$config.ready)
  if($config.voice){Write-Output ('Voz: '+$config.voice)}
  if($config.reason){Write-Output ('Estado: '+$config.reason)}
  if($config.message){Write-Output ('Estado: '+$config.message)}
 }catch{Write-Output ($entry.Name+': indisponível. Inicie Start-Local.ps1 e confira o terminal; não use Live Server para Gemini.')}
}
Write-Output "Abra http://127.0.0.1:$Port para a versão completa. Este diagnóstico não emite tokens nem consome uma tentativa Gemini."
