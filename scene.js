/* 3D scene (three.js): shapes, scroll states, lighting */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const canvas=document.getElementById('gl');
let renderer;
try{ renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'}); }
catch(e){ canvas.remove(); throw e; }
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.0;
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFShadowMap;  // PCF + shadow.radius = soft blurred shadows

const scene=new THREE.Scene();
const pmrem=new THREE.PMREMGenerator(renderer);
scene.environment=pmrem.fromScene(new RoomEnvironment(),0.04).texture;
const camera=new THREE.PerspectiveCamera(30,1,0.1,100); camera.position.set(0,0,20);
scene.add(new THREE.HemisphereLight(0xffffff,0x6f86e8,0.8));  // soft fill; lower = deeper shadows
const key=new THREE.DirectionalLight(0xfff6ec,3.0); key.position.set(-10,10,5); key.castShadow=true;
key.shadow.mapSize.set(2048,2048); Object.assign(key.shadow.camera,{left:-11,right:11,top:11,bottom:-11,near:1,far:45});
key.shadow.radius=6; key.shadow.bias=-0.0004; key.shadow.normalBias=0.03; scene.add(key);
const rim=new THREE.DirectionalLight(0xdde5ff,0.45); rim.position.set(8,3,-4); scene.add(rim);

const C={orange:'#E8704F',yellow:'#F3C443',blue:'#2341C6',pink:'#EE77AE',white:'#F3F0EC',navy:'#1A2689',coral:'#F08A62'};
// matte clay look: very rough, weak reflections, fine grain (no shiny highlights)
const grain=(()=>{const n=256,cv=document.createElement('canvas');cv.width=cv.height=n;const x=cv.getContext('2d'),im=x.createImageData(n,n);
  for(let i=0;i<n*n;i++){const v=128+(Math.random()-.5)*90;im.data[i*4]=im.data[i*4+1]=im.data[i*4+2]=v;im.data[i*4+3]=255;}
  x.putImageData(im,0,0);const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3,3);return t;})();
const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.95,metalness:0,envMapIntensity:.35,bumpMap:grain,bumpScale:.6});

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


// ---- work models (one per service card): built from simple parts, front faces +z ----
const rbox=(w,h,d,r,c)=>new THREE.Mesh(new RoundedBoxGeometry(w,h,d,4,Math.min(r,w/2-.002,h/2-.002,d/2-.002)),mat(c));
const cyl=(rt,rb,h,c,seg=48)=>new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),mat(c));
const disc=(r,h,c)=>{const g=new THREE.CylinderGeometry(r,r,h,48);g.rotateX(Math.PI/2);return new THREE.Mesh(g,mat(c));};
const sph=(r,c)=>new THREE.Mesh(new THREE.SphereGeometry(r,32,20),mat(c));
const cap=(r,l,c)=>new THREE.Mesh(new THREE.CapsuleGeometry(r,l,8,16),mat(c));
const tri=(r,d,c)=>{const g=new THREE.CylinderGeometry(r,r,d,3);g.rotateX(Math.PI/2);g.rotateZ(Math.PI/2);return new THREE.Mesh(g,mat(c));};
const at=(o,x,y,z,rx=0,ry=0,rz=0)=>{o.position.set(x,y,z);o.rotation.set(rx,ry,rz);return o;};
function model(...parts){const g=new THREE.Group(),inner=new THREE.Group();parts.forEach(p=>inner.add(p));g.add(inner);
  inner.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(inner),c=new THREE.Vector3(),sz=new THREE.Vector3();
  b.getCenter(c);b.getSize(sz);inner.position.sub(c);g.userData.nom=Math.max(sz.x,sz.y,sz.z);g.userData.hh=sz.y/2;
  g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});return g;}
