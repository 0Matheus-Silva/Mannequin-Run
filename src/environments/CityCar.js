import * as THREE from 'three';
import { batchMeshes } from '../utils/batchMeshes.js';

// The silhouettes and glass share geometry across recycled street segments.
let geometry;
function carGeometry(){
  if(geometry)return geometry;
  const shape=new THREE.Shape();
  shape.moveTo(-1.9,.38);shape.lineTo(-1.78,.79);shape.lineTo(-1.02,.91);shape.lineTo(1.08,.91);shape.lineTo(1.75,.79);shape.lineTo(1.88,.39);shape.lineTo(1.7,.23);shape.lineTo(-1.72,.23);shape.closePath();
  const body=new THREE.ExtrudeGeometry(shape,{depth:1.55,bevelEnabled:true,bevelSize:.09,bevelThickness:.07,bevelSegments:2,curveSegments:8});
  body.rotateY(-Math.PI/2);body.translate(.775,0,0);
  const cabinShape=new THREE.Shape();cabinShape.moveTo(-1.02,.9);cabinShape.lineTo(-.64,1.42);cabinShape.lineTo(.55,1.42);cabinShape.lineTo(1.08,.9);cabinShape.closePath();
  const cabin=new THREE.ExtrudeGeometry(cabinShape,{depth:1.35,bevelEnabled:false});cabin.rotateY(-Math.PI/2);cabin.translate(.675,0,0);
  const wheel=new THREE.CylinderGeometry(.36,.36,.19,18);wheel.rotateZ(Math.PI/2);
  const hub=new THREE.CylinderGeometry(.18,.18,.2,12);hub.rotateZ(Math.PI/2);
  const panel=(vertices)=>{const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex([0,1,2,0,2,3]);geo.computeVertexNormals();return geo;};
  // Panels use (x,y,z) explicitly to follow the sloped body silhouette.
  const sideGlass=panel([0,1.35,-.56,0,1.35,.48,0,.99,.91,0,.99,-.87]);
  const frontGlass=panel([-.60,1.36,.64,.60,1.36,.64,.60,.97,1.06,-.60,.97,1.06]);
  const rearGlass=panel([-.60,1.36,-.72,.60,1.36,-.72,.60,.97,-1.00,-.60,.97,-1.00]);
  geometry={body,cabin,wheel,hub,sideGlass,frontGlass,rearGlass};return geometry;
}
export function buildCityCar(w,a,index,side,random){
  const geom=carGeometry(),car=new THREE.Group(),colors=[a.carAsh,a.carLight,a.carCharcoal,a.carRed,a.carBlue],paint=colors[(index*7+(side>0?2:0))%colors.length];
  for(const geo of [geom.body,geom.cabin]){const part=new THREE.Mesh(geo,paint);part.castShadow=true;part.receiveShadow=true;car.add(part);}
  for(const x of [-.79,.79])for(const z of [-1.22,1.22]){
    const tire=new THREE.Mesh(geom.wheel,a.tire);tire.position.set(x,.36,z);tire.castShadow=true;car.add(tire);
    const hub=new THREE.Mesh(geom.hub,a.hub);hub.position.set(x*1.14,.36,z);car.add(hub);
  }
  for(const x of [-.68,.68]){const glass=new THREE.Mesh(geom.sideGlass,a.carGlass);glass.position.x=x;car.add(glass);}
  for(const geo of [geom.frontGlass,geom.rearGlass])car.add(new THREE.Mesh(geo,a.carGlass));
  const box=(m,x,y,z,ww,h,d)=>w.box(car,m,x,y,z,ww,h,d);
  for(const x of [-.57,.57]){box(a.lamp,x,.64,1.88,.39,.16,.035);box(a.tail,x,.64,-1.88,.34,.14,.035);}
  box(a.tire,0,.44,1.91,.8,.16,.05);box(a.hub,0,.3,1.92,1.45,.07,.06);
  for(const x of [-.8,.8]){box(a.tire,x,.77,0,.025,.045,1.9);box(a.hub,x,.8,.05,.03,.04,.25);box(a.tire,x*1.08,1.05,.67,.18,.1,.24);}
  for(const x of [-.69,.69])box(a.tire,x,1.17,-.03,.025,.35,.065);
  const dent=box(a.carRust,side*.65,.83,1.25,.25,.035,.55);dent.rotation.y=side*.3;
  if(index%3===0){car.rotation.z=side*.16;car.rotation.y=side*.3;car.position.y=.05;}
  else car.rotation.y=(random()-.5)*.3;
  return batchMeshes(car);
}
