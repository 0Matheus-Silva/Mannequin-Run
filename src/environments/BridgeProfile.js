export const BRIDGE_START=2440,BRIDGE_END=2960;
export function bridgeHeight(distance){const d=((distance%3000)+3000)%3000;if(d<=BRIDGE_START||d>=BRIDGE_END)return 0;const t=(d-BRIDGE_START)/(BRIDGE_END-BRIDGE_START);return -3.6*Math.sin(Math.PI*t)**2;}
