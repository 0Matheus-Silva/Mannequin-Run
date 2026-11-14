$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null=[Windows.Storage.StorageFile,Windows.Storage,ContentType=WindowsRuntime]
$null=[Windows.Data.Pdf.PdfDocument,Windows.Data.Pdf,ContentType=WindowsRuntime]
$null=[Windows.Storage.Streams.InMemoryRandomAccessStream,Windows.Storage.Streams,ContentType=WindowsRuntime]
$null=[Windows.Storage.Streams.DataReader,Windows.Storage.Streams,ContentType=WindowsRuntime]
function Wait-Operation($Operation,[Type]$ResultType){
    $method=[System.WindowsRuntimeSystemExtensions].GetMethods()|Where-Object {$_.Name -eq 'AsTask' -and $_.IsGenericMethod -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1'}|Select-Object -First 1
    $task=$method.MakeGenericMethod($ResultType).Invoke($null,@($Operation))
    $task.GetAwaiter().GetResult()
}
function Wait-Action($Operation){
    $method=[System.WindowsRuntimeSystemExtensions].GetMethods()|Where-Object {$_.Name -eq 'AsTask' -and -not $_.IsGenericMethod -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncAction'}|Select-Object -First 1
    $task=$method.Invoke($null,@($Operation));$task.GetAwaiter().GetResult()
}
$root=Split-Path $PSScriptRoot -Parent
$path=Join-Path $root 'MANNEQUIN_RUN_Codex_Visual_Package/MANNEQUIN_RUN_Brief_Visual.pdf'
$file=Wait-Operation ([Windows.Storage.StorageFile]::GetFileFromPathAsync($path)) ([Windows.Storage.StorageFile])
$pdf=Wait-Operation ([Windows.Data.Pdf.PdfDocument]::LoadFromFileAsync($file)) ([Windows.Data.Pdf.PdfDocument])
$output=Join-Path $root '.tmp-qa/pdf-package';New-Item -ItemType Directory -Path $output -Force|Out-Null
for($i=0;$i -lt $pdf.PageCount;$i++){
    $page=$pdf.GetPage($i);$stream=[Windows.Storage.Streams.InMemoryRandomAccessStream]::new()
    $options=[Windows.Data.Pdf.PdfPageRenderOptions]::new();$options.DestinationWidth=1200
    Wait-Action ($page.RenderToStreamAsync($stream,$options))
    $reader=[Windows.Storage.Streams.DataReader]::new($stream.GetInputStreamAt(0))
    $null=Wait-Operation ($reader.LoadAsync([uint32]$stream.Size)) ([uint32])
    $bytes=New-Object byte[] ([int]$stream.Size);$reader.ReadBytes($bytes)
    $target=Join-Path $output ('page-'+($i+1)+'.png');[IO.File]::WriteAllBytes($target,$bytes)
    $reader.Dispose();$stream.Dispose();$page.Dispose();Write-Output $target
}
