param([int]$Port=8080,[int]$DebugPort=9234,[string]$Page='tests/performance.html',[string]$Report='performance.txt',[switch]$Hardware,[switch]$FakeMicrophone,[ValidateSet('Edge','Chrome')][string]$Browser='Edge')
$ErrorActionPreference='Stop'
$projectRoot=Split-Path $PSScriptRoot -Parent
$outputRoot=Join-Path $projectRoot '.tmp-qa'
New-Item -ItemType Directory -Path $outputRoot -Force | Out-Null
$profile=Join-Path $projectRoot ('.tmp-edge-bench-'+[Guid]::NewGuid().ToString('N'))
$argsList=@('--headless','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-first-run','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows',"--user-data-dir=$profile",'--window-size=1920,1080',"--remote-debugging-port=$DebugPort",'--remote-debugging-address=127.0.0.1',"http://localhost:$Port/$Page")
if($Hardware){$argsList=@($argsList|Where-Object {$_ -ne '--use-angle=swiftshader' -and $_ -ne '--enable-unsafe-swiftshader'})}
if($FakeMicrophone){$argsList+=@('--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream','--autoplay-policy=no-user-gesture-required')}
$browserPath=if($Browser -eq 'Chrome'){'C:\Program Files\Google\Chrome\Application\chrome.exe'}else{'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'}
Start-Process -FilePath $browserPath -WindowStyle Hidden -ArgumentList $argsList -RedirectStandardOutput (Join-Path $outputRoot 'benchmark-browser.txt') -RedirectStandardError (Join-Path $outputRoot 'benchmark-browser.log')
$socket=[Net.WebSockets.ClientWebSocket]::new()
$cancel=[Threading.CancellationTokenSource]::new(120000)
$script:messageId=0
function Invoke-DevTools([string]$method,[hashtable]$parameters){
    $script:messageId++
    $payload=@{id=$script:messageId;method=$method;params=$parameters}|ConvertTo-Json -Depth 12 -Compress
    $bytes=[Text.Encoding]::UTF8.GetBytes($payload)
    $socket.SendAsync([ArraySegment[byte]]::new($bytes),[Net.WebSockets.WebSocketMessageType]::Text,$true,$cancel.Token).GetAwaiter().GetResult()|Out-Null
    while($true){
        $memory=[IO.MemoryStream]::new()
        do{
            $buffer=New-Object byte[] 65536
            $chunk=$socket.ReceiveAsync([ArraySegment[byte]]::new($buffer),$cancel.Token).GetAwaiter().GetResult()
            $memory.Write($buffer,0,$chunk.Count)
        }while(-not $chunk.EndOfMessage)
        $reply=[Text.Encoding]::UTF8.GetString($memory.ToArray())|ConvertFrom-Json
        $memory.Dispose()
        if($reply.id -eq $script:messageId){if($reply.error){throw ($reply.error|ConvertTo-Json -Compress)};return $reply.result}
    }
}
try{
    $target=$null
    for($i=0;$i -lt 100;$i++){
        try{$targets=Invoke-RestMethod "http://127.0.0.1:$DebugPort/json/list";$target=$targets|Where-Object {$_.type -eq 'page' -and $_.url -like "*$Page*"}|Select-Object -First 1;if($target){break}}catch{}
        Start-Sleep -Milliseconds 100
    }
    if(-not $target){throw 'Navegador de medição não iniciou.'}
    $socket.ConnectAsync([Uri]$target.webSocketDebuggerUrl,$cancel.Token).GetAwaiter().GetResult()|Out-Null
    Invoke-DevTools 'Page.bringToFront' @{}|Out-Null
    for($i=0;$i -lt 150;$i++){
        try{
            $loaded=Invoke-DevTools 'Runtime.evaluate' @{expression="document.readyState==='complete' && location.pathname.endsWith('/$Page')";returnByValue=$true}
            if($loaded.result.value){break}
        }catch{}
        Start-Sleep -Milliseconds 100
    }
    $expression="new Promise(resolve=>{const timer=setInterval(()=>{if(window.benchmarkDone){clearInterval(timer);resolve(document.querySelector('#result').textContent)}},100)})"
    $result=Invoke-DevTools 'Runtime.evaluate' @{expression=$expression;awaitPromise=$true;returnByValue=$true}
    if($result.exceptionDetails){throw ($result.exceptionDetails|ConvertTo-Json -Depth 8)}
    $reportText=$result.result.value
    Set-Content -LiteralPath (Join-Path $outputRoot $Report) -Value $reportText -Encoding UTF8
    Write-Output $reportText
    if($reportText -notmatch 'ALL PASS'){throw 'A medição não concluiu.'}
}finally{
    if($socket.State -eq [Net.WebSockets.WebSocketState]::Open){try{Invoke-DevTools 'Browser.close' @{}|Out-Null}catch{}}
    $socket.Dispose();$cancel.Dispose()
}
