/* 3D scene (three.js): shapes, scroll states, lighting */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const canvas=document.getElementById('gl');
let renderer;
try{ renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'}); }
catch(e){ canvas.remove(); throw e; }
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.0;
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;

const scene=new THREE.Scene();
const pmrem=new THREE.PMREMGenerator(renderer);
scene.environment=pmrem.fromScene(new RoomEnvironment(),0.04).texture;
const camera=new THREE.PerspectiveCamera(30,1,0.1,100); camera.position.set(0,0,20);
scene.add(new THREE.HemisphereLight(0xffffff,0x5a6ad8,0.9));
const key=new THREE.DirectionalLight(0xffffff,2.4); key.position.set(-7,11,10); key.castShadow=true;
key.shadow.mapSize.set(2048,2048); Object.assign(key.shadow.camera,{left:-11,right:11,top:11,bottom:-11,near:1,far:45});
key.shadow.bias=-0.0004; key.shadow.normalBias=0.03; scene.add(key);
const rim=new THREE.DirectionalLight(0xbfd0ff,0.8); rim.position.set(8,3,-4); scene.add(rim);

const C={orange:'#E8704F',yellow:'#F3C443',blue:'#2341C6',pink:'#EE77AE',white:'#F3F0EC',navy:'#1A2689',coral:'#F08A62'};
const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.5,metalness:0,envMapIntensity:.75});

// ---- geometries ----
function arch(w=2,h=2.6,t=.62,d=.72){const R=w/2,r=R-t,s=new THREE.Shape();
  s.moveTo(-R,0);s.lineTo(-R,h-R);s.absarc(0,h-R,R,Math.PI,0,true);s.lineTo(R,0);s.lineTo(r,0);s.lineTo(r,h-R);s.absarc(0,h-R,r,0,Math.PI,false);s.lineTo(-r,0);s.closePath();
  return new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:.05,bevelThickness:.05,bevelSegments:4,curveSegments:48});}
function stairs(W=1.55,H=1.55,D=1.1,n=4){const s=new THREE.Shape(),sw=W/n,sh=H/n;let x=W,y=H;s.moveTo(0,0);s.lineTo(W,0);s.lineTo(W,H);
  for(let i=0;i<n;i++){x-=sw;s.lineTo(x,y);if(i<n-1){y-=sh;s.lineTo(x,y);}}s.closePath();
  return new THREE.ExtrudeGeometry(s,{depth:D,bevelEnabled:true,bevelSize:.035,bevelThickness:.035,bevelSegments:3});}
function halfDisc(r,d,arc=Math.PI){const g=new THREE.CylinderGeometry(r,r,d,64,1,false,0,arc);g.rotateX(Math.PI/2);return g;}
const G={
  pedestal:new THREE.CylinderGeometry(2.4,2.4,.62,96),
  arch:arch(), stairs:stairs(),
  half:halfDisc(1.3,.42),
  quarter:(()=>{const g=halfDisc(1.05,.78,Math.PI/2);g.rotateZ(Math.PI);return g})(),
  sphere:new THREE.SphereGeometry(.46,48,32),
  torus:new THREE.TorusGeometry(.52,.24,32,72),
  cone:new THREE.ConeGeometry(.36,.82,48),
  pyr:new THREE.ConeGeometry(.3,.5,4),
  ball:new THREE.SphereGeometry(.2,32,20),
  cshape:new THREE.TorusGeometry(.38,.17,24,48,Math.PI*1.35),
  cube:new THREE.BoxGeometry(.5,.5,.5),
  halfS:halfDisc(.55,.3),
};
Object.values(G).forEach(g=>{g.computeBoundingBox();g.center();g.computeBoundingBox();});
const nom=g=>{const s=new THREE.Vector3();g.boundingBox.getSize(s);return Math.max(s.x,s.y,s.z)};

