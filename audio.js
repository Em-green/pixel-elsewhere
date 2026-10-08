(function(root){
'use strict';
function create(){
 const AudioContext=root.AudioContext||root.webkitAudioContext;
 let context=null,enabled=true,request=0,lastPlayed=-Infinity;
 const active=new Set();
 function silence(){
  request++;
  if(!context)return;
  const now=context.currentTime;
  for(const voice of active){
   try{
    voice.output.gain.cancelScheduledValues(now);
    voice.output.gain.setValueAtTime(voice.output.gain.value,now);
    voice.output.gain.linearRampToValueAtTime(0,now+.012);
    for(const source of voice.sources)source.stop(now+.018);
   }catch{}
  }
  active.clear();
 }
 function play(kind){
  if(!enabled||!AudioContext||document.hidden)return;
  try{
   if(!context||context.state==='closed'){context=new AudioContext();lastPlayed=-Infinity;}
   const audio=context,id=++request;
   const start=()=>{
    if(id!==request||!enabled||document.hidden||audio.state!=='running')return;
    const now=audio.currentTime;
    if(now-lastPlayed<.065)return;
    lastPlayed=now;silence();
    const output=audio.createGain();
    output.gain.setValueAtTime(kind==='correct'?.16:.12,now);
    output.connect(audio.destination);
    const voice={output,sources:[],remaining:kind==='correct'?2:1};active.add(voice);
    function note(type,frequency,offset,duration,volume,endFrequency,cutoff){
     const source=audio.createOscillator(),envelope=audio.createGain();
     const at=now+.005+offset,end=at+duration;
     source.type=type;source.frequency.setValueAtTime(frequency,at);
     if(endFrequency)source.frequency.exponentialRampToValueAtTime(endFrequency,end);
     envelope.gain.setValueAtTime(0,at);
     envelope.gain.linearRampToValueAtTime(volume,at+.009);
     envelope.gain.exponentialRampToValueAtTime(.0001,end-.012);
     envelope.gain.linearRampToValueAtTime(0,end);
     let filter=null;
     if(cutoff){filter=audio.createBiquadFilter();filter.type='lowpass';filter.frequency.setValueAtTime(cutoff,at);filter.Q.setValueAtTime(.5,at);source.connect(filter);filter.connect(envelope);}
     else source.connect(envelope);
     envelope.connect(output);voice.sources.push(source);
     source.onended=()=>{source.disconnect();envelope.disconnect();if(filter)filter.disconnect();if(--voice.remaining===0){output.disconnect();active.delete(voice);}};
     source.start(at);source.stop(end+.005);
    }
    if(kind==='correct'){
     note('sine',660,0,.14,.20);
     note('sine',990,.045,.17,.14);
    }else note('triangle',130,0,.115,.26,88,360);
   };
   if(audio.state==='running')start();
   else Promise.resolve(audio.resume()).then(start).catch(()=>{});
  }catch{}
 }
 return{play,silence,get supported(){return!!AudioContext;},get enabled(){return enabled;},setEnabled(value){enabled=!!value;if(!enabled)silence();}};
}
root.PixelAudio={create};
})(window);
