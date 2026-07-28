(()=>{'use strict';
if(!window.S||!Array.isArray(S.countdowns))return;
if(!S.countdownMigrationV61){S.countdowns=S.countdowns.filter(c=>c.id!=='iron'&&String(c.name||'').toLowerCase()!=='ironman');S.countdownMigrationV61=true;save();}
const esc=s=>String(s??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
const originalRender=render;
render=function(){
  originalRender();
  const root=document.getElementById('goals');
  if(!root)return;
  const heads=[...root.querySelectorAll('.head')];
  if(!heads.length)return;
  const first=heads[0],second=heads[1];
  let node=first.nextElementSibling;
  while(node&&node!==second){const next=node.nextElementSibling;node.remove();node=next;}
  const wrap=document.createElement('div');
  wrap.id='countdownEditor';
  wrap.innerHTML=`${S.countdowns.map(c=>{const days=Math.max(0,Math.ceil((new Date(c.date)-Date.now())/86400000));return `<div class="card" style="margin-bottom:10px" data-countdown-card="${esc(c.id)}"><div class="countdown"><div><h3>${esc(c.emoji||'⏳')} ${esc(c.name)}</h3><p class="muted">${esc(c.date)}</p></div><strong>${Number.isFinite(days)?days:0}d</strong></div><div class="row" style="margin-top:10px"><input class="input" data-cd-emoji="${esc(c.id)}" value="${esc(c.emoji||'⏳')}" aria-label="Emoji"><input class="input" data-cd-name="${esc(c.id)}" value="${esc(c.name)}" aria-label="Countdown name"><input class="input" data-cd-date="${esc(c.id)}" type="date" value="${esc(c.date)}" aria-label="Countdown date"></div><div class="row" style="margin-top:8px"><button class="btn" data-cd-save="${esc(c.id)}">Save countdown</button><button class="btn danger" data-cd-delete="${esc(c.id)}">Remove</button></div></div>`}).join('')}<div class="card" style="margin-bottom:10px"><h3>Add countdown</h3><div class="row" style="margin-top:10px"><input id="newCountdownEmoji" class="input" value="⏳" aria-label="Emoji"><input id="newCountdownName" class="input" placeholder="Countdown name"><input id="newCountdownDate" class="input" type="date"></div><button id="addCountdown" class="btn" style="width:100%;margin-top:8px">Add countdown</button></div>`;
  first.insertAdjacentElement('afterend',wrap);
  wrap.querySelectorAll('[data-cd-save]').forEach(b=>b.onclick=()=>{const id=b.dataset.cdSave,c=S.countdowns.find(x=>x.id===id);if(!c)return;const name=wrap.querySelector(`[data-cd-name="${CSS.escape(id)}"]`).value.trim();const date=wrap.querySelector(`[data-cd-date="${CSS.escape(id)}"]`).value;const emoji=wrap.querySelector(`[data-cd-emoji="${CSS.escape(id)}"]`).value.trim()||'⏳';if(!name||!date){alert('Add both a name and a date.');return;}Object.assign(c,{name,date,emoji});save();render();});
  wrap.querySelectorAll('[data-cd-delete]').forEach(b=>b.onclick=()=>{S.countdowns=S.countdowns.filter(x=>x.id!==b.dataset.cdDelete);save();render();});
  const add=wrap.querySelector('#addCountdown');if(add)add.onclick=()=>{const name=wrap.querySelector('#newCountdownName').value.trim(),date=wrap.querySelector('#newCountdownDate').value,emoji=wrap.querySelector('#newCountdownEmoji').value.trim()||'⏳';if(!name||!date){alert('Add both a name and a date.');return;}S.countdowns.push({id:'cd'+uid(),name,date,emoji});save();render();};
};
render();
})();