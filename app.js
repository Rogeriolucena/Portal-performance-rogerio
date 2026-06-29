
const PLAN = window.PLAN_DATA;
const KEY = "sheipados_v13";
const OLD_KEYS = ["sheipados_v12","sheipados_v11","sheipados_v10","sheipados_v9","sheipados_v8","sheipados_v7","sheipados_v6","sheipados_v5","sheipados_v4"];
const tabs = [
  ["train","Treino","✅"],
  ["diet","Dieta","🍽️"],
  ["calendar","Calendário","📅"],
  ["progress","Evolução","📈"],
  ["more","Mais","⚙️"]
];

function applyDisplayModeClass(){
  const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  document.body.classList.toggle("standalone", standalone);
  document.body.classList.toggle("browser-mode", !standalone);
}
applyDisplayModeClass();
window.matchMedia("(display-mode: standalone)").addEventListener?.("change", applyDisplayModeClass);

let state = loadState();
let activeTab = location.hash.replace("#","") || "train";
let timers = [];

function today(){const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,10)}
function uid(){return crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random()}
function dayName(){const m=["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];const d=m[new Date().getDay()];return d==="Sábado"||d==="Domingo"?"Sábado/Domingo":d}
function blankUser(){return{week:1,dayOverrideDate:null,dayOverride:null,dailyLogs:[],bodyLogs:[],workoutLogs:[],dietLogs:[],settings:{reminders:false}}}
function blank(){return{version:"v9",profile:"rogerio",progressMonth:null,users:{rogerio:blankUser(),fernanda:blankUser()}}}
function loadState(){
  try{
    let raw=localStorage.getItem(KEY);
    if(!raw){for(const k of OLD_KEYS){raw=localStorage.getItem(k); if(raw) break;}}
    if(!raw) return blank();
    const p=JSON.parse(raw);
    return {...blank(),...p,version:"v9",users:{rogerio:{...blankUser(),...(p.users?.rogerio||{})},fernanda:{...blankUser(),...(p.users?.fernanda||{})}}};
  }catch(e){return blank()}
}
function saveState(){localStorage.setItem(KEY,JSON.stringify(state))}
function save(){saveState();render();scheduleReminders()}
function $(id){return document.getElementById(id)}
function num(v){const n=Number(v);return Number.isFinite(n)?n:0}
function user(){return state.users[state.profile]||state.users.rogerio}
function prof(){return PLAN.profiles[state.profile]||PLAN.profiles.rogerio}
function workouts(){return prof().workouts}
function activeDay(){const u=user();return u.dayOverrideDate===today()&&u.dayOverride?u.dayOverride:dayName()}
function workout(){return workouts()[activeDay()]||workouts().Segunda}
function week(){return PLAN.weeks.find(x=>x.week===user().week)||PLAN.weeks[0]}
function latestWeight(){const rows=[...user().bodyLogs].filter(x=>x.weight).sort((a,b)=>a.date.localeCompare(b.date));return rows.length?num(rows.at(-1).weight):(prof().initialWeight?num(prof().initialWeight):0)}
function lastBody(){const rows=[...user().bodyLogs].filter(x=>x.weight||x.waist).sort((a,b)=>a.date.localeCompare(b.date));return rows.length?rows.at(-1).date:null}
function daysSince(date){if(!date)return 999;return Math.floor((new Date(today()+"T00:00")-new Date(date+"T00:00"))/86400000)}
function pct(){const p=prof();if(!p.initialWeight||!p.targetWeight)return 0;return Math.max(0,Math.min(100,Math.round((latestWeight()-num(p.initialWeight))/(num(p.targetWeight)-num(p.initialWeight))*100)))}
function setTab(id){activeTab=tabs.some(t=>t[0]===id)?id:"train";history.replaceState(null,"","#"+activeTab);render()}
function switchProfile(v){state.profile=v;save()}
function input(id,label,type="text",ph="",val=""){return`<div><label>${label}</label><input id="${id}" type="${type}" placeholder="${ph}" value="${val}"></div>`}
function select(id,label,ops,val=""){return`<div><label>${label}</label><select id="${id}">${ops.map(o=>`<option ${o===val?"selected":""}>${o}</option>`).join("")}</select></div>`}
function head(t,s){return`<div class="page-head"><h2>${t}</h2><p>${s||""}</p></div>`}
function shell(content){
  const p=prof();
  return `<div class="shell">
    <header class="topbar">
      <div class="title-row">
        <div class="brand">
          <img class="logo" src="./icon-192.png?v=12" alt="Sheipados" onerror="this.outerHTML='<div class=&quot;logo-fallback&quot; aria-label=&quot;Sheipados&quot;></div>'">
          <div><h1>${PLAN.project.name}</h1><div class="sub">${p.name} • ${p.goal||"Plano"}</div></div>
        </div>
        <select class="profile-select" onchange="switchProfile(this.value)">
          ${Object.entries(PLAN.profiles).map(([k,v])=>`<option value="${k}" ${state.profile===k?"selected":""}>${v.name}</option>`).join("")}
        </select>
      </div>
    </header>
    <main class="content">${content}</main>
    <div class="nav-shell"><nav class="nav" aria-label="Navegação">${tabs.map(t=>`<button type="button" class="${activeTab===t[0]?"active":""}" data-tab="${t[0]}"><span class="ico">${t[2]}</span><span>${t[1]}</span></button>`).join("")}</nav></div>
  </div>`;
}

function renderTrain(){
  const w=workout(), wk=week(), p=prof();
  return `${head("Hoje • Treino",`Detectado automaticamente: ${activeDay()}.`)}
  <div class="grid three">
    <div class="card kpi"><div class="label">Treino</div><div class="value" style="font-size:20px">${w.title}</div><div class="hint">${activeDay()}</div></div>
    <div class="card kpi"><div class="label">Semana</div><div class="value">S${user().week}</div><div class="hint">${wk.phase}</div></div>
    <div class="card kpi"><div class="label">Peso</div><div class="value">${latestWeight()?latestWeight().toFixed(1):"—"} kg</div><div class="hint">meta ${p.targetWeight||"—"} kg</div></div>
  </div>
  <div class="card">
    <p class="notice"><b>Regra:</b> ${wk.rule}</p>
    <details><summary>Trocar treino só hoje</summary>
      <div class="form-grid">
        <div><label>Semana</label><select onchange="user().week=Number(this.value);save()">${PLAN.weeks.map(x=>`<option value="${x.week}" ${x.week===user().week?"selected":""}>Semana ${x.week}</option>`).join("")}</select></div>
        <div><label>Dia</label><select onchange="user().dayOverrideDate='${today()}';user().dayOverride=this.value;save()">${Object.keys(workouts()).map(d=>`<option ${d===activeDay()?"selected":""}>${d}</option>`).join("")}</select></div>
      </div>
    </details>
    <h3>Exercícios executados</h3>
    <div class="actions"><button class="ghost" onclick="markAllExercises()">Marcar todos</button></div>
    <div class="list">${w.exercises.map((e,i)=>`<label class="check"><input type="checkbox" class="exercise-check" id="ex-${i}"><div><strong>${e.name}</strong><span>${e.sets}x${e.reps} • RPE ${e.rpe} ${e.link&&e.link!=="#"?`• <a href="${e.link}" target="_blank">vídeo</a>`:""}</span></div></label>`).join("")}</div>
    <div style="margin-top:12px"><label>Nota do treino</label><textarea id="tr-note" placeholder="Ex.: completo, energia baixa, adaptação..."></textarea></div>
    <div class="actions"><button class="primary" onclick="saveTrain()">Salvar treino</button></div>
    <p class="muted" style="font-size:12px">O ícone de halter no progresso aparece quando todos os exercícios do dia forem marcados.</p>
  </div>`;
}
function markAllExercises(){document.querySelectorAll(".exercise-check").forEach(x=>x.checked=true)}
function saveTrain(){
  const w=workout();
  const exercises=w.exercises.map((e,i)=>({name:e.name,done:!!$(`ex-${i}`)?.checked}));
  const complete=exercises.length>0 && exercises.every(e=>e.done);
  user().workoutLogs.push({id:uid(),date:today(),week:user().week,day:activeDay(),title:w.title,complete,exercises,note:$("tr-note").value});
  upsertDaily(today(),{day:activeDay(),week:user().week,workoutTitle:w.title,train:{complete,count:exercises.filter(e=>e.done).length,total:exercises.length},exercises});
  save();
}
function renderDiet(){
  const p=prof(), last=lastBody(), due=daysSince(last)>=15;
  return `${head("Hoje • Dieta","Refeições, quantidades, água e rotina.")}
  <div class="grid three">
    <div class="card kpi"><div class="label">Proteína</div><div class="value">${p.proteinTarget||"—"}g</div><div class="hint">meta</div></div>
    <div class="card kpi"><div class="label">Calorias</div><div class="value">${p.caloriesTrainingDay||"—"}</div><div class="hint">dia treino</div></div>
    <div class="card kpi"><div class="label">Água</div><div class="value">${p.waterTarget||"—"}L</div><div class="hint">meta</div></div>
  </div>
  <div class="card">
    <h2>Refeições</h2>
    <div class="actions"><button class="ghost" onclick="markAllMeals()">Marcar todas</button></div>
    <div class="list">${PLAN.meals.map((m,i)=>`<label class="check"><input type="checkbox" class="meal-check" id="meal-${i}"><div><strong>${m.time} • ${m.name}</strong><span><b>Quantidade:</b> ${m.qty}</span><span>${m.protein}g proteína • ${m.kcal} kcal</span></div></label>`).join("")}</div>
  </div>
  <div class="card"><h2>Água</h2><div class="list">${["Manhã — 1,0 L","Tarde — 1,0 L","Treino/noite — 1,0 L","Completar — 0,5 L"].map((x,i)=>`<label class="check"><input type="checkbox" id="water-${i}"><div><strong>${x}</strong><span>Meta: ${p.waterTarget||"—"} L/dia</span></div></label>`).join("")}</div></div>
  <div class="card"><h2>Rotina e suplementos</h2><div class="list">${PLAN.schedule.map((s,i)=>`<label class="check"><input type="checkbox" id="sched-${i}"><div><strong>${s.time} • ${s.item}</strong><span>${s.note}</span></div></label>`).join("")}</div><div class="actions"><button class="ghost" onclick="enableReminders()">Ativar lembretes</button></div></div>
  <div class="card">
    <h2>Medição quinzenal</h2>
    <p class="${due?"notice":"ok"}">${due?"Medição liberada/pendente.":`Última medição em ${last}. Próxima em aprox. ${15-daysSince(last)} dia(s).`}</p>
    <details ${due?"open":""}><summary>Registrar peso/cintura</summary><div class="form-grid">${input("weight","Peso kg","number","76.4")}${input("waist","Cintura cm","number","82")}${input("arm","Braço cm","number","opcional")}${input("thigh","Coxa cm","number","opcional")}</div></details>
    <div class="form-grid" style="margin-top:12px">${input("date","Data","date","",today())}${input("sleep","Sono h","number","7.5")}${select("appetite","Apetite",["Bom","Normal","Baixo","Muito baixo"],"Normal")}${select("gi","Digestão/GI",["Normal","Constipado","Náusea","Refluxo","Diarreia"],"Normal")}</div>
    <div style="margin-top:12px"><label>Nota rápida</label><textarea id="diet-note"></textarea></div>
    <div class="actions"><button class="primary" onclick="saveDiet()">Salvar dieta</button></div>
    <p class="muted" style="font-size:12px">O ícone de comida no progresso aparece quando todas as refeições forem marcadas.</p>
  </div>
  <div class="card"><h2>Alternativas</h2><div class="list">${PLAN.meals.map(m=>`<details class="item"><summary><strong>${m.time} • ${m.name}</strong> <span class="pill">${m.protein}g prot.</span></summary><div class="muted"><b>Base:</b> ${m.qty}</div><ul class="alts">${m.alts.map(a=>`<li>${a}</li>`).join("")}</ul></details>`).join("")}</div></div>`;
}
function markAllMeals(){document.querySelectorAll(".meal-check").forEach(x=>x.checked=true)}
function saveDiet(){
  const date=$("date").value||today();
  const meals=PLAN.meals.map((m,i)=>({id:m.id,name:m.name,qty:m.qty,done:!!$(`meal-${i}`)?.checked}));
  const water=[0,1,2,3].map(i=>({done:!!$(`water-${i}`)?.checked}));
  const schedule=PLAN.schedule.map((s,i)=>({item:s.item,time:s.time,done:!!$(`sched-${i}`)?.checked}));
  const complete=meals.length>0 && meals.every(m=>m.done);
  user().dietLogs.push({id:uid(),date,complete,meals,water,schedule,note:$("diet-note").value});
  upsertDaily(date,{meals,water,schedule,diet:{complete,count:meals.filter(m=>m.done).length,total:meals.length},appetite:$("appetite").value,gi:$("gi").value});
  if($("weight").value||$("waist").value||$("arm").value||$("thigh").value){
    user().bodyLogs.push({id:uid(),date,weight:$("weight").value,waist:$("waist").value,arm:$("arm").value,thigh:$("thigh").value,sleep:$("sleep").value,appetite:$("appetite").value,digestion:$("gi").value,note:$("diet-note").value});
  }
  save();
}
function upsertDaily(date,patch){
  let row=user().dailyLogs.find(x=>x.date===date);
  if(!row){row={id:uid(),date,day:activeDay(),week:user().week,exercises:[],meals:[],water:[],schedule:[]};user().dailyLogs.push(row)}
  Object.assign(row,patch);
}
function renderCalendar(){
  const wk=week();
  return `${head("Calendário de treinos","12 semanas com vídeos de execução.")}
  <div class="week-strip">${PLAN.weeks.map(x=>`<button class="${x.week===user().week?"active":""}" onclick="user().week=${x.week};save()"><b>S${x.week}</b><br><span style="font-size:10px">${x.phase.split(" ")[0]}</span></button>`).join("")}</div>
  <div class="card"><span class="pill">Semana ${wk.week} • ${wk.phase}</span><p class="notice">${wk.rule}</p></div>
  <div class="calendar-grid" style="margin-top:12px">${Object.entries(workouts()).map(([day,w])=>`<div class="card item"><div style="display:flex;justify-content:space-between;gap:8px"><div><strong>${day}</strong><div class="muted">${w.title}</div></div><button class="ghost" onclick="user().dayOverrideDate='${today()}';user().dayOverride='${day}';save();setTab('train')">Usar hoje</button></div><ul>${w.exercises.map(e=>`<li>${e.name} — ${e.sets}x${e.reps} ${e.link&&e.link!=="#"?`<a class="video" href="${e.link}" target="_blank">vídeo</a>`:""}</li>`).join("")}</ul></div>`).join("")}</div>`;
}
function monthName(m){return["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"][m]}
function isoFor(y,m,d){return`${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`}
function logFlags(date){
  const daily=user().dailyLogs.find(x=>x.date===date);
  const trainDaily=!!(daily?.train?.complete || ((daily?.exercises||[]).length>0 && (daily.exercises||[]).every(e=>e.done)));
  const dietDaily=!!(daily?.diet?.complete || ((daily?.meals||[]).length>0 && (daily.meals||[]).every(m=>m.done)));
  const trainLog=(user().workoutLogs||[]).some(l=>l.date===date && (l.complete || ((l.exercises||[]).length>0 && (l.exercises||[]).every(e=>e.done))));
  const dietLog=(user().dietLogs||[]).some(l=>l.date===date && (l.complete || ((l.meals||[]).length>0 && (l.meals||[]).every(m=>m.done))));
  return {train:trainDaily||trainLog,diet:dietDaily||dietLog};
}
function monthStats(y,m){const days=new Date(y,m+1,0).getDate();let active=0,train=0,diet=0;for(let d=1;d<=days;d++){const f=logFlags(isoFor(y,m,d));if(f.train||f.diet)active++;if(f.train)train++;if(f.diet)diet++}return{active,train,diet}}
function changeProgressMonth(delta){const base=state.progressMonth?new Date(state.progressMonth+"-01T00:00"):new Date();base.setMonth(base.getMonth()+delta);state.progressMonth=`${base.getFullYear()}-${String(base.getMonth()+1).padStart(2,"0")}`;save()}
function progressCalendar(){
  const base=state.progressMonth?new Date(state.progressMonth+"-01T00:00"):new Date();
  const y=base.getFullYear(),m=base.getMonth(),days=new Date(y,m+1,0).getDate(),start=new Date(y,m,1).getDay();
  let cells=[];for(let i=0;i<start;i++)cells.push(`<div class="cal-cell empty"></div>`);
  for(let d=1;d<=days;d++){const date=isoFor(y,m,d),f=logFlags(date);cells.push(`<div class="cal-cell ${date===today()?"today":""}"><div class="cal-day">${d}</div><div class="cal-icons">${f.train?`<span class="cal-icon train">🏋️</span>`:""}${f.diet?`<span class="cal-icon diet">🍽️</span>`:""}</div></div>`)}
  const s=monthStats(y,m);
  return `<div class="calendar-card"><div class="calendar-top"><button class="ghost" onclick="changeProgressMonth(-1)">‹</button><div><h2>${monthName(m)} ${y}</h2><p class="muted">${s.active} dias ativos • ${s.train} treino(s) • ${s.diet} dieta(s)</p></div><button class="ghost" onclick="changeProgressMonth(1)">›</button></div><div class="calendar-legend"><span><b class="legend-dot train"></b> Treino completo</span><span><b class="legend-dot diet"></b> Dieta completa</span></div><div class="week-labels"><span>dom.</span><span>seg.</span><span>ter.</span><span>qua.</span><span>qui.</span><span>sex.</span><span>sáb.</span></div><div class="month-grid">${cells.join("")}</div></div>`;
}
function renderProgress(){
  const p=prof();
  return `${head("Evolução","Calendário mensal de constância: treino, dieta ou ambos.")}
  <div class="grid three">
    <div class="card kpi"><div class="label">Peso atual</div><div class="value">${latestWeight()?latestWeight().toFixed(1):"—"} kg</div><div class="hint">meta ${p.targetWeight||"—"} kg</div></div>
    <div class="card kpi"><div class="label">Progresso</div><div class="value">${pct()}%</div><div class="progress"><span style="width:${pct()}%"></span></div></div>
    <div class="card kpi"><div class="label">Última medição</div><div class="value" style="font-size:18px">${lastBody()||"—"}</div><div class="hint">15 dias</div></div>
  </div>
  <div class="card"><h2>Calendário de progresso</h2>${progressCalendar()}</div>
  <div class="card"><h2>Histórico</h2><div class="list">${history()}</div></div>`;
}
function history(){
  const rows=[...user().dailyLogs].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,12);
  if(!rows.length)return`<p class="muted">Nenhum check-in salvo ainda.</p>`;
  return rows.map(r=>`<div class="item"><strong>${r.date} • ${r.day||"-"}</strong><span>Treino: ${r.train?.complete?"completo":`${r.train?.count||0}/${r.train?.total||0}`} • Dieta: ${r.diet?.complete?"completa":`${r.diet?.count||0}/${r.diet?.total||0}`}</span></div>`).join("");
}
function renderMore(){
  return `${head("Mais","Perfis, lembretes, exames e backup.")}
  <div class="card"><h2>Perfis</h2><div class="form-grid"><div><label>Perfil ativo</label><select onchange="switchProfile(this.value)">${Object.entries(PLAN.profiles).map(([k,p])=>`<option value="${k}" ${state.profile===k?"selected":""}>${p.name}</option>`).join("")}</select></div><div><label>Treino detectado</label><input readonly value="${activeDay()}"></div></div></div>
  <div class="card"><h2>Lembretes</h2><p class="notice">Lembretes simples dependem do navegador/PWA. Para alerta confiável com app fechado, precisa Web Push com servidor.</p><div class="actions"><button class="primary" onclick="enableReminders()">Ativar</button><button class="ghost" onclick="testNotification()">Testar</button><button class="danger" onclick="disableReminders()">Desativar</button></div></div>
  <div class="card"><h2>Rotina</h2><div class="list">${PLAN.schedule.map(s=>`<div class="item"><strong>${s.time} • ${s.item}</strong><span>${s.note}</span></div>`).join("")}</div></div>
  <div class="card"><h2>Exames</h2><div class="list">${PLAN.exams.map(e=>`<div class="item"><strong>${e.group}</strong><span>${e.name} • ${e.frequency}</span></div>`).join("")}</div></div>
  <div class="card"><h2>Backup</h2><div class="actions"><button class="primary" onclick="exportBackup()">Exportar JSON</button><button class="danger" onclick="resetAll()">Apagar tudo</button></div></div>`;
}
function exportBackup(){const b=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=`sheipados_backup_${today()}.json`;a.click()}
function resetAll(){if(confirm("Apagar dados locais?")){localStorage.removeItem(KEY);state=blank();save()}}
async function showNotify(t,b){if(!("Notification"in window))return alert("Sem suporte a notificações.");if(Notification.permission!=="granted")return;try{const reg=await navigator.serviceWorker.ready;reg.showNotification(t,{body:b,icon:"./icons/icon-192.png"})}catch(e){new Notification(t,{body:b})}}
async function enableReminders(){if(!("Notification"in window))return alert("Sem suporte a notificações.");const p=await Notification.requestPermission();if(p!=="granted")return alert("Permissão negada.");user().settings.reminders=true;saveState();scheduleReminders();alert("Lembretes ativados.")}
function disableReminders(){user().settings.reminders=false;saveState();timers.forEach(clearTimeout);timers=[];render()}
function testNotification(){showNotify("Sheipados","Teste de alerta funcionando.")}
function scheduleReminders(){timers.forEach(clearTimeout);timers=[];if(!user().settings.reminders||!("Notification"in window)||Notification.permission!=="granted")return;const now=new Date();PLAN.schedule.forEach(s=>{if(s.weekly&&now.getDay()!==0)return;const [h,m]=s.hhmm.split(":").map(Number),target=new Date();target.setHours(h,m,0,0);const delay=target-now;if(delay>0&&delay<86400000)timers.push(setTimeout(()=>showNotify("Sheipados",`${s.time} • ${s.item}. ${s.note}`),delay))})}

function bindNavTouch(){
  const nav = document.querySelector(".nav");
  if(!nav || nav.dataset.bound === "1") return;
  nav.dataset.bound = "1";

  const activate = (ev) => {
    const btn = ev.target.closest("button[data-tab]");
    if(!btn) return;
    ev.preventDefault();
    ev.stopPropagation();
    const tab = btn.dataset.tab;
    if(tab && tab !== activeTab) setTab(tab);
  };

  nav.addEventListener("pointerdown", activate, {capture:true});
  nav.addEventListener("touchstart", activate, {capture:true, passive:false});
  nav.addEventListener("click", activate, {capture:true});
}

function render(){
  if(!tabs.some(t=>t[0]===activeTab)) activeTab="train";
  let content="";
  try{
    if(activeTab==="train") content=renderTrain();
    else if(activeTab==="diet") content=renderDiet();
    else if(activeTab==="calendar") content=renderCalendar();
    else if(activeTab==="progress") content=renderProgress();
    else if(activeTab==="more") content=renderMore();
  }catch(e){
    content=`<div class="card"><h2>Erro ao carregar esta aba</h2><p class="notice">${e.message}</p><button class="ghost" onclick="setTab('train')">Voltar ao treino</button></div>`;
    console.error(e);
  }
  document.getElementById("app").innerHTML=shell(content);
  bindNavTouch();
}
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
render();scheduleReminders();
