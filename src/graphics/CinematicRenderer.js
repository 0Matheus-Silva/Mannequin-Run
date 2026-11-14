import * as THREE from 'three';

const vertex=`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;
const blur=`varying vec2 vUv;uniform sampler2D source;uniform vec2 direction;uniform float threshold;
vec3 tap(vec2 uv){vec3 c=texture2D(source,uv).rgb;return c*max(0.,max(max(c.r,c.g),c.b)-threshold)/max(.0001,max(max(c.r,c.g),c.b));}
void main(){vec3 c=tap(vUv)*.227027;c+=tap(vUv+direction*1.384615)*.316216;c+=tap(vUv-direction*1.384615)*.316216;c+=tap(vUv+direction*3.230769)*.070270;c+=tap(vUv-direction*3.230769)*.070270;gl_FragColor=vec4(c,1.);}`;
const composite=`varying vec2 vUv;uniform sampler2D source;uniform sampler2D bloom;uniform float exposure;uniform float strength;uniform vec2 texel;
vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
void main(){vec3 c=texture2D(source,vUv).rgb;float luminance=dot(c,vec3(.2126,.7152,.0722));float edge=fwidth(luminance);if(edge>.12){vec3 n=texture2D(source,vUv+vec2(texel.x,0.)).rgb+texture2D(source,vUv-vec2(texel.x,0.)).rgb+texture2D(source,vUv+vec2(0.,texel.y)).rgb+texture2D(source,vUv-vec2(0.,texel.y)).rgb;c=mix(c,n*.25,.4);}c+=texture2D(bloom,vUv).rgb*strength;c=aces(c*exposure);c=pow(c,vec3(1./2.2));float v=1.-smoothstep(.2,.9,distance(vUv,vec2(.5)));c*=mix(.9,1.,v);gl_FragColor=vec4(c,1.);}`;

export class CinematicRenderer {
  constructor(renderer){
    this.renderer=renderer;this.enabled=false;this.size=new THREE.Vector2();
    this.scene=new THREE.Scene();this.camera=new THREE.Camera();
    this.blurMaterial=new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:blur,depthTest:false,depthWrite:false,toneMapped:false,uniforms:{source:{value:null},direction:{value:new THREE.Vector2()},threshold:{value:1.1}}});
    this.compositeMaterial=new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:composite,depthTest:false,depthWrite:false,toneMapped:false,uniforms:{source:{value:null},bloom:{value:null},exposure:{value:1.08},strength:{value:.16},texel:{value:new THREE.Vector2()}}});
    this.quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),this.blurMaterial);this.quad.frustumCulled=false;this.scene.add(this.quad);
  }
  setQuality(quality){
    this.enabled=quality!=='eco';this.renderer.getDrawingBufferSize(this.size);
    this.disposeTargets();if(!this.enabled)return;
    const options={type:THREE.HalfFloatType,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter};
    this.main=new THREE.WebGLRenderTarget(this.size.x,this.size.y,{...options,depthBuffer:true});
    this.main.samples=quality==='high'?2:0;
    this.compositeMaterial.uniforms.texel.value.set(1/this.size.x,1/this.size.y);
    const scale=quality==='high'?.5:.33;
    this.horizontal=new THREE.WebGLRenderTarget(Math.max(1,Math.floor(this.size.x*scale)),Math.max(1,Math.floor(this.size.y*scale)),{...options,depthBuffer:false});
    this.vertical=this.horizontal.clone();
  }
  render(scene,camera){
    const renderer=this.renderer;
    if(!this.enabled){renderer.setRenderTarget(null);renderer.render(scene,camera);return;}
    renderer.setRenderTarget(this.main);renderer.render(scene,camera);
    this.lastSceneCalls=renderer.info.render.calls;this.lastSceneTriangles=renderer.info.render.triangles;
    this.quad.material=this.blurMaterial;
    this.blurMaterial.uniforms.source.value=this.main.texture;this.blurMaterial.uniforms.direction.value.set(2/this.horizontal.width,0);this.blurMaterial.uniforms.threshold.value=1.1;
    renderer.setRenderTarget(this.horizontal);renderer.render(this.scene,this.camera);
    this.blurMaterial.uniforms.source.value=this.horizontal.texture;this.blurMaterial.uniforms.direction.value.set(0,2/this.horizontal.height);this.blurMaterial.uniforms.threshold.value=0;
    renderer.setRenderTarget(this.vertical);renderer.render(this.scene,this.camera);
    this.quad.material=this.compositeMaterial;this.compositeMaterial.uniforms.source.value=this.main.texture;this.compositeMaterial.uniforms.bloom.value=this.vertical.texture;this.compositeMaterial.uniforms.exposure.value=renderer.toneMappingExposure;
    renderer.setRenderTarget(null);renderer.render(this.scene,this.camera);
  }
  disposeTargets(){for(const name of ['main','horizontal','vertical']){this[name]?.dispose();this[name]=null;}}
  dispose(){this.disposeTargets();this.quad.geometry.dispose();this.blurMaterial.dispose();this.compositeMaterial.dispose();}
}
