
(function(){
/* LOADER */
var killed=false;
function kill(){
  if(killed)return;killed=true;
  var l=document.getElementById('loader');
  l.style.transition='opacity .8s ease';l.style.opacity='0';
  setTimeout(function(){l.style.display='none';},850);
  document.getElementById('bgImg').src=document.getElementById('bgImg').dataset.src;
}
setTimeout(kill,1400);setTimeout(kill,2600);

/* CURSOR */
var cur=document.getElementById('cur'),mx=0,my=0,lastTrail=0;
document.addEventListener('mousemove',function(e){
  mx=e.clientX;my=e.clientY;
  if(cur){cur.style.left=mx+'px';cur.style.top=my+'px';cur.classList.add('on');}
  var now=Date.now();
  if(now-lastTrail>50){lastTrail=now;
    var t=document.createElement('div');t.className='trail';
    var s=4+Math.random()*5;
    t.style.cssText='width:'+s+'px;height:'+s+'px;left:'+mx+'px;top:'+my+'px;';
    document.body.appendChild(t);setTimeout(function(){if(t.parentNode)t.remove();},800);
  }
  var el=document.elementFromPoint(mx,my);
  if(cur)cur.classList.toggle('h',!!(el&&(el.closest('a')||el.closest('button')||el.closest('.mp-play-wrap'))));
});

/* PARALLAX */
var bgImg=document.getElementById('bgImg');
document.addEventListener('mousemove',function(e){
  var dx=(e.clientX/innerWidth-.5)*5,dy=(e.clientY/innerHeight-.5)*3;
  bgImg.style.transform='translate(calc(-5% + '+dx+'px),calc(-5% + '+dy+'px))';
});

/* THREE.JS */
var renderer=new THREE.WebGLRenderer({canvas:document.getElementById('threeCanvas'),alpha:true,antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight);
renderer.setClearColor(0x000000,0);
var scene=new THREE.Scene();
var camera=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,.1,200);
camera.position.z=22;
window.addEventListener('resize',function(){
  camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
});
scene.add(new THREE.AmbientLight(0xa8dff0,.4));
var pt=new THREE.PointLight(0xa8dff0,2,60);pt.position.set(10,10,10);scene.add(pt);
var pt2=new THREE.PointLight(0x7ec8e3,1.2,40);pt2.position.set(-12,-8,6);scene.add(pt2);
var wireMat=new THREE.MeshStandardMaterial({color:0xa8dff0,wireframe:true,transparent:true,opacity:.18});
var glassMat=new THREE.MeshStandardMaterial({color:0xc0e8f8,metalness:.3,roughness:.1,transparent:true,opacity:.22,side:THREE.DoubleSide});
var glowMat=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xa8dff0,emissiveIntensity:.4,transparent:true,opacity:.35});
var shapes=[
  [new THREE.IcosahedronGeometry(1.6,0),glassMat,[-9,4,2]],
  [new THREE.IcosahedronGeometry(.9,0),wireMat,[9,-3,1]],
  [new THREE.OctahedronGeometry(1.3,0),glassMat,[7,5,-3]],
  [new THREE.OctahedronGeometry(.7,0),wireMat,[-8,-5,3]],
  [new THREE.TetrahedronGeometry(1.1,0),glowMat,[-5,-2,-2]],
  [new THREE.TetrahedronGeometry(.6,0),wireMat,[6,2,4]],
  [new THREE.TorusGeometry(.9,.28,12,40),glassMat,[0,6,0]],
  [new THREE.TorusGeometry(.5,.16,10,30),wireMat,[-6,1,-4]],
  [new THREE.TorusKnotGeometry(.7,.2,80,12),glowMat,[-2,-5,2]],
];
var objects=[];
shapes.forEach(function(s){
  var m=new THREE.Mesh(s[0],s[1].clone());
  m.position.set(s[2][0],s[2][1],s[2][2]);
  m.rotation.set(Math.random()*Math.PI,Math.random()*Math.PI,0);
  m.userData={fy:m.position.y,fa:.4+Math.random()*.6,fs:.3+Math.random()*.5,
    rs:{x:(Math.random()-.5)*.008,y:(Math.random()-.5)*.008,z:(Math.random()-.5)*.004}};
  scene.add(m);objects.push(m);
});
var ptGeo=new THREE.BufferGeometry();
var pc=260,pp=new Float32Array(pc*3);
for(var i=0;i<pc*3;i++)pp[i]=(Math.random()-.5)*50;
ptGeo.setAttribute('position',new THREE.BufferAttribute(pp,3));
var ptMesh=new THREE.Points(ptGeo,new THREE.PointsMaterial({color:0xd0f0ff,size:.09,transparent:true,opacity:.5,sizeAttenuation:true}));
scene.add(ptMesh);
var tX=0,tY=0,cX=0,cY=0;
document.addEventListener('mousemove',function(e){tX=(e.clientX/innerWidth-.5)*2.5;tY=-(e.clientY/innerHeight-.5)*1.8;});
var clock=new THREE.Clock();
(function animate(){
  requestAnimationFrame(animate);
  var t=clock.getElapsedTime();
  cX+=(tX-cX)*.04;cY+=(tY-cY)*.04;
  camera.position.x=cX;camera.position.y=cY;camera.lookAt(scene.position);
  objects.forEach(function(o,i){
    o.rotation.x+=o.userData.rs.x;o.rotation.y+=o.userData.rs.y;o.rotation.z+=o.userData.rs.z;
    o.position.y=o.userData.fy+Math.sin(t*o.userData.fs+i)*o.userData.fa;
  });
  ptMesh.rotation.y=t*.02;ptMesh.rotation.x=t*.01;
  renderer.render(scene,camera);
})();

