import * as THREE from 'three';

// Combine repeated static shapes per local group without changing shared geometry.
export function batchMeshes(group) {
  const batches=new Map();
  for(const mesh of [...group.children]){
    if(!mesh.visible||!mesh.isMesh||mesh.isInstancedMesh||mesh.userData.flame)continue;
    const key=mesh.geometry.uuid+'|'+mesh.material.uuid+'|'+mesh.castShadow+'|'+mesh.receiveShadow;
    if(!batches.has(key))batches.set(key,[]);
    batches.get(key).push(mesh);
  }
  for(const meshes of batches.values()){
    if(meshes.length<2)continue;
    const first=meshes[0];
    const batch=new THREE.InstancedMesh(first.geometry,first.material,meshes.length);
    batch.castShadow=first.castShadow;batch.receiveShadow=first.receiveShadow;
    meshes.forEach((mesh,index)=>{mesh.updateMatrix();batch.setMatrixAt(index,mesh.matrix);group.remove(mesh);});
    batch.instanceMatrix.needsUpdate=true;batch.computeBoundingSphere();group.add(batch);
  }
  return group;
}

export function releaseInstances(group) {
  group.traverse(mesh=>{if(mesh.isInstancedMesh)mesh.dispose();});
}