// ---- shape plan ----
// hero:{p,r,s} in composition units | sc: scatter {q:[sx,sy,z],r,s} | slot: service card index | fin: contact finale
const D=[
 {g:'pedestal',c:C.white,hero:{p:[0,-1.62,0]},sc:{q:[.5,1.45,-1],r:[.5,0,0],s:.9},fin:{q:[.5,1.6,-2],s:0},ground:1},
 {g:'arch',c:C.orange,hero:{p:[-.35,0,-.35],r:[0,.25,0]},sc:{q:[.36,.1,-2],r:[.6,.8,-.9],s:.42},slot:0,slotR:[.25,-.55,.2],fin:{q:[.08,.3,-1],r:[.4,.6,-.3],s:.5},ground:1},
 {g:'sphere',c:C.white,hero:{p:[-.35,1.76,-.35]},sc:{q:[.84,.43,0],s:.9},slot:1,slotR:[0,0,0],fin:{q:[.86,.2,0],s:.8},ground:1},
 {g:'half',c:C.yellow,hero:{p:[.98,.02,-.95],r:[0,-.2,0]},sc:{q:[.22,.8,.5],r:[0,.4,.2],s:.42},fin:{q:[.93,.62,-1],r:[0,.5,.3],s:.45},ground:1},
 {g:'stairs',c:C.blue,hero:{p:[.5,-.52,.32],r:[0,-.18,0]},sc:{q:[.93,.26,-1],r:[.4,-.7,.2],s:.5},slot:3,slotR:[.38,-.62,0],fin:{q:[.1,.82,0],r:[.3,.6,0],s:.45},ground:1},
 {g:'torus',c:C.white,hero:{p:[1.45,-.55,.85],r:[.1,-.75,.2]},sc:{q:[.08,.47,1.5],r:[.3,.4,0],s:.95},slot:2,slotR:[.1,1.25,.25],fin:{q:[.9,.88,1],r:[.6,.3,0],s:.75},ground:1},
 {g:'quarter',c:C.pink,hero:{p:[-1.2,-.78,.62],r:[0,.35,0]},sc:{q:[.85,.7,.5],r:[.3,.5,.2],s:.5},fin:{q:[.05,.62,.5],r:[.2,.3,.3],s:.45},ground:1},
 {g:'cone',c:C.yellow,hero:{p:[.05,-.89,1.2]},sc:{q:[.72,.84,0],r:[0,0,.25],s:.75},fin:{q:[.72,.1,0],r:[0,0,-.3],s:.6},ground:1},
 {g:'ball',c:C.navy,hero:{p:[-.55,-1.1,1.55]},sc:{q:[.47,.86,.5],s:1.4},fin:{q:[.3,.92,0],s:1.2},ground:1},
 {g:'ball',c:C.orange,hero:{p:[-2.6,.55,.2],s:1.1},sc:{q:[.3,.15,0],s:1.5},fin:{q:[.22,.12,-.5],s:1.3}},
 {g:'ball',c:C.navy,hero:{p:[2.1,1.9,-.6]},sc:{q:[.62,.13,-.5],s:1.3},fin:{q:[.6,.92,-.5],s:1.1}},
 {g:'ball',c:C.white,hero:{p:[2.85,-.05,.3],s:.85},sc:{q:[.6,.52,-3],s:1.2},fin:{q:[.96,.4,-1],s:1}},
 {g:'pyr',c:C.pink,hero:{p:[2.5,.85,.2],r:[.3,.4,-.5]},sc:{q:[.2,.6,1],r:[.2,.4,.3],s:1.1},fin:{q:[.45,.07,0],s:1}},
 // extras that join in the manifesto
 {g:'cshape',c:C.orange,x:1,sc:{q:[.5,.14,0],r:[.6,.4,1.2],s:1},fin:{q:[.97,.12,-.5],r:[.4,.4,.2],s:.9}},
 {g:'ball',c:C.yellow,x:1,sc:{q:[.15,.33,0],s:1.4},fin:{q:[.03,.4,0],s:1.2}},
 {g:'halfS',c:C.orange,x:1,sc:{q:[.86,.33,-1],r:[0,.2,1.57],s:.9},fin:{q:[.78,.95,0],r:[0,0,1.57],s:.8}},
 {g:'cube',c:C.pink,x:1,sc:{q:[.95,.56,0],r:[.4,.6,.1],s:.9},fin:{q:[.15,.97,-.5],r:[.4,.6,.1],s:.8}},
 {g:'halfS',c:C.yellow,x:1,sc:{q:[.27,.83,0],r:[0,0,-1.6],s:1},fin:{q:[.62,.06,-1],r:[0,0,-1.6],s:.8}},
 {g:'cone',c:C.yellow,x:1,sc:{q:[.66,.82,-1],s:.55},fin:{q:[.4,.95,-1],s:.5}},
 {g:'pyr',c:C.pink,x:1,sc:{q:[.53,.53,1],r:[.2,.8,0],s:.8},fin:{q:[.83,.55,1],s:.8}},
];
const meshes=D.map((d,i)=>{const m=new THREE.Mesh(G[d.g],mat(d.c));m.castShadow=true;m.receiveShadow=true;scene.add(m);
  d.nom=nom(G[d.g]);d.phase=i*1.7;d.spin=(i%2?1:-1)*(.25+(i%5)*.07);return m;});
