
const PLAN=window.PLAN_DATA, KEY="sheipados_v5";
const tabs=[["train","Treino","✅"],["diet","Dieta","🍽️"],["calendar","Calendário","📅"],["progress","Evolução","📈"],["more","Mais","⚙️"]];
let timers=[];
function today(){const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,10)}
function dayName(){const m=["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"],d=m[new Date().getDay()];return d==="Sábado"||d==="Domingo"?"Sábado/Domingo":d}
function uid(){return crypto.randomUUID?crypto.randomUUID():String(Date.now())}
function blankUser(){return{week:1,dayOverrideDate:null,dayOverride:null,dailyLogs:[],bodyLogs:[],workoutLogs:[],dietLogs:[],settings:{reminders:false}}}
function blank(){return{profile:"rogerio",users:{rogerio:blankUser(),fernanda:blankUser()}}}
let state=(()=>{try{let p=JSON.parse(localStorage.getItem(KEY));return p?{...blank(),...p,users:{rogerio:{...blankUser(),...(p.users?.rogerio||{})},fernanda:{...blankUser(),...(p.users?.fernanda||{})}}}:blank()}catch(e){return blank()}})();
function u(){return state.users[state.profile]} function prof(){return PLAN.profiles[state.profile]} function workouts(){return prof().workouts}
function activeDay(){return u().dayOverrideDate===today()&&u().dayOverride?u().dayOverride:dayName()}
function workout(){return workouts()[activeDay()]||workouts().Segunda}
function week(){return PLAN.weeks.find(x=>x.week===u().week)||PLAN.weeks[0]}
function save(){localStorage.setItem(KEY,JSON.stringify(state));render();scheduleReminders()}
function $(id){return document.getElementById(id)} function num(v){let n=Number(v);return Number.isFinite(n)?n:0}
function latestWeight(){let l=[...u().bodyLogs].filter(x=>x.weight).sort((a,b)=>a.date.localeCompare(b.date));return l.length?num(l.at(-1).weight):(prof().initialWeight?num(prof().initialWeight):0)}
function lastBody(){let l=[...u().bodyLogs].filter(x=>x.weight||x.waist).sort((a,b)=>a.date.localeCompare(b.date));return l.length?l.at(-1).date:null}
function daysSince(ds){if(!ds)return 999;return Math.floor((new Date(today()+"T00:00")-new Date(ds+"T00:00"))/86400000)}
function pct(){let p=prof();if(!p.initialWeight||!p.targetWeight)return 0;return Math.max(0,Math.min(100,Math.round((latestWeight()-num(p.initialWeight))/(num(p.targetWeight)-num(p.initialWeight))*100)))}
function openTab(id){document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));document.querySelectorAll(".nav button").forEach(b=>b.classList.remove("active"));$(id).classList.add("active");document.querySelector(`[data-tab="${id}"]`).classList.add("active");let c=document.querySelector(".content"); if(c) c.scrollTop=0; history.replaceState(null,"","#"+id)}
function switchProfile(v){state.profile=v;save()}
function shell(){let p=prof();document.getElementById("app").innerHTML=`<div class="shell"><header class="topbar"><div class="title-row"><div class="brand"><div class="logo">SH</div><div><h1>${PLAN.project.name}</h1><div class="sub">${p.name} • ${p.goal||"Plano"}</div></div></div><select class="profile-select" onchange="switchProfile(this.value)">${Object.entries(PLAN.profiles).map(([k,v])=>`<option value="${k}" ${state.profile===k?"selected":""}>${v.name}</option>`).join("")}</select></div></header><main class="content">${tabs.map(t=>`<section class="section" id="${t[0]}"></section>`).join("")}</main><nav class="nav">${tabs.map(t=>`<button data-tab="${t[0]}" onclick="openTab('${t[0]}')"><span class="ico">${t[2]}</span><span>${t[1]}</span></button>`).join("")}</nav></div>`}
function input(id,label,type="text",ph="",val=""){return`<div><label>${label}</label><input id="${id}" type="${type}" placeholder="${ph}" value="${val}"></div>`}
function select(id,label,ops,val=""){return`<div><label>${label}</label><select id="${id}">${ops.map(o=>`<option ${o===val?"selected":""}>${o}</option>`).join("")}</select></div>`}
function head(t,s){return`<div class="page-head"><h2>${t}</h2><p>${s||""}</p></div>`}
function renderTrain(){let w=workout(), wk=week(), p=prof();$("train").innerHTML=`${head("Hoje • Treino",`Detectado automaticamente: ${activeDay()}.`)}<div class="grid three"><div class="card kpi"><div class="label">Treino</div><div class="value" style="font-size:20px">${w.title}</div><div class="hint">${activeDay()}</div></div><div class="card kpi"><div class="label">Semana</div><div class="value">S${u().week}</div><div class="hint">${wk.phase}</div></div><div class="card kpi"><div class="label">Peso</div><div class="value">${latestWeight()?latestWeight().toFixed(1):"—"} kg</div><div class="hint">meta ${p.targetWeight||"—"} kg</div></div></div><div class="card"><p class="notice"><b>Regra:</b> ${wk.rule}</p><details><summary>Trocar treino só hoje</summary><div class="form-grid"><div><label>Semana</label><select onchange="u().week=Number(this.value);save()">${PLAN.weeks.map(x=>`<option value="${x.week}" ${x.week===u().week?"selected":""}>Semana ${x.week}</option>`).join("")}</select></div><div><label>Dia</label><select onchange="u().dayOverrideDate='${today()}';u().dayOverride=this.value;save()">${Object.keys(workouts()).map(d=>`<option ${d===activeDay()?"selected":""}>${d}</option>`).join("")}</select></div></div></details><h3>Exercícios executados</h3><div class="list">${w.exercises.map((e,i)=>`<label class="check"><input type="checkbox" id="ex-${i}"><div><strong>${e.name}</strong><span>${e.sets}x${e.reps} • RPE ${e.rpe} ${e.link&&e.link!=="#"?`• <a href="${e.link}" target="_blank">vídeo</a>`:""}</span></div></label>`).join("")}</div><div style="margin-top:12px"><label>Nota do treino</label><textarea id="tr-note" placeholder="Ex.: completo, energia baixa, adaptação..."></textarea></div><div class="actions"><button class="primary" onclick="saveTrain()">Salvar treino</button></div></div>`}
function saveTrain(){let w=workout(), ex=w.exercises.map((e,i)=>({name:e.name,done:$(`ex-${i}`).checked}));u().workoutLogs.push({id:uid(),date:today(),week:u().week,day:activeDay(),title:w.title,exercises:ex,note:$("tr-note").value});upsertDaily({exercises:ex,day:activeDay(),week:u().week,workoutTitle:w.title});save()}
function upsertDaily(part){let d=today(), log=u().dailyLogs.find(x=>x.date===d);if(!log){log={id:uid(),date:d,day:activeDay(),week:u().week,exercises:[],meals:[],water:[],schedule:[]};u().dailyLogs.push(log)}Object.assign(log,part)}
function renderDiet(){let p=prof(), last=lastBody(), due=daysSince(last)>=15;$("diet").innerHTML=`${head("Hoje • Dieta","Refeições, quantidades, água e rotina.")}<div class="grid three"><div class="card kpi"><div class="label">Proteína</div><div class="value">${p.proteinTarget||"—"}g</div><div class="hint">meta</div></div><div class="card kpi"><div class="label">Calorias</div><div class="value">${p.caloriesTrainingDay||"—"}</div><div class="hint">dia treino</div></div><div class="card kpi"><div class="label">Água</div><div class="value">${p.waterTarget||"—"}L</div><div class="hint">meta</div></div></div><div class="card"><h2>Refeições</h2><div class="list">${PLAN.meals.map((m,i)=>`<label class="check"><input type="checkbox" id="meal-${i}"><div><strong>${m.time} • ${m.name}</strong><span><b>Quantidade:</b> ${m.qty}</span><span>${m.protein}g proteína • ${m.kcal} kcal</span></div></label>`).join("")}</div></div><div class="card"><h2>Água</h2><div class="list">${["Manhã — 1,0 L","Tarde — 1,0 L","Treino/noite — 1,0 L","Completar — 0,5 L"].map((x,i)=>`<label class="check"><input type="checkbox" id="water-${i}"><div><strong>${x}</strong><span>Meta: ${p.waterTarget||"—"} L/dia</span></div></label>`).join("")}</div></div><div class="card"><h2>Rotina e suplementos</h2><div class="list">${PLAN.schedule.map((s,i)=>`<label class="check"><input type="checkbox" id="sched-${i}"><div><strong>${s.time} • ${s.item}</strong><span>${s.note}</span></div></label>`).join("")}</div><div class="actions"><button class="ghost" onclick="enableReminders()">Ativar lembretes</button></div></div><div class="card"><h2>Medição quinzenal</h2><p class="${due?"notice":"ok"}">${due?"Medição liberada/pendente.":"Última medição em "+last+". Próxima em aprox. "+(15-daysSince(last))+" dia(s)."}</p><details ${due?"open":""}><summary>Registrar peso/cintura</summary><div class="form-grid">${input("weight","Peso kg","number","76.4")}${input("waist","Cintura cm","number","82")}${input("arm","Braço cm","number","opcional")}${input("thigh","Coxa cm","number","opcional")}</div></details><div class="form-grid" style="margin-top:12px">${input("date","Data","date","",today())}${input("sleep","Sono h","number","7.5")}${select("appetite","Apetite",["Bom","Normal","Baixo","Muito baixo"],"Normal")}${select("gi","Digestão/GI",["Normal","Constipado","Náusea","Refluxo","Diarreia"],"Normal")}</div><div style="margin-top:12px"><label>Nota rápida</label><textarea id="diet-note"></textarea></div><div class="actions"><button class="primary" onclick="saveDiet()">Salvar dieta</button></div></div><div class="card"><h2>Alternativas</h2><div class="list">${PLAN.meals.map(m=>`<details class="item"><summary><strong>${m.time} • ${m.name}</strong> <span class="pill">${m.protein}g prot.</span></summary><div class="muted"><b>Base:</b> ${m.qty}</div><ul class="alts">${m.alts.map(a=>`<li>${a}</li>`).join("")}</ul></details>`).join("")}</div></div>`}
function saveDiet(){let date=$("date").value||today(), meals=PLAN.meals.map((m,i)=>({id:m.id,name:m.name,qty:m.qty,done:$(`meal-${i}`).checked})), water=[0,1,2,3].map(i=>({done:$(`water-${i}`).checked})), schedule=PLAN.schedule.map((s,i)=>({item:s.item,time:s.time,done:$(`sched-${i}`).checked}));u().dietLogs.push({id:uid(),date,meals,water,schedule,note:$("diet-note").value});upsertDaily({date,meals,water,schedule,appetite:$("appetite").value,gi:$("gi").value});if($("weight").value||$("waist").value||$("arm").value||$("thigh").value)u().bodyLogs.push({id:uid(),date,weight:$("weight").value,waist:$("waist").value,arm:$("arm").value,thigh:$("thigh").value,sleep:$("sleep").value,appetite:$("appetite").value,digestion:$("gi").value,note:$("diet-note").value});save()}
function renderCalendar(){let wk=week();$("calendar").innerHTML=`${head("Calendário de treinos","12 semanas com vídeos de execução.")}<div class="week-strip">${PLAN.weeks.map(x=>`<button class="${x.week===u().week?"active":""}" onclick="u().week=${x.week};save()">S${x.week}<br><span style="font-size:10px">${x.phase.split(" ")[0]}</span></button>`).join("")}</div><div class="card"><span class="pill">Semana ${wk.week} • ${wk.phase}</span><p class="notice">${wk.rule}</p></div><div class="calendar-grid" style="margin-top:12px">${Object.entries(workouts()).map(([day,w])=>`<div class="card item"><div style="display:flex;justify-content:space-between;gap:8px"><div><strong>${day}</strong><div class="muted">${w.title}</div></div><button class="ghost" onclick="u().dayOverrideDate='${today()}';u().dayOverride='${day}';save();openTab('train')">Usar hoje</button></div><ul>${w.exercises.map(e=>`<li>${e.name} — ${e.sets}x${e.reps} ${e.link&&e.link!=="#"?`<a class="video" href="${e.link}" target="_blank">vídeo</a>`:""}</li>`).join("")}</ul></div>`).join("")}</div>`}

