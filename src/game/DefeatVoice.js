export const DEFEAT_VOICES=['nexus-derrota-1','nexus-derrota-matheus','nexus-derrota-pedro','nexus-derrota-vitor'];

// The three named lines together have 75% probability on the first draw.
// Subsequent draws exclude the previous line to avoid consecutive repeats.
export function chooseDefeatVoice(previous,random=Math.random){
  const options=DEFEAT_VOICES.filter(name=>name!==previous);
  return options[Math.min(options.length-1,Math.floor(random()*options.length))];
}