meshes[0].castShadow=false;

// ---- helpers ----
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const tanH=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));
const visH=z=>2*tanH*(camera.position.z-z);
const tmpV=new THREE.Vector3();
function screenToWorld(sx,sy,z,out=new THREE.Vector3()){
  const h=visH(z),w=h*camera.aspect; return out.set((sx-.5)*w,(.5-sy)*h,z);}
const E=new THREE.Euler(), Qa=new THREE.Quaternion(), Qb=new THREE.Quaternion();
const qFrom=(r=[0,0,0],o=new THREE.Quaternion())=>o.setFromEuler(E.set(r[0],r[1],r[2]));
function T(){return {p:new THREE.Vector3(),q:new THREE.Quaternion(),s:0}}
function mix(a,b,t){a.p.lerp(b.p,t);a.q.slerp(b.q,t);a.s+=(b.s-a.s)*t;return a}

let W=0,H=0;
function resize(){const w=innerWidth,h=innerHeight;if(w===W&&h===H)return;W=w;H=h;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}

const $=id=>document.getElementById(id);
const secM=$('manifesto'),secS=$('services'),secK=$('contact');
const slots=[...document.querySelectorAll('.slot')];
const hstage=$('hstage'), stage=$('stage'), stageC=new THREE.Vector3();
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
let sm=scrollY, mx=0,my=0,tmx=0,tmy=0;
addEventListener('pointermove',e=>{tmx=e.clientX/innerWidth*2-1;tmy=e.clientY/innerHeight*2-1;},{passive:true});

const A=T(),B=T(),Cc=T(),Dd=T(),cur=T();
const comp=new THREE.Quaternion(), spinQ=new THREE.Quaternion();
const hoverS=D.map(()=>0);
const clock=new THREE.Clock();

