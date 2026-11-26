import * as THREE from 'three';

export const SECTOR_LENGTH = 600;
export const TRANSITION_LENGTH = 120;
export const SECTORS = [
  { name:'LABORATÓRIO ABANDONADO', subtitle:'PROTOCOLO DE FUGA INICIADO', sky:0x07131d, fog:0x071923, accent:0x20d4d8, fill:0x8ec9df, metal:0x253743, floor:0x0c1820, particle:0x72c6d4 },
  { name:'CIDADE EM RUÍNAS', subtitle:'PERÍMETRO URBANO EM COLAPSO', sky:0x586d87, fog:0xb58e69, accent:0xe5aa65, fill:0xf1c8a1, metal:0x66554b, floor:0x333337, particle:0xd9c5ac },
  { name:'COMPLEXO INDUSTRIAL', subtitle:'SISTEMAS INDUSTRIAIS INSTÁVEIS', sky:0x454d5b, fog:0x645244, accent:0xdf8d37, fill:0xb5bfc7, metal:0x68503b, floor:0x24292b, particle:0xc7b6a0 },
  { name:'ZONA CONTAMINADA', subtitle:'ZONA DE CONTAMINAÇÃO DETECTADA', sky:0x0b221e, fog:0x123b2e, accent:0x5efb8d, fill:0x9cdfb8, metal:0x29443d, floor:0x0c211d, particle:0x86ffc2 },
  { name:'PONTE DO VALE', subtitle:'REATIVE O SERVIDOR', sky:0x7ba6b2, fog:0xa6c5bd, accent:0x8fd5bc, fill:0xd0e6d7, metal:0x7c674e, floor:0x465f4b, particle:0xc7e8d5 },
];
for (const sector of SECTORS) for (const key of ['sky','fog','accent','fill','metal','floor','particle']) sector[key] = new THREE.Color(sector[key]);

export function sectorAt(distance) { return Math.floor(Math.max(0, distance) / SECTOR_LENGTH) % SECTORS.length; }

export function transitionAt(distance) {
  const cycle = Math.max(0, distance) % SECTOR_LENGTH;
  const current = sectorAt(distance);
  const t = Math.max(0, Math.min(1, (cycle - (SECTOR_LENGTH - TRANSITION_LENGTH)) / TRANSITION_LENGTH));
  return { current, next:(current+1)%SECTORS.length, blend:t*t*(3-2*t) };
}
