(()=>{'use strict';
if(typeof S==='undefined'||typeof render!=='function'||typeof tasks!=='function')return;
const legacy=S.vacation||{};
S.holiday=Object.assign({mode:legacy.enabled?'away':'normal',awayWake:legacy.wake||'08:00',awaySleep:legacy.sleep||'23:00',homeWake:'07:30',homeSleep:'22:30',intensity:'balanced'},S.holiday||{});
if(!['relaxed','balanced','productive'].includes(S.holiday.intensity))S.holiday.intensity='balanced';
delete S.vacation;save();
const normalTasks=tasks;
const hh=n=>`${String(Math.floor((n+1440)%1440/60)).padStart(2,'0')}:${String((n+1440)%1440%60).padStart(2,'0')}`;
const toMin=t=>{const [h,m]=(t||'00:00').split(':').map(Number);return h*60+m};
const durations={relaxed:45,balanced:60,productive:90};
const freeDurations={relaxed:180,balanced:120,productive:90};
const focusRotation=[
 [['Programming','Programming'],['Japanese / study','Study']],
 [['Side Hustle','Income'],['Study','Study']],
 [['Programming','Programming'],['Study','Study']],
 [['Study','Study'],['Side Hustle','Income']],
 [['Programming','Programming'],['Side Hustle','Income']],
 [['Study','Study'],['Programming','Programming']],
 [['Side Hustle','Income'],['Weekly review / study','Study']]
];
function makeHolidayTasks(mode){
 const out=[];
 const add=(id,d,t,start,end,c,loc='Other',fixed=0,p=1)=>out.push({id:`holiday-${mode}-${id}-${d}`,d,t,start,end,c,loc,fixed,p,holiday:mode});
 for(let d=0;d<7;d++){
  const away=mode==='away',wake=away?(S.holiday.awayWake||'08:00'):(S.holiday.homeWake||'07:30'),sleep=away?(S.holiday.awaySleep||'23:00'):(S.holiday.homeSleep||'22:30'),w=toMin(wake),s=toMin(sleep);
  add('wake',d,'Wake up',wake,hh(w+5),'Sleep','Home',1);
  add('med',d,'Meditation',hh(w+5),hh(w+10),'Meditation','Home');
  add('breakfast',d,'Breakfast',hh(w+10),hh(w+35),'Meal','Home',1);
  if(away){
   add('move',d,'Movement / holiday workout','10:00','10:45','Gym','Other',0,3);
   add('explore',d,'Explore / main holiday activity','11:00','14:00','Personal','Other',0,4);
   add('lunch',d,'Lunch','14:00','14:30','Meal','Other',1);
   add('free',d,'Free time / social time','15:00','19:00','Personal','Other',0,2);
   add('dinner',d,'Dinner','19:30','20:00','Meal','Other',1);
   add('stretch',d,'Stretching','21:30','21:40','Stretching','Home');
  }else{
   const training=['Push workout','Pull workout','Recovery walk + mobility','Badminton / legs','Upper workout','Lower workout / boxing','Easy endurance / recovery'];
   const cat=['Gym','Gym','Personal','Badminton','Gym','Gym','Endurance'];
   add('train',d,training[d],'09:00','10:15',cat[d],d===3?'Badminton':d===2?'Other':'Gym',0,5);
   const focusLen=durations[S.holiday.intensity]||60;
   const freeLen=freeDurations[S.holiday.intensity]||120;
   const firstStart=11*60+15,firstEnd=firstStart+focusLen;
   const secondStart=d===1||d===2?13*60+15:14*60,secondEnd=secondStart+focusLen;
   const pair=focusRotation[d];
   add('focus1',d,pair[0][0],hh(firstStart),hh(firstEnd),pair[0][1],'Home',0,4);
   add('lunch',d,'Lunch',hh(firstEnd+15),hh(firstEnd+45),'Meal','Home',1);
   add('focus2',d,pair[1][0],hh(secondStart),hh(secondEnd),pair[1][1],'Home',0,4);
   if(d===1||d===2){
    add('travelWork',d,'Travel to work','15:00','16:00','Commute','Work',1);
    add('work',d,'Work','16:00','20:00','Work','Work',1);
    add('travelHome',d,'Travel home','20:00','21:00','Commute','Home',1);
    add('dinner',d,'Dinner','21:00','21:20','Meal','Home',1);
    add('stretch',d,'Stretching','21:20','21:30','Stretching','Home');
   }else{
    const freeStart=Math.max(secondEnd+30,16*60),freeEnd=Math.min(freeStart+freeLen,19*60);
    add('free',d,'Protected free time',hh(freeStart),hh(freeEnd),'Personal','Home',0,1);
    add('walk',d,'Walk / recovery',hh(freeEnd+15),hh(freeEnd+60),'Personal','Other',0,2);
    add('dinner',d,'Dinner','19:30','20:00','Meal','Home',1);
    if(d===2||d===5)add('chess',d,'Chess practice','20:15','20:35','Chess','Home',0,2);
    if(d===6)add('progress',d,'Progress photo + weekly review','20:10','20:40','Planning','Home',0,3);
    add('stretch',d,'Stretching','21:30','21:40','Stretching','Home');
   }
  }
  add('sleep',d,'Sleep',sleep,hh(s+5),'Sleep','Home',1);
 }
 return out.concat((S.custom||[]).filter(x=>!x.hidden));
}
tasks=function(){return S.holiday.mode==='normal'?normalTasks():makeHolidayTasks(S.holiday.mode)};
let qTimer=null,qEnd=0,qRemain=0,qPaused=false,qCurrent=null;
function qPaint(){if(!qCurrent)return;const sec=Math.max(0,Math.ceil((qPaused?qRemain:qEnd-Date.now())/1000));focusTime.textContent=`${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;if(sec<=0)qFinish(true)}
function qStart(x){if(!x)return;qCurrent=x;const duration=Math.max(60,(mn(x.end)-mn(x.start))*60);qRemain=duration*1000;qEnd=Date.now()+qRemain;qPaused=false;focusPause.textContent='Pause';focusTitle.textContent=x.t;focus.classList.add('show');clearInterval(qTimer);qPaint();qTimer=setInterval(qPaint,250)}
function qFinish(ok){clearInterval(qTimer);qTimer=null;if(ok&&qCurrent){S.done[qCurrent.id]=true;save()}focus.classList.remove('show');qCurrent=null;qPaused=false;qRemain=0;qEnd=0;focusPause.textContent='Pause';focusTime.textContent='00:00';render()}
startFocus=qStart;finishFocus=qFinish;
focusPause.onclick=()=>{if(!qCurrent)return;if(qPaused){qEnd=Date.now()+qRemain;qPaused=false;focusPause.textContent='Pause';clearInterval(qTimer);qTimer=setInterval(qPaint,250)}else{qRemain=Math.max(0,qEnd-Date.now());qPaused=true;focusPause.textContent='Resume';clearInterval(qTimer);qTimer=null;qPaint()}};
focusDone.onclick=()=>qFinish(true);focusCancel.onclick=()=>qFinish(false);
const baseRender=render;
render=function(){
 baseRender();
 const moreRoot=document.getElementById('more');
 if(moreRoot&&!document.getElementById('holidayModeCard')){
  const card=document.createElement('div');card.id='holidayModeCard';card.className='card';card.style.marginTop='10px';
  card.innerHTML=`<span class="pill">HOLIDAY MODE</span><h2 style="margin-top:9px">Choose your schedule</h2><p class="muted" style="margin-top:6px">Normal keeps school and work. Away is flexible for travelling. Home keeps your Tuesday and Wednesday work shifts, rotates a maximum of two focus blocks per day, and protects free time.</p><select id="holidayMode" class="input" style="margin-top:12px"><option value="normal" ${S.holiday.mode==='normal'?'selected':''}>Normal schedule</option><option value="away" ${S.holiday.mode==='away'?'selected':''}>Holiday Away</option><option value="home" ${S.holiday.mode==='home'?'selected':''}>Holiday at Home</option></select><label class="muted" style="display:block;margin-top:12px">Home Holiday intensity<select id="holidayIntensity" class="input" style="margin-top:6px"><option value="relaxed" ${S.holiday.intensity==='relaxed'?'selected':''}>Relaxed — 45 min focus, 3 h free</option><option value="balanced" ${S.holiday.intensity==='balanced'?'selected':''}>Balanced — 60 min focus, 2 h free</option><option value="productive" ${S.holiday.intensity==='productive'?'selected':''}>Productive — 90 min focus, 1.5 h free</option></select></label><h3 style="margin-top:14px">Holiday Away times</h3><div class="row" style="margin-top:8px"><label class="muted">Wake<input id="awayWake" class="input" type="time" value="${S.holiday.awayWake}" style="margin-top:6px"></label><label class="muted">Sleep<input id="awaySleep" class="input" type="time" value="${S.holiday.awaySleep}" style="margin-top:6px"></label></div><h3 style="margin-top:14px">Holiday at Home times</h3><div class="row" style="margin-top:8px"><label class="muted">Wake<input id="homeWake" class="input" type="time" value="${S.holiday.homeWake}" style="margin-top:6px"></label><label class="muted">Sleep<input id="homeSleep" class="input" type="time" value="${S.holiday.homeSleep}" style="margin-top:6px"></label></div><button id="saveHoliday" class="btn" style="width:100%;margin-top:10px">Save Holiday Mode</button>`;
  moreRoot.insertBefore(card,moreRoot.children[1]||null);
  card.querySelector('#saveHoliday').onclick=()=>{S.holiday={mode:card.querySelector('#holidayMode').value,intensity:card.querySelector('#holidayIntensity').value,awayWake:card.querySelector('#awayWake').value||'08:00',awaySleep:card.querySelector('#awaySleep').value||'23:00',homeWake:card.querySelector('#homeWake').value||'07:30',homeSleep:card.querySelector('#homeSleep').value||'22:30'};save();render()};
 }
 const mainBtn=document.getElementById('startFocus');if(mainBtn){const A=tasks(),d=di(),main=sort(A.filter(x=>x.d===d&&!x.fixed&&!S.done[x.id])).sort((a,b)=>(b.p||1)-(a.p||1)||mn(a.start)-mn(b.start))[0];mainBtn.onclick=()=>qStart(main)}
 const hero=document.querySelector('#home .hero p');if(hero&&S.holiday.mode!=='normal')hero.textContent=S.holiday.mode==='away'?'Holiday Away is active — keep the essentials, explore, and recover.':`Holiday at Home is active — ${S.holiday.intensity} pace, work preserved, maximum two focus blocks.`;
};
render();
})();