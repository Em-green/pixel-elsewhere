(function(root){
'use strict';
const W=960,H=540;
const levels=[
{title:'The first imperfection.',description:'Find the odd square. Click it to repair the screen.',tag:'WARM-UP',size:14,count:1,bg:'#7b98ef',color:'#15213f',pattern:'solid'},
{title:'There is another.',description:'Two defects this time. Find both to move on.',tag:'WARM-UP',size:10,count:2,bg:'#99d1c3',color:'#223e38',pattern:'solid'},
{title:'White silence.',description:'Three dark squares, hiding in plain sight.',tag:'BEGINNER',size:7,count:3,bg:'#e6e8ed',color:'#292e3a',pattern:'solid'},
{title:'A little light.',description:'Find the bright pixels that do not belong.',tag:'BEGINNER',size:6,count:3,bg:'#19212f',color:'#b1c4f0',pattern:'solid'},
{title:'A sea of color.',description:'The color changes across the screen. The defects are square.',tag:'INTERMEDIATE',size:5,count:3,bg:'#6a88df',color:'#1d3269',pattern:'gradient'},
{title:'Almost the same.',description:'Less contrast. Move your eyes slowly.',tag:'INTERMEDIATE',size:4,count:3,bg:'#a6b4cb',color:'#737f95',pattern:'solid'},
{title:'Between the lines.',description:'Four defects are hiding among the stripes.',tag:'INTERMEDIATE',size:4,count:4,bg:'#adb4cc',color:'#6e768e',pattern:'stripes'},
{title:'Three pixels wide.',description:'Use the scope to check the smallest details.',tag:'ADVANCED',size:3,count:4,bg:'#4463a3',color:'#6d87bd',pattern:'gradient'},
{title:'A subtle difference.',description:'Pin a spot in the scope to place your click precisely.',tag:'ADVANCED',size:3,count:4,bg:'#b0b8c6',color:'#939baa',pattern:'stripes'},
{title:'Stay still in the static.',description:'The noise moves. The four bright defects stay put.',tag:'ADVANCED',size:2,count:4,bg:'#6c7b9b',color:'#f4f6ff',pattern:'noise',motion:true},
{title:'Against the current.',description:'The stripes drift. Five small defects do not.',tag:'EXPERT',size:2,count:5,bg:'#8296bf',pattern:'drift',motion:true,adaptive:true},
{title:'A moving spectrum.',description:'Follow the changing colors, then look for what stays fixed.',tag:'EXPERT',size:2,count:5,bg:'#8296bf',pattern:'waves',motion:true,adaptive:true},
{title:'Off the grid.',description:'A shifting grid makes still defects harder to recognize.',tag:'EXPERT',size:2,count:5,bg:'#8296bf',pattern:'grid',motion:true,adaptive:true},
{title:'Signal in the noise.',description:'Smaller grains. Five fixed points. Let the motion reveal them.',tag:'EXPERT',size:2,count:5,bg:'#6c7b9b',color:'#f4f6ff',pattern:'fine-noise',motion:true},
{title:'Lost in the leaves.',description:'The leaves slowly zoom. Five defective pixels stay put.',tag:'MASTER',size:2,count:5,bg:'#808080',pattern:'photo',photo:'forest',motion:true,adaptive:true},
{title:'Below the surface.',description:'The water slowly zooms and drifts. Six defects stay still.',tag:'MASTER',size:2,count:6,bg:'#808080',pattern:'photo',photo:'water',motion:true,adaptive:true},
{title:'One pixel, one window.',description:'Six single pixels stay fixed as the city slowly zooms.',tag:'MASTER',size:1,count:6,bg:'#808080',pattern:'photo',photo:'city',motion:true,adaptive:true},
{title:'Between the books.',description:'The shelves zoom and drift. Six single pixels stay put.',tag:'MASTER',size:1,count:6,bg:'#808080',pattern:'photo',photo:'books',motion:true,adaptive:true},
{title:'Fault lines.',description:'Moving stone, drifting noise, and six tiny defects.',tag:'EXTREME',size:1,count:6,bg:'#808080',pattern:'photo-noise',photo:'rocks',motion:true,adaptive:true},
{title:'The last seven.',description:'Seven single pixels. Moving flowers. Drifting noise. Take your time.',tag:'FINAL LEVEL',size:1,count:7,bg:'#808080',pattern:'photo-noise',photo:'flowers',motion:true,adaptive:true}
];
function random(seed){let s=seed>>>0;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};}
function createStage(index,seed){if(!Number.isInteger(index)||index<0||index>=levels.length)throw new RangeError('Invalid level');const cfg=levels[index],rng=random(seed),targets=[];for(let i=0;i<cfg.count;i++){let p;do{p={x:40+Math.floor(rng()*(W-80-cfg.size)),y:40+Math.floor(rng()*(H-80-cfg.size)),size:cfg.size,found:false};}while(targets.some(t=>Math.hypot(t.x-p.x,t.y-p.y)<80));targets.push(p);}return{index,cfg,targets};}
function hitTest(stage,x,y,radius){if(!Number.isFinite(x)||!Number.isFinite(y)||!Number.isFinite(radius)||radius<0||x<0||x>=W||y<0||y>=H)return null;let nearest=null,best=Infinity;for(const t of stage.targets){if(t.found)continue;const dx=Math.max(t.x-x,0,x-(t.x+t.size)),dy=Math.max(t.y-y,0,y-(t.y+t.size));if(Math.hypot(dx,dy)>radius)continue;const distance=Math.hypot(t.x+t.size/2-x,t.y+t.size/2-y);if(distance<best){best=distance;nearest=t;}}return nearest;}
function contrastColor(r,g,b){return .2126*r+.7152*g+.0722*b>=128?'#0a0c12':'#f4f6ff';}
const api={W,H,levels,createStage,hitTest,random,contrastColor};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PixelEngine=api;
})(typeof window!=='undefined'?window:globalThis);
