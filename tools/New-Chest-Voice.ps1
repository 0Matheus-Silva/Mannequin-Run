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
  $speaker.SpeakSsml('<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="pt-BR"><prosody pitch="+18%" volume="loud"><prosody rate="-20%"><emphasis level="strong">Aaaaah!</emphasis></prosody><break time="40ms"/><emphasis level="strong">Ai! Ai!</emphasis><break time="40ms"/><prosody pitch="+8%"><emphasis level="strong">Minha língua!</emphasis></prosody></prosody></speak>')
  Write-Output ('Fala local do baú gerada com '+$voice.VoiceInfo.Name+'. Não utiliza Gemini nem serviço externo.')
}finally{$speaker.Dispose()}
