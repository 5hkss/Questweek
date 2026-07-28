(()=>{'use strict';
if(typeof smart!=='function'||typeof tasks!=='function'||typeof S==='undefined')return;
smart=function(){
 const d=day(),all=sort(tasks().filter(x=>x.d===d)),remaining=all.filter(x=>!S.done[x.id]),focus=['Programming','Study','Income'];
 if(S.holiday.mode==='home'&&all.filter(x=>focus.includes(x.c)).length>=2)return{title:'Protect your holiday',text:'You already have two focus blocks today.'};
 const now=new Date(),current=Math.ceil((now.getHours()*60+now.getMinutes())/15)*15;
 const wake=S.holiday.mode==='home'?m(S.holiday.homeWake):S.holiday.mode==='away'?m(S.holiday.awayWake):330;
 const bedtime=S.holiday.mode==='home'?m(S.holiday.homeSleep):S.holiday.mode==='away'?m(S.holiday.awaySleep):1290;
 if(current<wake)return{title:'Your day has not started yet',text:`Smart Planner will look for opportunities after ${tm(wake)}.`};
 if(current>=bedtime)return{title:'Protect your sleep',text:`It is past your ${tm(bedtime)} sleep boundary. QuestWeek will not schedule more work tonight.`};
 const start=Math.max(current,wake),occupied=[];
 for(const x of all){
  if(!x.start||!x.end||/free/i.test(x.t||''))continue;
  let a=m(x.start),b=m(x.end);
  if(x.c==='Sleep'||/sleep|in bed/i.test(x.t||'')){if(a<bedtime)b=bedtime;else continue;}
  if(b<=a)continue;
  a=Math.max(a,start);b=Math.min(b,bedtime);
  if(b>a)occupied.push([a,b]);
 }
 occupied.sort((a,b)=>a[0]-b[0]);
 let cursor=start,best=null;
 for(const [a,b] of occupied){if(a-cursor>=45&&(!best||a-cursor>best.len))best={s:cursor,e:a,len:a-cursor};cursor=Math.max(cursor,b)}
 if(bedtime-cursor>=45&&(!best||bedtime-cursor>best.len))best={s:cursor,e:bedtime,len:bedtime-cursor};
 if(!best)return{title:'Your day is full enough',text:'There is no realistic 45-minute gap during your awake hours.'};
 const counts=focus.map(c=>({c,n:tasks().filter(x=>x.c===c&&S.done[x.id]).length})).sort((a,b)=>a.n-b.n),cat=counts[0].c,name=cat==='Income'?'Side Hustle':cat,dur=Math.min(60,best.len);
 return{title:`You have time for ${dur} minutes of ${name}`,text:`Free from ${tm(best.s)} to ${tm(best.e)}, before your sleep boundary.`,add:{name,cat,start:tm(best.s),end:tm(best.s+dur)}};
};
render();
})();