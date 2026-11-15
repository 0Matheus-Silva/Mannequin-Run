param([int]$Port=8084,[int]$AssistantPort=8081,[switch]$Setup,[switch]$NoBrowser)
$ErrorActionPreference='Stop'
Set-Location -LiteralPath $PSScriptRoot
$nodeCommand=Get-Command node -ErrorAction SilentlyContinue
$localNode=Get-ChildItem -LiteralPath (Join-Path $PSScriptRoot '.tools') -Directory -Filter 'node-*-win-x64' -ErrorAction SilentlyContinue | Sort-Object Name -Descending | Select-Object -First 1
if($nodeCommand){$nodeExecutable=$nodeCommand.Source}elseif($localNode){$nodeExecutable=Join-Path $localNode.FullName 'node.exe'}
if(-not $nodeExecutable){throw 'Node.js 22.13+ necessário. Instale Node LTS ou execute tools/Prepare-Node.ps1 para preparar uma cópia portátil local. Nenhum serviço será instalado.'}
if(-not(Test-Path -LiteralPath '.env')){Copy-Item -LiteralPath '.env.example' -Destination '.env';throw 'Arquivo .env criado. Preencha MYSQL_ADMIN_PASSWORD localmente e execute novamente.'}
if(-not(Test-Path -LiteralPath 'node_modules/mysql2')){
  $env:Path=(Split-Path $nodeExecutable)+';'+$env:Path
  & (Join-Path (Split-Path $nodeExecutable) 'npm.cmd') ci --ignore-scripts --no-audit --no-fund
  if($LASTEXITCODE -ne 0){throw 'Dependências Node não preparadas. Execute npm ci com acesso à internet uma vez.'}
}
if($Setup){& $nodeExecutable tools/database.js setup;if($LASTEXITCODE -ne 0){throw 'Provisionamento não concluído. Confira as credenciais MySQL locais.'}}
else{
  & $nodeExecutable tools/database.js check
  if($LASTEXITCODE -ne 0){& $nodeExecutable tools/database.js setup;if($LASTEXITCODE -ne 0){throw 'Banco não preparado. Preencha MYSQL_ADMIN_PASSWORD no .env e execute Start-Local.ps1 -Setup.'}}
}
# Existing Gemini backend is reused without replacing it. Start only if not listening.
$assistantAvailable=$false
try{$assistantConfiguration=Invoke-RestMethod "http://127.0.0.1:$AssistantPort/api/assistant/config" -TimeoutSec 2;$assistantAvailable=($null -ne $assistantConfiguration.voice)}catch{}
if(-not $assistantAvailable){
  Start-Process -FilePath powershell.exe -ArgumentList @('-NoProfile','-ExecutionPolicy','Bypass','-File',(Join-Path $PSScriptRoot 'Start-Assistant.ps1'),'-Port',$AssistantPort) -WorkingDirectory $PSScriptRoot -WindowStyle Hidden | Out-Null
}
$env:LOCAL_PORT=[string]$Port;$env:ASSISTANT_PORT=[string]$AssistantPort
Write-Host "NEXUS RUN local: http://127.0.0.1:$Port"
if(-not $NoBrowser){Start-Process "http://127.0.0.1:$Port"}
& $nodeExecutable server/local-server.js