/* CARD TILT */
document.querySelectorAll('.card3d').forEach(function(card){
  card.addEventListener('mousemove',function(e){
    var r=card.getBoundingClientRect();
    var rx=(e.clientY-r.top-r.height/2)/r.height*14;
    var ry=(e.clientX-r.left-r.width/2)/r.width*-14;
    card.style.transform='perspective(600px) rotateX('+rx+'deg) rotateY('+ry+'deg) translateZ(12px)';
  });
  card.addEventListener('mouseleave',function(){card.style.transform='';});
});

/* CLICK RIPPLE */
var rs=document.createElement('style');
rs.textContent='@keyframes cr{to{transform:translate(-50%,-50%) scale(3.5);opacity:0;}}';
document.head.appendChild(rs);
document.addEventListener('click',function(e){
  for(var i=0;i<3;i++){(function(i){
    var d=document.createElement('div');
    d.style.cssText='position:fixed;border-radius:50%;pointer-events:none;z-index:9990;left:'+e.clientX+'px;top:'+e.clientY+'px;transform:translate(-50%,-50%) scale(0);border:1px solid rgba(168,223,240,'+(0.5-i*.14)+');width:'+(i+1)*38+'px;height:'+(i+1)*38+'px;animation:cr .65s '+i*.1+'s ease-out forwards;';
    document.body.appendChild(d);setTimeout(function(){if(d.parentNode)d.remove();},900);
  })(i);}
});

/* COUNTER */
/* counter: wait for loader to finish then count up */
setTimeout(function(){
  var el=document.getElementById('pct');
  if(!el)return;
  el.textContent='0%';
  var start=performance.now();
  var dur=1800;
  function step(now){
    var p=Math.min((now-start)/dur,1);
    el.textContent=Math.floor(p*100)+'%';
    if(p<1)requestAnimationFrame(step);
    else el.textContent='100%';
  }
  requestAnimationFrame(step);
},2200);

/* SCROLL */
var hint=document.getElementById('sHint'),tb=document.getElementById('topBtn');
if(tb){
  window.addEventListener('scroll',function(){
    if(hint)hint.style.opacity=Math.max(0,1-window.scrollY/100)+'';
    tb.classList.toggle('on',window.scrollY>200);
  });
  tb.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'});});
}

/* REVEAL */
var io=new IntersectionObserver(function(es){
  es.forEach(function(e){
    if(e.isIntersecting){
      e.target.style.transition='opacity .9s ease,transform .9s cubic-bezier(.16,1,.3,1)';
      e.target.style.opacity='1';e.target.style.transform='translateY(0)';
      io.unobserve(e.target);
    }
  });
},{threshold:.12});
document.querySelectorAll('.stats,.btns,.socials,.hero-copy').forEach(function(el){io.observe(el);});

