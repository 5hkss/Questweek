(()=>{'use strict';
if(typeof S==='undefined'||typeof tasks!=='function'||typeof startFocus!=='function')return;
const getMain=()=>{const d=di();return sort(tasks().filter(x=>x.d===d&&!x.fixed&&!S.done[x.id])).sort((a,b)=>(b.p||1)-(a.p||1)||mn(a.start)-mn(b.start))[0]||null};
const launch=e=>{const target=e.target&&e.target.closest?e.target.closest('#startFocus'):null;if(!target)return;e.preventDefault();e.stopPropagation();const main=getMain();if(main)startFocus(main)};
document.addEventListener('click',launch,true);
document.addEventListener('touchend',e=>{const target=e.target&&e.target.closest?e.target.closest('#startFocus'):null;if(!target)return;e.preventDefault();e.stopPropagation();const main=getMain();if(main)startFocus(main)},{capture:true,passive:false});
const style=document.createElement('style');style.textContent='#startFocus{position:relative;z-index:5;pointer-events:auto;touch-action:manipulation;-webkit-tap-highlight-color:transparent}';document.head.appendChild(style);
const baseRender=render;render=function(){baseRender();const b=document.getElementById('startFocus');if(b){b.type='button';b.style.pointerEvents='auto';b.removeAttribute('disabled')}};render();
})();