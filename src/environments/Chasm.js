export const chasmSideFor=(index,sector)=>sector===1&&[2,3].includes(index%5)?(Math.floor(index/5)%2?1:-1):0;
export const chasmContains=(segment,x,length=16)=>segment.userData.sector===1&&Boolean(segment.userData.chasmSide)&&segment.position.z>=0&&segment.position.z<=length&&x*segment.userData.chasmSide>1.35;
export const chasmIntersects=(segment,z,margin=12,length=16)=>segment.userData.sector===1&&Boolean(segment.userData.chasmSide)&&z>=segment.position.z-length-margin&&z<=segment.position.z+margin;