function monthName(m){return ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"][m]}
function isoFor(y,m,d){return `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`}
function logsForDate(date){
  const uu=user();
  const train = (uu.workoutLogs||[]).some(l=>l.date===date && ((l.exercises||[]).some(e=>e.done) || l.done || l.title));
  const diet = (uu.dietLogs||[]).some(l=>l.date===date && (((l.meals||[]).some(m=>m.done)) || ((l.water||[]).some(w=>w.done)) || l.type || l.note));
  const daily = (uu.dailyLogs||[]).find(l=>l.date===date);
  const trainDaily = daily && (daily.exercises||[]).some(e=>e.done);
  const dietDaily = daily && ((daily.meals||[]).some(m=>m.done) || (daily.water||[]).some(w=>w.done));
  return {train: !!(train || trainDaily), diet: !!(diet || dietDaily), daily};
}
function monthStats(y,m){
  const days = new Date(y,m+1,0).getDate();
  const active = new Set();
  let trainCount=0, dietCount=0;
  for(let d=1; d<=days; d++){
    const lf=logsForDate(isoFor(y,m,d));
    if(lf.train || lf.diet) active.add(d);
    if(lf.train) trainCount++;
    if(lf.diet) dietCount++;
  }
  return {active:active.size, trainCount, dietCount};
}
function changeProgressMonth(delta){
  const base = state.progressMonth ? new Date(state.progressMonth+"-01T00:00:00") : new Date();
  base.setMonth(base.getMonth()+delta);
  state.progressMonth = `${base.getFullYear()}-${String(base.getMonth()+1).padStart(2,"0")}`;
  save();
  openTab("progress");
}
function setProgressMonthToNow(){
  const now = new Date();
  state.progressMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  save();
  openTab("progress");
}
function progressCalendar(){
  const base = state.progressMonth ? new Date(state.progressMonth+"-01T00:00:00") : new Date();
  const y = base.getFullYear(), m = base.getMonth();
  const todayStr = today();
  const first = new Date(y,m,1);
  const days = new Date(y,m+1,0).getDate();
  const start = first.getDay();
  const cells = [];
  for(let i=0;i<start;i++) cells.push(`<div class="cal-cell empty"></div>`);
  for(let d=1; d<=days; d++){
    const date = isoFor(y,m,d);
    const lf = logsForDate(date);
    const cls = date===todayStr ? " today" : "";
    cells.push(`<div class="cal-cell${cls}">
      <div class="cal-day">${d}</div>
      <div class="cal-icons">
        ${lf.train ? `<span class="cal-icon train" title="Treino completo">🏋️</span>` : ""}
        ${lf.diet ? `<span class="cal-icon diet" title="Dieta registrada">🍽️</span>` : ""}
      </div>
    </div>`);
  }
  const stats = monthStats(y,m);
  return `<div class="calendar-card">
    <div class="calendar-top">
      <button class="ghost" onclick="changeProgressMonth(-1)">‹</button>
      <div>
        <h2>${monthName(m)} ${y}</h2>
        <p class="muted">${stats.active} dias ativos • ${stats.trainCount} treino(s) • ${stats.dietCount} dieta(s)</p>
      </div>
      <button class="ghost" onclick="changeProgressMonth(1)">›</button>
    </div>
    <div class="calendar-legend">
      <span><b class="legend-dot train"></b> Treino completo</span>
      <span><b class="legend-dot diet"></b> Dieta registrada</span>
    </div>
    <div class="week-labels"><span>dom.</span><span>seg.</span><span>ter.</span><span>qua.</span><span>qui.</span><span>sex.</span><span>sáb.</span></div>
    <div class="month-grid">${cells.join("")}</div>
    <div class="actions"><button class="ghost" onclick="setProgressMonthToNow()">Voltar para mês atual</button></div>
  </div>`;
}

function renderProgress(){
  const p=profile();
  $("progress").innerHTML=`
    ${pageHead("Evolução","Calendário mensal de constância: treino, dieta ou ambos.")}
    <div class="grid three">
      <div class="card kpi"><div class="label">Peso atual</div><div class="value">${latestWeight() ? latestWeight().toFixed(1) : "—"} kg</div><div class="hint">meta ${p.targetWeight || "—"} kg</div></div>
      <div class="card kpi"><div class="label">Progresso</div><div class="value">${progressPct()}%</div><div class="progress"><span style="width:${progressPct()}%"></span></div></div>
      <div class="card kpi"><div class="label">Última medição</div><div class="value" style="font-size:18px">${lastBodyDate()||"—"}</div><div class="hint">intervalo alvo: 15 dias</div></div>
    </div>
    <div class="card">
      <h2>Calendário de progresso</h2>
      ${progressCalendar()}
    </div>
    <div class="card"><h2>Histórico de check-ins</h2><div class="compact-list">${dailyHistory()}</div></div>`;
  setTimeout(drawWeight,50);
}

function renderMore(){$("more").innerHTML=`${head("Mais","Perfis, lembretes, exames e backup.")}<div class="card"><h2>Perfis</h2><div class="form-grid"><div><label>Perfil ativo</label><select onchange="switchProfile(this.value)">${Object.entries(PLAN.profiles).map(([k,p])=>`<option value="${k}" ${state.profile===k?"selected":""}>${p.name}</option>`).join("")}</select></div><div><label>Treino detectado</label><input readonly value="${activeDay()}"></div></div></div><div class="card"><h2>Lembretes</h2><p class="notice">Lembretes simples dependem do navegador/PWA. Para alerta confiável com app fechado, precisa Web Push com servidor.</p><div class="actions"><button class="primary" onclick="enableReminders()">Ativar</button><button class="ghost" onclick="testNotification()">Testar</button><button class="danger" onclick="disableReminders()">Desativar</button></div></div><div class="card"><h2>Rotina</h2><div class="list">${PLAN.schedule.map(s=>`<div class="item"><strong>${s.time} • ${s.item}</strong><span>${s.note}</span></div>`).join("")}</div></div><div class="card"><h2>Exames</h2><div class="list">${PLAN.exams.map(e=>`<div class="item"><strong>${e.group}</strong><span>${e.name} • ${e.frequency}</span></div>`).join("")}</div></div><div class="card"><h2>Backup</h2><div class="actions"><button class="primary" onclick="exportBackup()">Exportar JSON</button><button class="danger" onclick="resetAll()">Apagar tudo</button></div></div>`}
function exportBackup(){let b=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=`sheipados_backup_${today()}.json`;a.click()}
function resetAll(){if(confirm("Apagar dados locais?")){localStorage.removeItem(KEY);state={profile:"rogerio",users:{rogerio:{...u(),dailyLogs:[],bodyLogs:[],workoutLogs:[],dietLogs:[]},fernanda:{...u(),dailyLogs:[],bodyLogs:[],workoutLogs:[],dietLogs:[]}}};location.reload()}}
async function showNotify(t,b){if(!("Notification"in window))return alert("Sem suporte a notificações.");if(Notification.permission!=="granted")return;try{let reg=await navigator.serviceWorker.ready;reg.showNotification(t,{body:b,icon:"./icons/icon-192.svg"})}catch(e){new Notification(t,{body:b})}}
async function enableReminders(){if(!("Notification"in window))return alert("Sem suporte a notificações.");let p=await Notification.requestPermission();if(p!=="granted")return alert("Permissão negada.");u().settings.reminders=true;localStorage.setItem(KEY,JSON.stringify(state));scheduleReminders();alert("Lembretes ativados.")}
function disableReminders(){u().settings.reminders=false;localStorage.setItem(KEY,JSON.stringify(state));timers.forEach(clearTimeout);timers=[];render()}
function testNotification(){showNotify("Sheipados","Teste de alerta funcionando.")}
function scheduleReminders(){timers.forEach(clearTimeout);timers=[];if(!u().settings.reminders||!("Notification"in window)||Notification.permission!=="granted")return;let now=new Date();PLAN.schedule.forEach(s=>{if(s.weekly&&now.getDay()!==0)return;let [h,m]=s.hhmm.split(":").map(Number),target=new Date();target.setHours(h,m,0,0);let delay=target-now;if(delay>0&&delay<86400000)timers.push(setTimeout(()=>showNotify("Sheipados",`${s.time} • ${s.item}. ${s.note}`),delay))})}
function render(){shell();renderTrain();renderDiet();renderCalendar();renderProgress();renderMore();let h=location.hash.replace("#","")||"train";openTab(tabs.some(t=>t[0]===h)?h:"train")}
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));render();scheduleReminders();
