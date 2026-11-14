$ErrorActionPreference='Stop'
$projectRoot=Split-Path $PSScriptRoot -Parent
$knowledge=Get-Content -LiteralPath (Join-Path $projectRoot 'assets/assistant/knowledge.json') -Raw -Encoding UTF8 | ConvertFrom-Json
Add-Type -AssemblyName System.Speech
$speaker=New-Object System.Speech.Synthesis.SpeechSynthesizer
try{
  $voice=$speaker.GetInstalledVoices() | Where-Object {$_.VoiceInfo.Culture.Name -eq 'pt-BR'} | Select-Object -First 1
  if(-not $voice){throw 'Nenhuma voz SAPI pt-BR instalada. A apresentação por texto permanece disponível.'}
  $speaker.SelectVoice($voice.VoiceInfo.Name);$speaker.Rate=1
  $speaker.SetOutputToWaveFile((Join-Path $projectRoot 'assets/assistant/presentation.wav'))
  $speaker.Speak($knowledge.presentation)
  Write-Output ('Apresentação local gerada com '+$voice.VoiceInfo.Name+'. Voz de contingência, não a voz Gemini configurada.')
}finally{$speaker.Dispose()}
