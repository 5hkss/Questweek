(()=>{'use strict';
if(typeof S==='undefined'||typeof render!=='function'||typeof tasks!=='function')return;
S.vacation=Object.assign({enabled:false,wake:'08:00',sleep:'23:00'},S.vacation||{});save();
const normalTasks=tasks;
function vacationTasks(){
 const out=[];
 const add=(id,d,t,start,end,c,loc='Other',fixed=0,p=1)=>out.push({id:`vac-${id}-${d}`,d,t,start,end,c,loc,fixed,p,vacation:1});
 for(let d=0;d<7;d++){
  const wake=S.vacation.wake||'08:00',sleep=S.vacation.sleep||'23:00';
  const [wh,wm]=wake.split(':').map(Number), mins=wh*60+wm;
  const hh=n=>`${String(Math.floor(n/60)%24).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;
  add('wake',d,'Wake up',wake,hh(mins+5),'Sleep','Home',1);
  add('med',d,'Meditation',hh(mins+5),hh(mins+10),'Meditation','Home');
  add('breakfast',d,'Breakfast',hh(mins+10),hh(mins+35),'Meal','Home',1);
  add('move',d,'Movement / vacation workout','10:00','10:45','Gym','Other',0,3);
  add('explore',d,'Explore / main vacation activity','11:00','14:00','Personal','Other',0,4);
  add('lunch',d,'Lunch','14:00','14:30','Meal','Other',1);
  add('free',d,'Free time / social time','15:00','19:00','Personal','Other',0,2);
  add('dinner',d,'Dinner','19:30','20:00','Meal','Other',1);
  add('stretch',d,'Stretching','21:30','21:40','Stretching','Home');
  add('sleep',d,'Sleep',sleep,hh((Number(sleep.slice(0,2))*60+Number(sleep.slice(3))+5)%1440),'Sleep','Home',1);
 }
 return out.concat((S.custom||[]).filter(x=>!x.hidden));
}
tasks=function(){return S.vacation.enabled?vacationTasks():normalTasks()};

let qTimer=null,qEnd=0,qRemain=0,qPaused=false,qCurrent=null;
function qPaint(){const sec=Math.max(0,Math.ceil((qPaused?qRemain:qEnd-Date.now())/1000));focusTime.textContent=`${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;if(sec<=0)qFinish(true)}
function qStart(x){if(!x)return;qCurrent=x;const duration=Math.max(60,(mn(x.end)-mn(x.start))*60);qRemain=duration*1000;qEnd=Date.now()+qRemain;qPaused=false;focusPause.textContent='Pause';focusTitle.textContent=x.t;focus.classList.add('show');clearInterval(qTimer);qPaint();qTimer=setInterval(qPaint,250)}
function qFinish(ok){clearInterval(qTimer);qTimer=null;if(ok&&qCurrent){S.done[qCurrent.id]=true;save()}focus.classList.remove('show');qCurrent=null;qPaused=false;focusPause.textContent='Pause';render()}
startFocus=qStart;finishFocus=qFinish;
focusPause.onclick=()=>{if(!qCurrent)return;if(qPaused){qEnd=Date.now()+qRemain;qPaused=false;focusPause.textContent='Pause';qTimer=setInterval(qPaint,250)}else{qRemain=Math.max(0,qEnd-Date.now());qPaused=true;focusPause.textContent='Resume';clearInterval(qTimer);qTimer=null;qPaint()}};
focusDone.onclick=()=>qFinish(true);focusCancel.onclick=()=>qFinish(false);

const baseRender=render;
render=function(){
 baseRender();
 const moreRoot=document.getElementById('more');
 if(moreRoot&&!document.getElementById('vacationModeCard')){
  const card=document.createElement('div');card.id='vacationModeCard';card.className='card';card.style.marginTop='10px';
  card.innerHTML=`<span class="pill">VACATION MODE</span><h2 style="margin-top:9px">${S.vacation.enabled?'Vacation schedule is active':'Use a lighter vacation schedule'}</h2><p class="muted" style="margin-top:6px">Temporarily hides school, work and the normal training week. Your original schedule is preserved.</p><label style="display:flex;align-items:center;gap:9px;margin-top:12px"><input id="vacEnabled" type="checkbox" ${S.vacation.enabled?'checked':''}> Enable Vacation Mode</label><div class="row" style="margin-top:10px"><label class="muted">Wake time<input id="vacWake" class="input" type="time" value="${S.vacation.wake||'08:00'}" style="margin-top:6px"></label><label class="muted">Sleep time<input id="vacSleep" class="input" type="time" value="${S.vacation.sleep||'23:00'}" style="margin-top:6px"></label></div><button id="saveVacation" class="btn" style="width:100%;margin-top:10px">Save Vacation Mode</button>`;
  moreRoot.insertBefore(card,moreRoot.children[1]||null);
  card.querySelector('#saveVacation').onclick=()=>{S.vacation={enabled:card.querySelector('#vacEnabled').checked,wake:card.querySelector('#vacWake').value||'08:00',sleep:card.querySelector('#vacSleep').value||'23:00'};save();render()};
 }
 const mainBtn=document.getElementById('startFocus');if(mainBtn){const A=tasks(),d=di(),main=sort(A.filter(x=>x.d===d&&!x.fixed&&!S.done[x.id])).sort((a,b)=>(b.p||1)-(a.p||1)||mn(a.start)-mn(b.start))[0];mainBtn.onclick=()=>qStart(main)}
 const hero=document.querySelector('#home .hero p');if(hero&&S.vacation.enabled)hero.textContent='Vacation Mode is active — keep the essentials, enjoy the trip, and recover.';
};
render();
})();