const PEACH='#F6C28B', LINE='#D9D3CB';
const M={
  // A — Motion graphics & animation: an animation-app window with a running figure, play tile and check badge
  motion:()=>{const fig=[at(sph(.085,C.navy),-.0,.3,.31),at(cap(.05,.22,C.navy),-.05,.12,.31,0,0,-.35),
      at(cap(.035,.17,C.navy),-.17,.17,.31,0,0,1.1),at(cap(.035,.17,C.navy),.08,.15,.31,0,0,-1.0),
      at(cap(.042,.22,C.navy),-.17,-.09,.31,0,0,-.75),at(cap(.042,.22,C.navy),.06,-.1,.31,0,0,.55)];
    return model(at(rbox(2.1,2.3,.36,.24,C.blue),0,0,0),
      at(rbox(1.7,.34,.14,.12,C.white),0,.82,.2),
      ...[-.62,-.45,-.28].map(x=>at(disc(.065,.06,PEACH),x,.82,.29)),
      at(disc(.28,.16,PEACH),.74,1.0,.32),at(cap(.035,.1,C.white),.67,.97,.42,0,0,.8),at(cap(.035,.2,C.white),.8,1.02,.42,0,0,-.7),
      at(rbox(.2,.95,.12,.08,C.white),-.84,.02,.2),
      at(rbox(1.08,1.02,.14,.1,C.white),-.08,.04,.2),...fig,
      ...[.3,.1,-.1].map(y=>at(rbox(.22,.16,.12,.07,C.yellow),.72,y,.2)),at(rbox(.22,.3,.12,.08,C.white),.72,-.4,.2),
      at(rbox(1.75,.52,.2,.13,C.pink),.05,-.98,.3),
      ...[-.86,-.98,-1.1].map(y=>at(rbox(.18,.07,.04,.03,C.white),-.55,y,.41)),
      ...[-.86,-.98,-1.1].map(y=>at(rbox(.95,.05,.04,.02,C.white),.22,y,.41)),
      at(rbox(.5,.5,.18,.11,C.pink),-1.05,-.05,.36,0,0,.22),at(tri(.13,.06,C.white),-1.03,-.05,.47,0,0,.22));},
  // B — Video & digital media: a film camera with two reels and a rec light
  video:()=>{const hood=cyl(.3,.19,.24,C.navy);hood.geometry.rotateZ(-Math.PI/2);
    return model(at(rbox(1.0,.62,.5,.12,C.white),0,0,0),at(cyl(.19,.19,.26,C.navy),.62,0,0,0,0,Math.PI/2),at(hood,.84,0,0),
      at(disc(.25,.14,C.orange),-.25,.56,0),at(disc(.07,.16,C.navy),-.25,.56,0),
      at(disc(.21,.14,C.yellow),.27,.52,0),at(disc(.06,.16,C.navy),.27,.52,0),
      at(sph(.06,C.pink),-.34,.13,.25),at(rbox(.35,.08,.04,.03,LINE),.12,-.15,.26));},
  // C — Graphic & UX/UI design: a phone showing an interface, with a pencil
  uxui:()=>{const pencil=new THREE.Group();pencil.add(at(cyl(.07,.07,.72,C.orange,6),0,0,0),at(cyl(.07,0,.18,PEACH,6),0,-.45,0,Math.PI,0,0),at(cyl(.071,.071,.1,C.pink,6),0,.41,0));
    return model(at(rbox(.88,1.62,.14,.14,C.navy),0,0,0),at(rbox(.76,1.44,.04,.08,C.white),0,0,.07),
      at(rbox(.62,.24,.05,.06,C.pink),0,.5,.1),at(rbox(.62,.42,.05,.06,C.yellow),0,.08,.1),
      at(rbox(.5,.06,.04,.02,LINE),-.06,-.26,.1),at(rbox(.36,.06,.04,.02,LINE),-.13,-.37,.1),
      at(rbox(.42,.15,.05,.07,C.blue),0,-.56,.1),at(pencil,.52,-.2,.24,0,0,.55));},
  // D — Web & Google Ads: a browser window with rising bar chart and a search magnifier
  webads:()=>{const mag=new THREE.Group();mag.add(at(new THREE.Mesh(new THREE.TorusGeometry(.16,.05,16,40),mat(C.pink)),0,0,0),at(cap(.045,.22,C.pink),.17,-.17,0,0,0,.785));
    return model(at(rbox(1.8,1.36,.16,.12,C.white),0,0,0),at(rbox(1.8,.28,.2,.12,C.blue),0,.56,.01),
      ...[-.74,-.6,-.46].map(x=>at(disc(.045,.04,C.white),x,.56,.12)),
      ...[[-.5,.34,C.yellow],[-.12,.58,C.orange],[.26,.82,C.blue]].map(([x,h,c])=>at(rbox(.28,h,.24,.06,c),x,-.52+h/2,.14)),
      at(mag,.66,-.28,.2));},
};