function frame(){
  resize();
  const t=reduce?0:clock.getElapsedTime();
  sm+= reduce?(scrollY-sm):(scrollY-sm)*.12;
  mx+=(tmx-mx)*.05; my+=(tmy-my)*.05;
  const vh=H, mobile=W<760;
  const m0=secM.offsetTop, s0=secS.offsetTop, k0=secK.offsetTop;
  const t1=ease(clamp(sm/(m0*.92)));
  const t2=ease(clamp((sm-(s0-vh*.8))/(vh*.85)));
  const t4=ease(clamp((sm-(k0-vh*.95))/(vh*.85)));
  const kU=visH(0)/10.7*(mobile?.72:1);
  const vw0=visH(0)*camera.aspect;
  const hr=hstage.getBoundingClientRect(), pxH=visH(0)/vh;
  const anchor=screenToWorld((hr.left+hr.width/2)/W,(hr.top+hr.height*.52)/vh,0);
  const kH=Math.min(hr.width*pxH/6.2,hr.height*pxH/4.4);
  const yaw=-.25+mx*.28+Math.sin(t*.35)*.07, pitch=.2+my*.06;
  comp.setFromEuler(E.set(pitch,yaw,0,'YXZ'));
  E.order='XYZ';
  const sr=stage.getBoundingClientRect();
  screenToWorld((sr.left+sr.width/2)/W,clamp((sr.top+sr.height*.52)/vh,-1,2),0,stageC);
  const pxW=visH(0)/vh, kF=Math.min(sr.width*pxW/6.2,sr.height*pxW/4.4);

  D.forEach((d,i)=>{
    const m=meshes[i];
    // A: hero
    if(d.x){ screenToWorld(d.sc.q[0],d.sc.q[1],d.sc.q[2],A.p).y-=kU*1.5; qFrom(d.sc.r,A.q); A.s=0; }
    else{ A.p.set(...d.hero.p).applyQuaternion(comp).multiplyScalar(kH).add(anchor);
      A.q.copy(comp).multiply(qFrom(d.hero.r,Qa)); A.s=kH*(d.hero.s||1); }
    // B: scatter
    screenToWorld(d.sc.q[0],d.sc.q[1],d.sc.q[2],B.p); qFrom(d.sc.r,B.q); B.s=kU*(d.sc.s||1);
    // C: services slot or pushed away
    if(d.slot!==undefined){
      const r=slots[d.slot].getBoundingClientRect(); const z=1.5;
      const sy=clamp((r.top+r.height/2)/vh,-.8,1.8);
      screenToWorld((r.left+r.width/2)/W,sy,z,Cc.p);
      qFrom(d.slotR,Cc.q); Cc.s=(r.height*visH(z)/vh)*.88/d.nom*(1+hoverS[i]*.12);
    }else{
      const q=d.sc.q; let dx=q[0]-.5, dy=q[1]-.5; const L=Math.hypot(dx,dy)||1; dx/=L; dy/=L;
      screenToWorld(.5+dx*1.15,.5+dy*1.15,q[2],Cc.p); Cc.q.copy(B.q); Cc.s=B.s*.8;
    }
    // D: contact finale — sculpture rebuilt inside the stage box; extras shrink away
    if(d.x){ Dd.p.copy(Cc.p); Dd.q.copy(Cc.q); Dd.s=0; }
    else{ Dd.p.set(...d.hero.p).applyQuaternion(comp).multiplyScalar(kF).add(stageC);
      Dd.q.copy(comp).multiply(qFrom(d.hero.r,Qa)); Dd.s=kF*(d.hero.s||1); }

    cur.p.copy(A.p);cur.q.copy(A.q);cur.s=A.s;
    mix(cur,B,t1); mix(cur,Cc,t2); mix(cur,Dd,t4);

    // ambient motion weights
    const heroFloat=d.ground?0:1;
    let fw=heroFloat+(1-heroFloat)*t1; fw*=1-t2*.85; fw=fw*(1-t4)+heroFloat*t4;
    let sw=(d.ground?0:.25)+(1-(d.ground?0:.25))*t1; sw=sw*(1-t2)+(d.slot!==undefined?.55:0)*t2; sw=sw*(1-t4)+(d.ground?0:.25)*t4;
    const g=d.ground?t1*(1-t4):1;
    const hv=(window.__hoverCard===d.slot&&d.slot!==undefined&&t2>.9)?1:0;
    hoverS[i]+=(hv-hoverS[i])*.1; sw+=hoverS[i]*1.8;
    d.acc=(d.acc||0)+ (reduce?0:.016*sw*d.spin*(d.slot!==undefined&&t2>.5?2.2:1));
    cur.p.y+=Math.sin(t*.9+d.phase)*.13*kU*fw;
    spinQ.setFromEuler(E.set(d.acc*.6*(1-t2*(d.slot!==undefined?1:0))*g,d.acc*g,0));
    m.position.copy(cur.p); m.quaternion.copy(cur.q).multiply(spinQ);
    m.scale.setScalar(Math.max(cur.s,1e-4));
    m.visible=cur.s>1e-3 && cur.p.y>-visH(cur.p.z)*1.2 && cur.p.y<visH(cur.p.z)*1.2;
  });
  renderer.render(scene,camera);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
