(function(){
'use strict';
const E=window.PixelEngine,$=id=>document.getElementById(id);
const screen=$('screen'),lens=$('lens'),lctx=lens.getContext('2d');
const source=document.createElement('canvas');source.width=E.W;source.height=E.H;
const renderer=window.PixelRenderer.createRenderer(screen,source);
const sound=window.PixelAudio.create();
const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
const coarsePointer=window.matchMedia('(pointer: coarse)');
let touchAim=coarsePointer.matches;
let stage,index=0,misses=0,hints=0,precision=false,anchor=null,selection=null,clear=false;
let startedAt=null,elapsed=0,hintTimer=null,renderState='ready';
let motionPaused=motionPreference.matches,motionStarted=performance.now(),motionOffset=0,lastDraw=0,animationId=null,hiddenAt=null;
const seed=()=>window.crypto.getRandomValues(new Uint32Array(1))[0];
const clamp=(v,max)=>Math.max(0,Math.min(max-1,v));
const time=ms=>{const s=Math.floor(ms/1000);return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');};
function runningTime(){return elapsed+(startedAt===null?0:performance.now()-startedAt);}
function startClock(){if(startedAt===null&&!clear)startedAt=performance.now();}
function stopClock(){if(startedAt!==null){elapsed+=performance.now()-startedAt;startedAt=null;}}
function message(text,kind=''){const n=$('feedback');n.textContent=text;n.className=kind?'feedback-'+kind:'';}
function motionTime(){return motionOffset+(motionPaused?0:(performance.now()-motionStarted)/1000);}
function drawScreen(){renderState=renderer.render(stage,motionTime());drawLens();}
function drawLens(){
 lctx.imageSmoothingEnabled=false;lctx.fillStyle='#21242a';lctx.fillRect(0,0,256,256);
 if(!anchor){lctx.strokeStyle='#313743';for(let x=0;x<256;x+=16){lctx.beginPath();lctx.moveTo(x,0);lctx.lineTo(x,256);lctx.moveTo(0,x);lctx.lineTo(256,x);lctx.stroke();}return;}
 lctx.drawImage(source,0,0,E.W,E.H,(16-anchor.x)*8,(16-anchor.y)*8,E.W*8,E.H*8);
 lctx.strokeStyle='rgba(16,17,19,.13)';for(let x=0;x<256;x+=8){lctx.beginPath();lctx.moveTo(x,0);lctx.lineTo(x,256);lctx.moveTo(0,x);lctx.lineTo(256,x);lctx.stroke();}
 $('lensCursor').style.left=((selection.x-anchor.x+16)/32*100)+'%';$('lensCursor').style.top=((selection.y-anchor.y+16)/32*100)+'%';
}
function updatePosition(x,y,pin=false){
 anchor={x:Math.floor(clamp(x,E.W)),y:Math.floor(clamp(y,E.H))};selection={...anchor};$('confirm').disabled=clear||renderState==='loading';drawLens();coordinates();
 showAimCircle(selection.x,selection.y);
 if(pin){removeAim();const m=document.createElement('div');m.className='aim-marker';m.style.left=(anchor.x/E.W*100)+'%';m.style.top=(anchor.y/E.H*100)+'%';$('markers').appendChild(m);}
}
function removeAim(){const n=$('markers').querySelector('.aim-marker');if(n)n.remove();}
function coordinates(){if(selection)$('coordinates').textContent='X '+String(selection.x).padStart(3,'0')+'  Y '+String(selection.y).padStart(3,'0');}
function screenPoint(ev){const b=screen.getBoundingClientRect();return{x:(ev.clientX-b.left)/b.width*E.W,y:(ev.clientY-b.top)/b.height*E.H};}
function tolerance(precise){return precise?20*32/Math.max(1,lens.getBoundingClientRect().width):(touchAim?18:14)*E.W/Math.max(1,screen.getBoundingClientRect().width);}
function showAimCircle(x,y){const n=$('aimCircle');n.hidden=precision||clear;if(n.hidden)return;const diameter=(touchAim?18:14)*2;n.style.width=diameter+'px';n.style.height=diameter+'px';n.style.left=x/E.W*100+'%';n.style.top=y/E.H*100+'%';}
function attempt(x,y,precise=false){
 if(!Number.isFinite(x)||!Number.isFinite(y)||x<0||y<0||x>=E.W||y>=E.H)throw new RangeError('Coordinates outside screen');
 if(clear)return{status:'level_complete'};
 if(!precise)showAimCircle(x,y);
 if(renderState==='loading'){message('Loading the photograph. One moment.');return{status:'loading'};}
 startClock();const t=E.hitTest(stage,x,y,tolerance(precise));
 if(!t){misses++;$('misses').textContent=misses;message('That spot is fine. Keep looking.','miss');sound.play('incorrect');return{status:'miss',found:stage.targets.filter(t=>t.found).length};}
 t.found=true;sound.play('correct');clearTimeout(hintTimer);const hint=$('markers').querySelector('.hint-marker');if(hint)hint.remove();
 const m=document.createElement('div');m.className='marker';m.style.left=((t.x+t.size/2)/E.W*100)+'%';m.style.top=((t.y+t.size/2)/E.H*100)+'%';$('markers').appendChild(m);
 const found=stage.targets.filter(t=>t.found).length;$('found').textContent=found;
 const remaining=stage.targets.length-found;message('Found! '+remaining+' '+(remaining===1?'defect':'defects')+' left.','hit');drawScreen();
 if(found===stage.targets.length)finishLevel();return{status:clear?'level_complete':'found',found};
}
function finishLevel(){
 clear=true;$('aimCircle').hidden=true;stopClock();$('timer').textContent=time(elapsed);$('confirm').disabled=true;$('hint').disabled=true;$('precision').disabled=true;$('motion').disabled=true;$('complete').hidden=false;
 const last=index===E.levels.length-1;$('completeLabel').textContent=last?'ALL 20 LEVELS COMPLETE':'LEVEL CLEAR';
 $('completeTitle').textContent=last?'GAME CLEAR':index===0?'One pixel found.':'Screen repaired.';
 $('completeText').textContent=last?'All '+E.levels.length+' levels · '+time(elapsed)+' · '+misses+' misses · '+hints+' hints':'Level '+String(index+1).padStart(2,'0')+' complete. Ready for a closer look?';
 $('next').textContent=last?'Start again from level 1':'Next level';message(last?'GAME CLEAR! Every last pixel found. Well spotted.':'All defects found. Continue when you are ready.','hit');$('next').focus({preventScroll:true});track();
}
function track(){
 $('levelTrack').replaceChildren();E.levels.forEach((_,i)=>{const n=document.createElement('span');n.className=i<index||i===index&&clear?'done':i===index?'current':'';n.setAttribute('aria-label','Level '+(i+1)+(i<index||i===index&&clear?' complete':i===index?' playing':''));$('levelTrack').appendChild(n);});
}
function motionControls(){
 $('motion').disabled=!stage.cfg.motion||clear;$('motion').setAttribute('aria-pressed',String(!!stage.cfg.motion&&motionPaused));$('motion').textContent=!stage.cfg.motion?'Static background':motionPaused?'Resume motion':'Pause motion';
}
function soundControls(){
 const on=sound.supported&&sound.enabled;
 $('sound').disabled=!sound.supported;$('sound').setAttribute('aria-pressed',String(on));
 $('sound').textContent=!sound.supported?'Sound unavailable':on?'Sound on':'Sound off';
 $('sound').setAttribute('aria-label',!sound.supported?'Sound effects are unavailable in this browser.':on?'Sound on. Click to mute sound effects.':'Sound off. Click to enable sound effects.');
}
function setMotionPaused(value){motionOffset=motionTime();motionStarted=performance.now();motionPaused=value;motionControls();drawScreen();}
function loadLevel(i){
 index=i;stage=E.createStage(i,seed());clear=false;precision=false;anchor=null;selection=null;motionOffset=0;motionStarted=performance.now();clearTimeout(hintTimer);
 $('markers').replaceChildren();$('aimCircle').hidden=true;$('complete').hidden=true;$('level').textContent=String(i+1).padStart(2,'0');$('difficulty').textContent=stage.cfg.tag;$('stageTitle').textContent=stage.cfg.title;$('stageDescription').textContent=stage.cfg.description;
 $('targetCount').textContent=stage.cfg.count;$('found').textContent='0';$('pixelInfo').textContent=stage.cfg.size+' × '+stage.cfg.size+' px';$('coordinates').textContent='X —  Y —';
 $('precision').disabled=false;$('precision').setAttribute('aria-pressed','false');$('precision').textContent='Pin & zoom';$('hint').disabled=false;$('confirm').disabled=true;$('screenMode').textContent=stage.cfg.motion?'Background moves. Defects stay put.':'Keep a defect inside the circle, then click';
 $('lensHelp').textContent='Keep a defect inside the circle to repair it. Use “Pin & zoom” for a closer look.';$('lensCursor').style.left='50%';$('lensCursor').style.top='50%';
 track();motionControls();drawScreen();
 message(renderState==='loading'?'Loading the photograph. One moment.':renderState==='fallback'?'Photo unavailable. A moving pattern is shown instead.':i===0?'Ready when you are. Look for the square that does not belong.':'Level '+(i+1)+'. Find '+stage.cfg.count+' defects.');
}
function restart(){sound.silence();stopClock();elapsed=0;misses=0;hints=0;$('misses').textContent='0';$('hintCount').textContent='0 used';$('timer').textContent='00:00';loadLevel(0);}
function togglePrecision(){
 if(clear)return;precision=!precision;$('precision').setAttribute('aria-pressed',String(precision));$('precision').textContent=precision?'Return to direct clicks':'Pin & zoom';
 $('screenMode').textContent=precision?'Click the screen to pin the scope':stage.cfg.motion?'Background moves. Defects stay put.':'Keep a defect inside the circle, then click';
 $('lensHelp').textContent=precision?'1. Tap the screen to pin a spot. 2. Keep the defect inside the scope circle. 3. Press “Click this spot”.':'Keep a defect inside the circle to repair it. Use “Pin & zoom” for a closer look.';
 removeAim();$('aimCircle').hidden=true;if(!precision&&selection)showAimCircle(selection.x,selection.y);message(precision?'Scope mode. Click a spot on the screen to hold it in the magnifier.':'Direct mode. Keep a defect inside the circle, then click.');
}
function showHint(){
 if(clear||renderState==='loading')return;startClock();hints++;$('hintCount').textContent=hints+' used';clearTimeout(hintTimer);const old=$('markers').querySelector('.hint-marker');if(old)old.remove();
 if(precision)togglePrecision();
 const t=stage.targets.find(t=>!t.found),m=document.createElement('div');m.className='hint-marker';m.style.left=((t.x+t.size/2+14)/E.W*100)+'%';m.style.top=((t.y+t.size/2-12)/E.H*100)+'%';$('markers').appendChild(m);hintTimer=setTimeout(()=>m.remove(),4500);message('A defect is inside the circle. You can click while it fades.');
}
screen.addEventListener('pointerdown',ev=>{touchAim=ev.pointerType==='touch'||coarsePointer.matches;if(!clear&&!precision){const p=screenPoint(ev);updatePosition(p.x,p.y);}});
screen.addEventListener('pointerleave',()=>{if(!precision)$('aimCircle').hidden=true;});
screen.addEventListener('pointermove',ev=>{if(!clear&&!precision&&ev.pointerType!=='touch'){const p=screenPoint(ev);updatePosition(p.x,p.y);}});
screen.addEventListener('click',ev=>{if(clear)return;const p=screenPoint(ev);if(precision){startClock();updatePosition(p.x,p.y,true);message('Spot pinned. Adjust your aim in the scope, then click this spot.');}else{updatePosition(p.x,p.y);attempt(p.x,p.y);}});
function lensPoint(ev){if(!anchor||clear)return;const b=lens.getBoundingClientRect();selection={x:Math.floor(clamp(anchor.x-16+(ev.clientX-b.left)/b.width*32,E.W)),y:Math.floor(clamp(anchor.y-16+(ev.clientY-b.top)/b.height*32,E.H))};drawLens();coordinates();}
lens.addEventListener('pointerdown',ev=>{if(!anchor||clear)return;ev.preventDefault();lens.setPointerCapture(ev.pointerId);lensPoint(ev);});lens.addEventListener('pointermove',ev=>{if(ev.buttons===1)lensPoint(ev);});
function keyboard(ev){
 if(clear)return;if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();if(selection)attempt(selection.x,selection.y,ev.currentTarget!==screen);return;}
 if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(ev.key))return;ev.preventDefault();const p=selection||{x:E.W/2,y:E.H/2},step=ev.shiftKey?1:4;const x=clamp(p.x+(ev.key==='ArrowRight'?step:ev.key==='ArrowLeft'?-step:0),E.W),y=clamp(p.y+(ev.key==='ArrowDown'?step:ev.key==='ArrowUp'?-step:0),E.H);updatePosition(x,y,true);
}
screen.addEventListener('keydown',keyboard);lens.addEventListener('keydown',keyboard);$('precision').addEventListener('click',togglePrecision);$('confirm').addEventListener('click',()=>{if(selection)attempt(selection.x,selection.y,true);});$('hint').addEventListener('click',showHint);$('restart').addEventListener('click',restart);$('next').addEventListener('click',()=>{if(index===E.levels.length-1)restart();else loadLevel(index+1);});
$('motion').addEventListener('click',()=>{if(!stage.cfg.motion||clear)return;setMotionPaused(!motionPaused);message(motionPaused?'Background paused. The defects are still there.':'Background moving. Look for the pixels that stay put.');});
$('sound').addEventListener('click',()=>{sound.setEnabled(!sound.enabled);soundControls();});
setInterval(()=>{if(!clear)$('timer').textContent=time(runningTime());},250);
function photoReady(){if(!stage?.cfg.photo||clear)return;drawScreen();$('confirm').disabled=!selection||renderState==='loading';message(renderState==='fallback'?'Photo unavailable. A moving pattern is shown instead.':renderState==='loading'?'Loading the photograph. One moment.':'Find '+stage.cfg.count+' defects in the photograph.');}
window.addEventListener('pixelphotoready',photoReady);window.addEventListener('pixelphotoerror',photoReady);window.addEventListener('resize',()=>drawScreen());
motionPreference.addEventListener('change',ev=>setMotionPaused(ev.matches));
function tick(now){if(!document.hidden&&!clear&&stage.cfg.motion&&!motionPaused&&now-lastDraw>=42){drawScreen();lastDraw=now;}if(!document.hidden)animationId=requestAnimationFrame(tick);}
document.addEventListener('visibilitychange',()=>{if(document.hidden){sound.silence();hiddenAt=performance.now();cancelAnimationFrame(animationId);animationId=null;}else{if(hiddenAt!==null){motionStarted+=performance.now()-hiddenAt;hiddenAt=null;}if(animationId===null)animationId=requestAnimationFrame(tick);}});
soundControls();loadLevel(0);animationId=requestAnimationFrame(tick);
const readState=()=>({level:index+1,totalLevels:E.levels.length,found:stage.targets.filter(t=>t.found).length,total:stage.targets.length,misses,hints,complete:clear,background:stage.cfg.pattern,motion:!!stage.cfg.motion,motionPaused,elapsedSeconds:Math.floor(runningTime()/1000)});
if(document.modelContext?.registerTool){
 const lifecycle=new AbortController();const register=t=>{try{Promise.resolve(document.modelContext.registerTool(t,{signal:lifecycle.signal})).catch(()=>{});}catch{}};
 register({name:'get_pixel_game_state',description:'Read the current level and progress without revealing hidden pixels.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>readState()});
 register({name:'click_pixel_coordinates',description:'Click a location on the 960 by 540 game screen using the same circular hit area as the magnifier. This may find a pixel or count a miss.',inputSchema:{type:'object',properties:{x:{type:'integer',minimum:0,maximum:959},y:{type:'integer',minimum:0,maximum:539}},required:['x','y'],additionalProperties:false},annotations:{readOnlyHint:false},execute:input=>{if(!input||!Number.isInteger(input.x)||!Number.isInteger(input.y)||Object.keys(input).some(k=>!['x','y'].includes(k)))throw new TypeError('Expected integer x and y');const result=attempt(input.x,input.y,true);return{...result,...readState()};}});
 register({name:'advance_pixel_level',description:'Advance to the next level only after finding all defects. At the end of level 20, start a new game.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:false},execute:()=>{if(!clear)throw new Error('Find all pixels before advancing');if(index===E.levels.length-1)restart();else loadLevel(index+1);return readState();}});
 window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
})();