// ---- shape plan ----
// hero:{p,r,s} in composition units | sc: scatter {q:[sx,sy,z],r,s} | slot: service card index | fin: contact finale
const D=[
 {g:'pedestal',c:C.white,hero:{p:[0,-1.62,0]},sc:{q:[.5,1.45,-1],r:[.5,0,0],s:.9},fin:{q:[.5,1.6,-2],s:0},ground:1},
 {g:'motion',hero:{p:[-.35,-.08,-.35],r:[0,.22,0]},sc:{q:[.36,.1,-2],r:[.3,.5,-.3],s:.42},slot:0,slotR:[.12,-.38,.04],fin:{q:[.08,.3,-1],r:[.4,.6,-.3],s:.5},ground:1},
 {g:'video',on:1,hero:{p:[-.45,1.55,-.35],r:[0,.35,0],s:.72},sc:{q:[.84,.43,0],r:[.2,-.5,0],s:.9},slot:1,slotR:[.15,-.45,0],fin:{q:[.86,.2,0],s:.8},ground:1},
 {g:'half',c:C.yellow,hero:{p:[.98,.02,-.95],r:[0,-.2,0]},sc:{q:[.22,.8,.5],r:[0,.4,.2],s:.42},fin:{q:[.93,.62,-1],r:[0,.5,.3],s:.45},ground:1},
 {g:'webads',hero:{p:[.55,-.74,.4],r:[0,-.22,0],s:.85},sc:{q:[.93,.26,-1],r:[.3,-.5,.1],s:.5},slot:3,slotR:[.15,-.42,0],fin:{q:[.1,.82,0],r:[.3,.6,0],s:.45},ground:1},
 {g:'uxui',hero:{p:[1.55,-.62,.9],r:[0,-.45,.05],s:.85},sc:{q:[.08,.47,1.5],r:[.2,.4,.1],s:.95},slot:2,slotR:[.1,-.35,.05],fin:{q:[.9,.88,1],r:[.6,.3,0],s:.75},ground:1},
 {g:'quarter',c:C.pink,hero:{p:[-1.7,-.8,.45],r:[0,.5,0],s:.85},sc:{q:[.85,.7,.5],r:[.3,.5,.2],s:.5},fin:{q:[.05,.62,.5],r:[.2,.3,.3],s:.45},ground:1},
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
const meshes=D.map((d,i)=>{let m;
  if(M[d.g]){m=M[d.g]();d.nom=m.userData.nom;d.hh=m.userData.hh;d.model=1;}
  else{m=new THREE.Mesh(G[d.g],mat(d.c));m.castShadow=true;m.receiveShadow=true;d.nom=nom(G[d.g]);const z=new THREE.Vector3();G[d.g].boundingBox.getSize(z);d.hh=z.y/2;}
  m.userData.di=i;
  scene.add(m);d.phase=i*1.7;d.spin=(i%2?1:-1)*(.25+(i%5)*.07);return m;});
meshes[0].castShadow=false;
// soft shadow under the pedestal, falling onto the page background (down-right, away from the key light)
{const n=256,cv=document.createElement('canvas');cv.width=cv.height=n;const x=cv.getContext('2d'),g=x.createRadialGradient(n/2,n/2,0,n/2,n/2,n/2);
  g.addColorStop(0,'rgba(6,16,80,.8)');g.addColorStop(.6,'rgba(6,16,80,.45)');g.addColorStop(1,'rgba(8,20,90,0)');x.fillStyle=g;x.fillRect(0,0,n,n);
  const blob=new THREE.Mesh(new THREE.PlaneGeometry(7.2,7.2),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthWrite:false}));
  blob.rotation.x=-Math.PI/2; blob.position.set(.7,-.33,.3); blob.renderOrder=-1; meshes[0].add(blob);}

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
// ---- poke: click one piece of the sculpture and only that piece squashes & bounces ----
const ray=new THREE.Raycaster(), ptr=new THREE.Vector2(-9,-9);
const tip=document.createElement('div');tip.className='poke-tip';tip.textContent='POKE';document.body.appendChild(tip);
let hoverI=-1, pokeOK=false;
addEventListener('pointermove',e=>{ptr.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);tip.style.transform=`translate(${e.clientX+14}px,${e.clientY+12}px)`;},{passive:true});
const owner=o=>{while(o&&o.userData.di===undefined)o=o.parent;return o?o.userData.di:-1;};
function pick(){if(!pokeOK){hoverI=-1;return;}ray.setFromCamera(ptr,camera);
  const hit=ray.intersectObjects(meshes.filter((m,i)=>i>0&&!D[i].x&&m.visible),true)[0];hoverI=hit?owner(hit.object):-1;}
addEventListener('pointerdown',()=>{if(hoverI<1)return;const now=clock.getElapsedTime();D[hoverI].poke=now;
  D.forEach(d=>{if(d.on===hoverI)d.hop=now;});});   // the piece sitting on top hops

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

  pokeOK=!reduce&&(t1<.25||t4>.75); pick();
  tip.classList.toggle('on',hoverI>0); document.body.style.cursor=hoverI>0?'pointer':'';
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
    if(d.model) spinQ.setFromEuler(E.set(Math.sin(d.acc*.7)*.15*g,Math.sin(d.acc)*.55*g,0)); // work models sway instead of spinning
    else spinQ.setFromEuler(E.set(d.acc*.6*(1-t2*(d.slot!==undefined?1:0))*g,d.acc*g,0));
    m.position.copy(cur.p); m.quaternion.copy(cur.q).multiply(spinQ);
    let sy=1,lift=0;
    if(d.poke!==undefined){const p=t-d.poke; if(p<1.6) sy=1-.24*Math.exp(-4.2*p)*Math.cos(15*p); else d.poke=undefined;}
    if(d.hop!==undefined){const p=t-d.hop; if(p<1.6) lift=Math.abs(Math.sin(9*p))*Math.exp(-3.2*p)*.9; else d.hop=undefined;}
    const sc=Math.max(cur.s,1e-4), sxz=1/Math.sqrt(sy);
    m.scale.set(sc*sxz,sc*sy,sc*sxz);
    m.position.y+=(-(1-sy)+lift*2)*d.hh*sc;   // squash keeps the base on the floor
    m.visible=cur.s>1e-3 && cur.p.y>-visH(cur.p.z)*1.2 && cur.p.y<visH(cur.p.z)*1.2;
  });
  renderer.render(scene,camera);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
