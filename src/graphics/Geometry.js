import * as THREE from 'three';

const cache=new Map();
export function armorGeometry() {
  if(cache.has('armor'))return cache.get('armor');
  const shape=new THREE.Shape();const r=.12;
  shape.moveTo(-.5+r,-.5);shape.lineTo(.5-r,-.5);shape.lineTo(.5,-.5+r);shape.lineTo(.5,.5-r);shape.lineTo(.5-r,.5);shape.lineTo(-.5+r,.5);shape.lineTo(-.5,.5-r);shape.lineTo(-.5,-.5+r);shape.closePath();
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:.9,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.035,bevelThickness:.05});
  geometry.center();geometry.computeBoundingBox();const size=new THREE.Vector3();geometry.boundingBox.getSize(size);geometry.scale(1/size.x,1/size.y,1/size.z);geometry.computeVertexNormals();cache.set('armor',geometry);return geometry;
}

export function panelGeometry(top=.8,bottom=.6,depth=.3) {
  const key=`panel:${top}:${bottom}:${depth}`;if(cache.has(key))return cache.get(key);
  const shape=new THREE.Shape();shape.moveTo(-bottom/2,-.5);shape.lineTo(bottom/2,-.5);shape.lineTo(top/2,.32);shape.lineTo(top*.34,.5);shape.lineTo(-top*.34,.5);shape.lineTo(-top/2,.32);shape.closePath();
  const geometry=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:2,steps:1});geometry.translate(0,0,-depth/2);geometry.computeVertexNormals();cache.set(key,geometry);return geometry;
}
