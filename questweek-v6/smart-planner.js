(()=>{'use strict';
if(typeof S==='undefined'||typeof render!=='function'||typeof tasks!=='function')return;
const focusCats=['Programming','Study','Income'];
const esc=s=>String(s??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
const clock=n=>`${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;
const round15=n=>Math.ceil(n/15)*15;
function suggestion(){
 const d=di(),A=sort(tasks().filter(x=>x.d===d&&!S.done[x.id]));
 const mode=S.holiday?.mode||'normal';
 const focusToday=A.filter(x=>focusCats.includes(x.c));
 const now=new Date(),start=round15(now.getHours()*60+now.getMinutes());
 const sleep=mode==='home'?mn(S.holiday?.homeSleep||'22:30'):mode==='away'?mn(S.holiday?.awaySleep||'23:00'):21*60+30;
 const limit=sleep>start?sleep:24*60;
 const occupied=A.filter(x=>x.start&&x.end&&!(/free time/i.test(x.t||''))).map(x=>[mn(x.start),mn(x.end)]).filter(x=>x[0]<9999&&x[1]>x[0]).sort((a,b)=>a[0]-b[0]);
 let cursor=Math.max(start,6*60),best=null;
 for(const [a,b] of occupied){if(a-cursor>=45&&(!best||a-cursor>best.len))best={start:cursor,end:a,len:a-cursor};cursor=Math.max(cursor,b)}
 if(limit-cursor>=45&&(!best||limit-cursor>best.len))best={start:cursor,end:limit,len:limit-cursor};
 if(mode==='home'&&focusToday.length>=2){return{kind:'rest',title:'Keep the rest of today free',text:`You already have ${focusToday.length} focus blocks planned. QuestWeek is protecting your holiday instead of adding more.`}}
 if(!best)return{kind:'rest',title:'Your day is already full',text:'There is no realistic 45-minute gap before sleep. Keep the plan as it is.'};
 const weekly=focusCats.map(c=>({c,count:tasks().filter(x=>x.c===c&&S.done[x.id]).length})).sort((a,b)=>a.count-b.count);
 const cat=weekly[0].c,name=cat==='Income'?'Side Hustle':cat;
 const duration=Math.min(mode==='home'&&S.holiday?.intensity==='productive'?90:60,best.len);
 return{kind:'task',cat,name,start:best.start,end:best.start+duration,title:`You have time for ${duration} minutes of ${name}`,text:`A free gap is available from ${clock(best.start)} to ${clock(best.end)}. This suggestion uses only part of it, so you still keep free time.`};
}
const baseRender=render;
render=function(){
 baseRender();
 const root=document.getElementById('home');if(!root)return;
 const s=suggestion(),card=document.createElement('div');card.id='smartPlannerCard';card.className='card';card.style.marginTop='10px';
 card.innerHTML=`<span class="pill">SMART PLANNER</span><h2 style="margin-top:9px">${esc(s.title)}</h2><p class="muted" style="margin-top:6px">${esc(s.text)}</p>${s.kind==='task'?`<button id="acceptSmartSuggestion" class="btn" style="margin-top:12px">Add ${esc(s.name)} to today</button>`:''}`;
 const brief=root.querySelector('.card');if(brief)brief.insertAdjacentElement('afterend',card);else root.prepend(card);
 const btn=card.querySelector('#acceptSmartSuggestion');if(btn)btn.onclick=()=>{S.custom.push({id:'smart-'+uid(),d:di(),t:s.name,start:clock(s.start),end:clock(s.end),c:s.cat,loc:'Home',p:3});save();render()};
};
render();
})();