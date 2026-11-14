import * as THREE from 'three';

// Bounded, reusable exhibition effects; no gameplay collisions or damage.
export function createPlasmaProject(){
  const root=new THREE.Group(),body=new THREE.Group();root.add(body);root.userData.kind='plasma-speaker';
  const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.45,...extra});
  const metal=mat(0xa3b3bf,{metalness:.75}),board=mat(0x155b48),dark=mat(0x182735),copper=mat(0xb76e38,{metalness:.7});
  const cube=new THREE.BoxGeometry(1,1,1);
  const box=(p,m,x,y,z,w,h,d)=>{const mesh=new THREE.Mesh(cube,m);mesh.position.set(x,y,z);mesh.scale.set(w,h,d);p.add(mesh);return mesh;};
  box(body,dark,0,.1,0,1.7,.2,1.25);box(body,board,0,.27,0,1.45,.08,1);
  for(let i=0;i<7;i++){box(body,i%2?metal:dark,-.55+i*.18,.38,.28,.1,.18,.2);box(body,copper,-.55+i*.18,.32,-.25,.04,.02,.35);}
  const coil=new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,1.15,20),dark);coil.position.set(0,.95,0);body.add(coil);
  for(let n=0;n<18;n++){const ring=new THREE.Mesh(new THREE.TorusGeometry(.26,.025,5,20),copper);ring.rotation.x=Math.PI/2;ring.position.y=.4+n*.06;body.add(ring);}
  const terminal=new THREE.Mesh(new THREE.TorusGeometry(.38,.13,8,24),metal);terminal.rotation.x=Math.PI/2;terminal.position.y=1.63;body.add(terminal);
  for(const side of [-1,1]){
    box(body,metal,side*.48,1.65,0,.055,.34,.055);
    const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(side*.55,.32,.25),new THREE.Vector3(side*.65,.75,.2),new THREE.Vector3(side*.48,1.5,0)]);
    body.add(new THREE.Mesh(new THREE.TubeGeometry(curve,12,.025,5,false),mat(side<0?0x7443be:0x3d90c2)));
  }
  const acrylic=mat(0xa3e8f5,{transparent:true,opacity:.13,depthWrite:false,side:THREE.DoubleSide});
  const enclosure=box(body,acrylic,0,.92,0,1.72,1.62,1.28);enclosure.userData.acrylic=true;
  for(const x of [-.84,.84])for(const z of [-.62,.62])box(body,metal,x,.92,z,.035,1.62,.035);
  const arcs=new THREE.Group();root.add(arcs);const electric=new THREE.LineBasicMaterial({color:0x8ff6ff,transparent:true,opacity:1});
  for(let n=0;n<5;n++){const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(8*3),3));arcs.add(new THREE.Line(geometry,electric));}
  const burst=new THREE.Group();root.add(burst);const sparks=[];
  for(let n=0;n<24;n++){const mesh=new THREE.Mesh(n%3?new THREE.SphereGeometry(.045,5,4):new THREE.BoxGeometry(.12,.06,.09),new THREE.MeshBasicMaterial({color:n%2?0xffc06b:0xa6f9ff}));burst.add(mesh);sparks.push(mesh);}
  const flash=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),new THREE.MeshBasicMaterial({color:0xffedb0,transparent:true,opacity:.7,depthWrite:false}));flash.position.y=1.4;root.add(flash);
  const fire=new THREE.Group();root.add(fire);
  for(let n=0;n<7;n++){const flame=new THREE.Mesh(new THREE.ConeGeometry(.17,.8,7),new THREE.MeshBasicMaterial({color:n%2?0xffa52e:0xff5731,transparent:true,opacity:.85,depthWrite:false}));flame.position.set(Math.sin(n*2.4)*.55,.8,Math.cos(n*2.4)*.38);fire.add(flame);}
  const light=new THREE.PointLight(0x5eeeff,0,5);light.position.y=1.9;root.add(light);
  return {root,body,enclosure,arcs,burst,fire,flash,sparks,light,update(t){
    const charging=t>=22&&t<25.5,exploded=t>=25.5,intensity=THREE.MathUtils.clamp((t-22)/3.5,0,1),age=t-25.5;
    arcs.visible=charging;body.rotation.z=charging?Math.sin(t*85)*.02*intensity:exploded?.05:0;body.position.y=exploded?.06:0;
    arcs.children.forEach((line,n)=>{const a=line.geometry.attributes.position;for(let i=0;i<8;i++){const u=i/7,angle=n*1.256+t*1.7;a.setXYZ(i,Math.cos(angle)*u*(.55+intensity*.5)+Math.sin(t*66+i*7+n)*.12*u,1.7+u*(.45+intensity*.55),Math.sin(angle)*u*.55);}a.needsUpdate=true;});
    burst.visible=exploded&&age<1;flash.visible=exploded&&age<.35;flash.scale.setScalar(Math.min(.95,.25+Math.max(0,age)*2));flash.material.opacity=Math.max(0,.8-age*2.3);
    sparks.forEach((spark,n)=>{const angle=n*2.4,u=THREE.MathUtils.clamp(age,0,1),r=Math.min(1.1,u*1.7);spark.position.set(Math.cos(angle)*r,Math.max(.15,1.2+Math.sin(n*1.9)*r+u*.4-u*u*.5),Math.sin(angle)*r*.7);});
    fire.visible=exploded;fire.children.forEach((flame,n)=>{flame.scale.set(1,.65+Math.sin(t*12+n*2)*.3,1);flame.position.y=.9+Math.sin(t*8+n)*.08;flame.rotation.z=Math.sin(t*7+n)*.15;});
    light.intensity=charging?intensity*(2+Math.sin(t*50)):exploded?2+Math.sin(t*9)*.3:0;light.color.setHex(exploded?0xff852d:Math.sin(t*8)>0?0x5eeeff:0xa47bff);
    enclosure.material.opacity=exploded?.055:.13;
  }};
}
