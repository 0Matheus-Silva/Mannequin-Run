"""Generate original, deterministic local ceremony effects; standard library only."""
from pathlib import Path
import math, random, struct, wave, array

ROOT=Path(__file__).resolve().parents[1]/'assets/audio/ceremony'
ROOT.mkdir(parents=True,exist_ok=True)
RATE=44100

def save(name,samples):
    peak=max(abs(v) for v in samples) or 1
    with wave.open(str(ROOT/name),'wb') as output:
        output.setparams((1,2,RATE,0,'NONE','not compressed'))
        output.writeframes(b''.join(struct.pack('<h',int(max(-1,min(1,v/peak*.88))*32767)) for v in samples))

random.seed(2026)
length=3.4
samples=[]
low=0
for i in range(int(RATE*length)):
    t=i/RATE;noise=random.uniform(-1,1);low=.94*low+.06*noise
    impact=noise*math.exp(-t*18)*.85
    sub=math.sin(2*math.pi*(62*t-5*t*t))*math.exp(-t*2.7)*.7
    rumble=low*math.exp(-t*1.35)*2
    debris=noise*max(0,math.sin(t*91))**18*math.exp(-t*2)*.14
    samples.append((impact+sub+rumble+debris)*min(1,t/.0015))
dry=samples[:]
for delay,gain in [(.13,.25),(.27,.18),(.43,.12),(.68,.08)]:
    offset=int(delay*RATE)
    for i in range(offset,len(samples)):samples[i]+=dry[i-offset]*gain
save('explosion.wav',samples)
samples=[]
notes=[(0,523.25),(.16,659.25),(.32,783.99),(.52,1046.5)]
for i in range(int(RATE*2.4)):
    t=i/RATE;value=0
    for start,freq in notes:
        u=t-start
        if u>=0:value+=(math.sin(2*math.pi*freq*u)+.22*math.sin(2*math.pi*freq*2*u))*min(1,u/.008)*math.exp(-u*2.3)*.2
    samples.append(value)
save('victory.wav',samples)
print('Original local WAVs generated: explosion.wav (3.4 s), victory.wav (2.4 s).')
voice=ROOT/'chest-tongue.wav'
if voice.exists():
    with wave.open(str(voice),'rb') as source:
        rate=source.getframerate();channels=source.getnchannels();width=source.getsampwidth();pcm=array.array('h',source.readframes(source.getnframes()))
    if channels!=1 or width!=2:raise ValueError('Chest narration must be mono PCM16')
    peak=max(map(abs,pcm)) or 1
    active=[i for i,v in enumerate(pcm) if abs(v)>peak*.025]
    if active:
        pcm=pcm[max(0,active[0]-int(rate*.025)):min(len(pcm),active[-1]+int(rate*.06))]
        target=min(len(pcm),int(rate*3.2))
        result=array.array('h')
        for i in range(target):
            position=i*(len(pcm)-1)/max(1,target-1);index=int(position);fraction=position-index
            result.append(int(pcm[index]*(1-fraction)+pcm[min(index+1,len(pcm)-1)]*fraction))
        with wave.open(str(voice),'wb') as output:
            output.setparams((1,2,rate,0,'NONE','not compressed'));output.writeframes(result.tobytes())
        print('Chest narration trimmed to',round(len(result)/rate,3),'seconds for lip/tongue synchronization.')
