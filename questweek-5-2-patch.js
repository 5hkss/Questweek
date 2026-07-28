(()=>{'use strict';
const TT_KEY='questweek.timetable.v52';
let TT;try{TT=JSON.parse(localStorage.getItem(TT_KEY))||[]}catch{TT=[]}
const saveTT=()=>localStorage.setItem(TT_KEY,JSON.stringify(TT));
const baseTasks=tasks;
tasks=function(){
  let A=baseTasks();
  const daysWithClasses=new Set(TT.map(x=>Number(x.d)));
  A=A.filter(x=>!(daysWithClasses.has(Number(x.d))&&x.t==='School'));
  const classes=TT.map(x=>({id:x.id,d:Number(x.d),t:x.subject,start:x.start,end:x.end,c:'Study',loc:'School',fixed:true,timetable:true}));
  return A.concat(classes);
};
function conflictsWithoutLunch(A){
  const set=new Set();
  for(let d=0;d<7;d++){
    const q=sort(A.filter(x=>Number(x.d)===d&&x.t!=='Lunch'&&mn(x.start)!==9999&&mn(x.end)!==9999));
    for(let i=1;i<q.length;i++){
      if(mn(q[i].start)<mn(q[i-1].end)){set.add(q[i].id);set.add(q[i-1].id)}
    }
  }
  return set;
}
function timetableCard(){
  let card=document.getElementById('qwTimetableCard');
  if(!card){
    card=document.createElement('div');card.id='qwTimetableCard';card.className='card';card.style.marginTop='10px';
    card.innerHTML=`<span class="pill">WEEKLY TIMETABLE</span><h2 style="margin-top:9px">Add your class blocks</h2><p class="muted" style="margin-top:6px">When classes are added for a day, they replace that day's single School block. Lunch stays fixed at 11:45–12:15 and is ignored by conflict checks.</p><select class="input" id="ttDay" style="margin-top:10px"></select><input class="input" id="ttSubject" placeholder="Subject or class" style="margin-top:8px"><div class="row" style="margin-top:8px"><input class="input" id="ttStart" type="time"><input class="input" id="ttEnd" type="time"></div><button class="btn" id="ttAdd" style="width:100%;margin-top:9px">Add class</button><div id="ttList" style="margin-top:10px"></div>`;
    const first=more.querySelector('.card');first?first.after(card):more.appendChild(card);
  }
  ttDay.innerHTML=D.slice(0,5).map((x,i)=>`<option value="${i}">${x}</option>`).join('');
  ttList.innerHTML=TT.length?sort(TT).map(x=>`<div class="task" style="grid-template-columns:1fr auto"><div><div class="title">${D[x.d]} · ${x.subject}</div><div class="meta">${x.start}–${x.end}</div></div><button class="btn danger" data-ttdel="${x.id}">Remove</button></div>`).join(''):'<p class="muted">No class blocks added yet.</p>';
  ttAdd.onclick=()=>{const subject=ttSubject.value.trim(),start=ttStart.value,end=ttEnd.value,d=Number(ttDay.value);if(!subject||!start||!end||mn(end)<=mn(start)){alert('Enter a subject and valid start/end times.');return}TT.push({id:'tt-'+uid(),d,subject,start,end});saveTT();ttSubject.value='';render()};
  document.querySelectorAll('[data-ttdel]').forEach(b=>b.onclick=()=>{TT=TT.filter(x=>x.id!==b.dataset.ttdel);saveTT();render()});
}
const previousRender=render;
render=function(){
  previousRender();
  const A=tasks(),clean=conflictsWithoutLunch(A);
  document.querySelectorAll('[data-edit]').forEach(el=>{
    const x=A.find(t=>t.id===el.dataset.edit);
    if(x&&x.t==='Lunch'){
      el.classList.remove('conflict');
      el.querySelectorAll('.meta').forEach(m=>m.textContent=m.textContent.replace(/\s*·\s*CONFLICT/g,''));
    }
  });
  const overlapWarnings=[...document.querySelectorAll('#alerts .warning')].filter(x=>/overlap/i.test(x.textContent));
  overlapWarnings.forEach((el,i)=>{if(i>0)el.remove();else if(clean.size)el.textContent=`⚠️ ${clean.size} overlapping events (lunch ignored)`;else el.remove()});
  timetableCard();
};
render();
})();