/* ══ MUSIC PLAYER ══ */
(function(){
  var tracks=['track1.mp3','track2.mp3','track3.mp3','track4.mp3','track5.mp3'];

  /* ── Spin the wheel: persist chosen track + refresh count ── */
  var LIMIT=6;
  var stored=null;
  try{ stored=JSON.parse(localStorage.getItem('mythicalTrack')); }catch(e){}

  if(!stored||typeof stored.idx==='undefined'){
    stored={idx:Math.floor(Math.random()*tracks.length),count:1};
  } else {
    stored.count=(stored.count||0)+1;
    if(stored.count>LIMIT){
      /* pick a NEW random track different from current */
      var prev=stored.idx;
      var next=prev;
      while(next===prev&&tracks.length>1) next=Math.floor(Math.random()*tracks.length);
      stored={idx:next,count:1};
    }
  }
  try{ localStorage.setItem('mythicalTrack',JSON.stringify(stored)); }catch(e){}

  var trackIdx=stored.idx;
  var playing=false;
  var aud=new Audio();
  aud.volume=0.75;
  aud.loop=true; /* single track loops forever */
  aud.src=tracks[trackIdx];

  var playBtn=document.getElementById('mpPlay');
  var playIco=document.getElementById('mpPlayIcon');
  var fill   =document.getElementById('mpFill');
  var curEl  =document.getElementById('mpCur');
  var durEl  =document.getElementById('mpDur');
  var bar    =document.getElementById('mpBar');

  if(!playBtn||!playIco||!fill||!curEl||!durEl||!bar)return;

  function fmt(s){s=Math.floor(s||0);return Math.floor(s/60)+':'+(s%60<10?'0':'')+s%60;}

  function setPlay(p){
    playing=p;
    playIco.innerHTML=p
      ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="3" width="4" height="18" rx="1"/><rect x="15" y="3" width="4" height="18" rx="1"/></svg>'
      : '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l16 8-16 8z"/></svg>';
    if(p) aud.play().catch(function(){});
    else  aud.pause();
  }

  aud.addEventListener('timeupdate',function(){
    if(!aud.duration)return;
    fill.style.width=(aud.currentTime/aud.duration*100)+'%';
    curEl.textContent=fmt(aud.currentTime);
  });
  aud.addEventListener('loadedmetadata',function(){durEl.textContent=fmt(aud.duration);});

  /* seek bar drag (mouse + touch) */
  var drag=false;
  bar.addEventListener('mousedown',function(e){drag=true;seek(e);});
  document.addEventListener('mousemove',function(e){if(drag)seek(e);});
  document.addEventListener('mouseup',function(){drag=false;});
  /* touch support */
  bar.addEventListener('touchstart',function(e){drag=true;seekTouch(e);e.preventDefault();},{passive:false});
  document.addEventListener('touchmove',function(e){if(drag)seekTouch(e);});
  document.addEventListener('touchend',function(){drag=false;});
  function seekTouch(e){
    var touch=e.touches[0];
    if(!touch)return;
    var r=bar.getBoundingClientRect();
    var p=Math.max(0,Math.min(1,(touch.clientX-r.left)/r.width));
    if(aud.duration)aud.currentTime=p*aud.duration;
    fill.style.width=(p*100)+'%';
  }
  function seek(e){
    var r=bar.getBoundingClientRect();
    var p=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));
    if(aud.duration)aud.currentTime=p*aud.duration;
    fill.style.width=(p*100)+'%';
  }

  playBtn.addEventListener('click',function(){setPlay(!playing);});

  /* music toggle button */
  var togBtn = document.getElementById('musicToggle');
  var mpEl = document.getElementById('mp');
  if(togBtn&&mpEl){
    togBtn.addEventListener('click', function() {
      mpEl.classList.toggle('mp-open');
      togBtn.classList.toggle('active');
    });
  }

  /* seek buttons ±10s */
  document.getElementById('mpSeekB').addEventListener('click',function(){aud.currentTime=Math.max(0,aud.currentTime-10);});
  document.getElementById('mpSeekF').addEventListener('click',function(){aud.currentTime=Math.min(aud.duration||0,aud.currentTime+10);});
})();

})();

