(() => {
const mount=document.getElementById("avatar");
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(32,1,.1,100);
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
mount.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff,0x25334a,2.4));
const key=new THREE.DirectionalLight(0xffffff,2.8); key.position.set(2,4,5); scene.add(key);
const rim=new THREE.DirectionalLight(0x7aa2ff,1.4); rim.position.set(-4,2,-3); scene.add(rim);

const person=new THREE.Group(); scene.add(person);
function mat(c,rough=.55){return new THREE.MeshStandardMaterial({color:c,roughness:rough})}
const skin=mat(0xc98262,.7), skin2=mat(0xd99370,.7), shirt=mat(0x315bd7,.55),
      dark=mat(0x171c28,.35), white=mat(0xf5f7fb,.3), shoe=mat(0x11151e,.5);

const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.78,1.15,8,24),shirt);
torso.position.y=-.65; person.add(torso);
const neck=new THREE.Mesh(new THREE.CylinderGeometry(.21,.25,.36,24),skin);
neck.position.y=.13; person.add(neck);
const head=new THREE.Mesh(new THREE.SphereGeometry(.62,40,28),skin2);
head.scale.set(.91,1.06,.88); head.position.y=.75; person.add(head);

const hair=new THREE.Mesh(new THREE.SphereGeometry(.64,40,24,0,Math.PI*2,0,Math.PI*.50),dark);
hair.position.set(0,1.03,0); person.add(hair);

const ears=[];
for(const x of [-.59,.59]){
  const ear=new THREE.Mesh(new THREE.SphereGeometry(.12,18,14),skin2);
  ear.scale.z=.65; ear.position.set(x,.73,0); person.add(ear); ears.push(ear);
}

const eyes=[], pupils=[];
for(const x of [-.21,.21]){
  const eye=new THREE.Mesh(new THREE.SphereGeometry(.075,18,14),white);
  eye.position.set(x,.82,.535); person.add(eye); eyes.push(eye);
  const pupil=new THREE.Mesh(new THREE.SphereGeometry(.034,14,10),dark);
  pupil.position.set(x,.82,.60); person.add(pupil); pupils.push(pupil);
}
const browL=new THREE.Mesh(new THREE.BoxGeometry(.18,.035,.035),dark);
browL.position.set(-.21,.96,.55); browL.rotation.z=.12; person.add(browL);
const browR=browL.clone(); browR.position.x=.21; browR.rotation.z=-.12; person.add(browR);

const mouthGroup=new THREE.Group(); mouthGroup.position.set(0,.55,.57); person.add(mouthGroup);
const mouth=new THREE.Mesh(new THREE.SphereGeometry(.12,24,14),dark);
mouth.scale.set(1,.13,.22); mouthGroup.add(mouth);
const teeth=new THREE.Mesh(new THREE.SphereGeometry(.095,20,12),white);
teeth.scale.set(1,.10,.18); teeth.position.z=.03; mouthGroup.add(teeth);

const armL=new THREE.Mesh(new THREE.CapsuleGeometry(.15,.85,7,14),shirt);
armL.rotation.z=-.32; armL.position.set(-.88,-.66,0); person.add(armL);
const armR=armL.clone(); armR.rotation.z=.32; armR.position.x=.88; person.add(armR);
const handL=new THREE.Mesh(new THREE.SphereGeometry(.18,18,14),skin);
handL.position.set(-1.02,-1.12,0); person.add(handL);
const handR=handL.clone(); handR.position.x=1.02; person.add(handR);

const legL=new THREE.Mesh(new THREE.CapsuleGeometry(.20,.72,7,14),dark);
legL.position.set(-.30,-1.72,0); person.add(legL);
const legR=legL.clone(); legR.position.x=.30; person.add(legR);
const footL=new THREE.Mesh(new THREE.SphereGeometry(.24,18,14),shoe);
footL.scale.set(1.25,.55,1.6); footL.position.set(-.30,-2.13,.12); person.add(footL);
const footR=footL.clone(); footR.position.x=.30; person.add(footR);

person.position.y=.10;

function resize(){
  const r=mount.getBoundingClientRect();
  renderer.setSize(Math.max(1,r.width),Math.max(1,r.height),false);
  camera.aspect=Math.max(1,r.width)/Math.max(1,r.height);
  camera.position.set(0,.15,5.1); camera.lookAt(0,-.45,0);
  camera.updateProjectionMatrix();
}
addEventListener("resize",resize); resize();

let t=0, talking=false, emotion="neutral", blink=0;
window.setAvatarTalking=(v)=>{talking=!!v};
window.setAvatarEmotion=(e)=>{emotion=e||"neutral"};
window.setAvatarScale=(v)=>person.scale.setScalar(Number(v)||1);

function animate(){
  requestAnimationFrame(animate); t+=.016;
  const talkPulse=talking ? (Math.sin(t*18)*.5+.5) : 0;
  mouth.scale.y = talking ? .13 + talkPulse*.72 : (emotion==="surprised" ? .65 : emotion==="happy" ? .25 : .13);
  mouth.scale.x = emotion==="surprised" ? .85 : 1;
  teeth.visible=talking && talkPulse>.48;
  person.rotation.y=Math.sin(t*.55)*.045;
  person.rotation.z=(emotion==="surprised"?Math.sin(t*2)*.01:0);
  person.position.y=.10+Math.sin(t*1.2)*.018;
  const blinkCycle=Math.sin(t*.55);
  const blinkNow=blinkCycle>.985;
  eyes.forEach(e=>e.scale.y=blinkNow?.12:1);
  pupils.forEach(p=>p.scale.y=blinkNow?.12:1);
  if(talking){head.rotation.x=Math.sin(t*2.8)*.018;head.rotation.y=Math.sin(t*1.7)*.025}
  else {head.rotation.x=0;head.rotation.y=0}
  renderer.render(scene,camera);
}
animate();
})();