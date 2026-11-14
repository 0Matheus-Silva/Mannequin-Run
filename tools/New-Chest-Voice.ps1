$ErrorActionPreference='Stop'
$projectRoot=Split-Path $PSScriptRoot -Parent
$outputRoot=Join-Path $projectRoot 'assets/audio/ceremony'
New-Item -ItemType Directory -Path $outputRoot -Force | Out-Null
Add-Type -AssemblyName System.Speech
$speaker=New-Object System.Speech.Synthesis.SpeechSynthesizer
try{
  $voice=$speaker.GetInstalledVoices() | Where-Object {$_.VoiceInfo.Culture.Name -eq 'pt-BR'} | Select-Object -First 1
  if(-not $voice){throw 'Voz local pt-BR necessária para gerar a fala do baú.'}
  $speaker.SelectVoice($voice.VoiceInfo.Name);$speaker.Rate=4;$speaker.Volume=100
  $speaker.SetOutputToWaveFile((Join-Path $outputRoot 'chest-tongue.wav'))
  $speaker.Speak('Ai, minha língua!')
  Write-Output ('Fala local do baú gerada com '+$voice.VoiceInfo.Name+'. Não utiliza Gemini nem serviço externo.')
}finally{$speaker.Dispose()}
