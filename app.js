
const PLAN=window.PLAN_DATA, KEY="sheipados_v16";
const tabs=[["train","Treino","✅"],["diet","Dieta","🍽️"],["calendar","Calendário","📅"],["progress","Evolução","📈"],["more","Mais","⚙️"]];
let timers=[];
function today(){const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,10)}
function dayName(){const m=["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"],d=m[new Date().getDay()];return d==="Sábado"||d==="Domingo"?"Sábado/Domingo":d}
function uid(){return crypto.randomUUID?crypto.randomUUID():String(Date.now())}
function blankUser(){return{week:1,dayOverrideDate:null,dayOverride:null,dailyLogs:[],bodyLogs:[],workoutLogs:[],dietLogs:[],settings:{reminders:false}}}
function blank(){return{profile:"rogerio",users:{rogerio:blankUser(),fernanda:blankUser()}}}
let state=(()=>{try{let raw=localStorage.getItem(KEY); if(!raw){for(const k of ["sheipados_v15","sheipados_v14","sheipados_v13","sheipados_v12","sheipados_v11","sheipados_v10","sheipados_v9","sheipados_v8","sheipados_v7","sheipados_v6","sheipados_v5"]){raw=localStorage.getItem(k); if(raw) break;}} let p=raw?JSON.parse(raw):null; return p?{...blank(),...p,users:{rogerio:{...blankUser(),...(p.users?.rogerio||{})},fernanda:{...blankUser(),...(p.users?.fernanda||{})}}}:blank()}catch(e){return blank()}})();
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
function shell(){let p=prof();document.getElementById("app").innerHTML=`<div class="shell"><header class="topbar"><div class="title-row"><div class="brand"><div class="logo"><img src="./icon-192.png?v=14" alt="Sheipados" onerror="this.parentElement.outerHTML=\'<div class=&quot;logo-fallback&quot; aria-label=&quot;Sheipados&quot;></div>\'"></div><div><h1>${PLAN.project.name}</h1><div class="sub">${p.name} • ${p.goal||"Plano"}</div></div></div><select class="profile-select" onchange="switchProfile(this.value)">${Object.entries(PLAN.profiles).map(([k,v])=>`<option value="${k}" ${state.profile===k?"selected":""}>${v.name}</option>`).join("")}</select></div></header><main class="content">${tabs.map(t=>`<section class="section" id="${t[0]}"></section>`).join("")}</main><nav class="nav">${tabs.map(t=>`<button data-tab="${t[0]}" onclick="openTab('${t[0]}')"><span class="ico">${t[2]}</span><span>${t[1]}</span></button>`).join("")}</nav></div>`}
function input(id,label,type="text",ph="",val=""){return`<div><label>${label}</label><input id="${id}" type="${type}" placeholder="${ph}" value="${val}"></div>`}
function select(id,label,ops,val=""){return`<div><label>${label}</label><select id="${id}">${ops.map(o=>`<option ${o===val?"selected":""}>${o}</option>`).join("")}</select></div>`}
function head(t,s){return`<div class="page-head"><h2>${t}</h2><p>${s||""}</p></div>`}
function renderTrain(){let w=workout(), wk=week(), p=prof();$("train").innerHTML=`${head("Hoje • Treino",`Detectado automaticamente: ${activeDay()}.`)}<div class="grid three"><div class="card kpi"><div class="label">Treino</div><div class="value" style="font-size:20px">${w.title}</div><div class="hint">${activeDay()}</div></div><div class="card kpi"><div class="label">Semana</div><div class="value">S${u().week}</div><div class="hint">${wk.phase}</div></div><div class="card kpi"><div class="label">Peso</div><div class="value">${latestWeight()?latestWeight().toFixed(1):"—"} kg</div><div class="hint">meta ${p.targetWeight||"—"} kg</div></div></div><div class="card"><p class="notice"><b>Regra:</b> ${wk.rule}</p><details><summary>Trocar treino só hoje</summary><div class="form-grid"><div><label>Semana</label><select onchange="u().week=Number(this.value);save()">${PLAN.weeks.map(x=>`<option value="${x.week}" ${x.week===u().week?"selected":""}>Semana ${x.week}</option>`).join("")}</select></div><div><label>Dia</label><select onchange="u().dayOverrideDate='${today()}';u().dayOverride=this.value;save()">${Object.keys(workouts()).map(d=>`<option ${d===activeDay()?"selected":""}>${d}</option>`).join("")}</select></div></div></details><h3>Exercícios executados</h3><div class="list">${w.exercises.map((e,i)=>`<label class="check"><input type="checkbox" id="ex-${i}"><div><strong>${e.name}</strong><span>${e.sets}x${e.reps} • RPE ${e.rpe} ${e.link&&e.link!=="#"?`• <a href="${e.link}" target="_blank">vídeo</a>`:""}</span></div></label>`).join("")}</div><div style="margin-top:12px"><label>Nota do treino</label><textarea id="tr-note" placeholder="Ex.: completo, energia baixa, adaptação..."></textarea></div><div class="actions"><button class="primary" onclick="saveTrain()">Salvar treino</button></div></div>`}
function saveTrain(){let w=workout(), ex=w.exercises.map((e,i)=>({name:e.name,done:$(`ex-${i}`).checked}));u().workoutLogs.push({id:uid(),date:today(),week:u().week,day:activeDay(),title:w.title,exercises:ex,note:$("tr-note").value});upsertDaily({exercises:ex,day:activeDay(),week:u().week,workoutTitle:w.title});save()}
function upsertDaily(part){let d=today(), log=u().dailyLogs.find(x=>x.date===d);if(!log){log={id:uid(),date:d,day:activeDay(),week:u().week,exercises:[],meals:[],water:[],schedule:[]};u().dailyLogs.push(log)}Object.assign(log,part)}

function dietExtras(i){
  const groups=[
    [
      {item:"Água — 500 ml até o treino", type:"water"},
      {item:"Cafeína opcional, se usar", type:"supplement"}
    ],
    [
      {item:"Creatina diária", type:"supplement"},
      {item:"Água — 500 ml pós-treino/manhã", type:"water"}
    ],
    [
      {item:"Água — 500 ml manhã", type:"water"}
    ],
    [
      {item:"Água — 500 ml almoço/tarde", type:"water"},
      {item:"Vitamina D/ômega-3 se prescritos", type:"supplement"}
    ],
    [
      {item:"Água — 500 ml tarde", type:"water"}
    ],
    [
      {item:"Água — completar meta do dia", type:"water"},
      {item:"Magnésio se usado", type:"supplement"},
      {item:"Medicação noturna conforme prescrição", type:"medical"}
    ]
  ];
  return groups[i] || [];
}
function markDietAll(){
  document.querySelectorAll(".diet-flag").forEach(x=>x.checked=true);
}
function dietChoiceOptions(m){
  const opts=[`Base recomendada: ${m.qty}`,...(m.alts||[])];
  return opts.map((o,idx)=>`<option value="${idx}">${o}</option>`).join("");
}
function chosenDietText(m,i){
  const sel=$(`meal-choice-${i}`);
  if(!sel) return `Base recomendada: ${m.qty}`;
  const idx=Number(sel.value||0);
  return [`Base recomendada: ${m.qty}`,...(m.alts||[])][idx] || `Base recomendada: ${m.qty}`;
}

function updateMealSelection(i){
  const m=PLAN.meals[i];
  const target=$(`meal-selected-${i}`);
  if(!m || !target) return;
  target.textContent=chosenDietText(m,i);
}

function collectDietFlags(){
  const meals=PLAN.meals.map((m,i)=>({
    id:m.id,
    name:m.name,
    qty:m.qty,
    selected:chosenDietText(m,i),
    done:!!$(`meal-${i}`)?.checked
  }));
  const extras=PLAN.meals.flatMap((m,i)=>dietExtras(i).map((x,j)=>({
    mealId:m.id,
    mealName:m.name,
    item:x.item,
    type:x.type,
    done:!!$(`extra-${i}-${j}`)?.checked
  })));
  const allFlags=[...meals.map(m=>({type:"meal",done:m.done})),...extras.map(e=>({type:e.type,done:e.done}))];
  const total=allFlags.length;
  const count=allFlags.filter(x=>x.done).length;
  const complete=total>0 && count===total;
  const water=extras.filter(x=>x.type==="water");
  const schedule=extras.filter(x=>x.type!=="water");
  return {meals,extras,water,schedule,count,total,complete};
}

function renderDiet(){let p=prof(), last=lastBody(), due=daysSince(last)>=15;$("diet").innerHTML=`${head("Hoje • Dieta","Refeições, água e suplementos agrupados em um só checklist.")}<div class="grid three"><div class="card kpi"><div class="label">Proteína</div><div class="value">${p.proteinTarget||"—"}g</div><div class="hint">meta</div></div><div class="card kpi"><div class="label">Calorias</div><div class="value">${p.caloriesTrainingDay||"—"}</div><div class="hint">dia treino</div></div><div class="card kpi"><div class="label">Água</div><div class="value">${p.waterTarget||"—"}L</div><div class="hint">meta</div></div></div><div class="card"><h2>Checklist da dieta</h2><p class="muted" style="font-size:13px;margin-top:-4px">Marque a refeição realizada, escolha exatamente o que consumiu e confirme água/suplementos associados.</p><div class="actions"><button class="ghost" onclick="markDietAll()">Marcar tudo</button><button class="ghost" onclick="enableReminders()">Ativar lembretes</button></div><div class="list">${PLAN.meals.map((m,i)=>`<div class="check diet-card"><input type="checkbox" class="diet-flag" id="meal-${i}"><div class="diet-body"><strong>${m.time} • ${m.name}</strong><span class="selected-meal"><b>Selecionado:</b> <span id="meal-selected-${i}">Base recomendada: ${m.qty}</span></span><span>${m.protein}g proteína • ${m.kcal} kcal</span><div class="choice-row"><label>Opção realizada</label><select id="meal-choice-${i}" onchange="updateMealSelection(${i})">${dietChoiceOptions(m)}</select></div>${i===1?`<p class="muted meal-note">Se escolher ovos/pão/fruta, não precisa tomar whey junto. Whey só entra quando a opção escolhida tiver whey ou quando você usar para completar proteína.</p>`:""}${dietExtras(i).length?`<div class="mini-flags">${dietExtras(i).map((x,j)=>`<label class="mini-check ${x.type}"><input type="checkbox" class="diet-flag" id="extra-${i}-${j}"><span>${x.item}</span></label>`).join("")}</div>`:""}</div></div>`).join("")}</div><p class="muted" style="font-size:12px">O ícone de comida no progresso aparece quando todos os flags da dieta do dia forem marcados: refeições, água e suplementos/rotina prescrita.</p></div><div class="card"><h2>Medição quinzenal</h2><p class="${due?"notice":"ok"}">${due?"Medição liberada/pendente.":"Última medição em "+last+". Próxima em aprox. "+(15-daysSince(last))+" dia(s)."}</p><details ${due?"open":""}><summary>Registrar peso/cintura</summary><div class="form-grid">${input("weight","Peso kg","number","76.4")}${input("waist","Cintura cm","number","82")}${input("arm","Braço cm","number","opcional")}${input("thigh","Coxa cm","number","opcional")}</div></details><div class="form-grid" style="margin-top:12px">${input("date","Data","date","",today())}${input("sleep","Sono h","number","7.5")}${select("appetite","Apetite",["Bom","Normal","Baixo","Muito baixo"],"Normal")}${select("gi","Digestão/GI",["Normal","Constipado","Náusea","Refluxo","Diarreia"],"Normal")}</div><div style="margin-top:12px"><label>Nota rápida</label><textarea id="diet-note" placeholder="Ex.: almocei fora, bati água, apetite baixo..."></textarea></div><div class="actions"><button class="primary" onclick="saveDiet()">Salvar dieta</button></div></div>`}
function saveDiet(){let date=$("date").value||today(), flags=collectDietFlags();u().dietLogs.push({id:uid(),date,complete:flags.complete,meals:flags.meals,extras:flags.extras,water:flags.water,schedule:flags.schedule,note:$("diet-note").value});upsertDaily({date,meals:flags.meals,extras:flags.extras,water:flags.water,schedule:flags.schedule,diet:{complete:flags.complete,count:flags.count,total:flags.total},appetite:$("appetite").value,gi:$("gi").value});if($("weight").value||$("waist").value||$("arm").value||$("thigh").value)u().bodyLogs.push({id:uid(),date,weight:$("weight").value,waist:$("waist").value,arm:$("arm").value,thigh:$("thigh").value,sleep:$("sleep").value,appetite:$("appetite").value,digestion:$("gi").value,note:$("diet-note").value});save()}
function renderCalendar(){let wk=week();$("calendar").innerHTML=`${head("Calendário de treinos","12 semanas com vídeos de execução.")}<div class="week-strip">${PLAN.weeks.map(x=>`<button class="${x.week===u().week?"active":""}" onclick="u().week=${x.week};save()">S${x.week}<br><span style="font-size:10px">${x.phase.split(" ")[0]}</span></button>`).join("")}</div><div class="card"><span class="pill">Semana ${wk.week} • ${wk.phase}</span><p class="notice">${wk.rule}</p></div><div class="calendar-grid" style="margin-top:12px">${Object.entries(workouts()).map(([day,w])=>`<div class="card item"><div style="display:flex;justify-content:space-between;gap:8px"><div><strong>${day}</strong><div class="muted">${w.title}</div></div><button class="ghost" onclick="u().dayOverrideDate='${today()}';u().dayOverride='${day}';save();openTab('train')">Usar hoje</button></div><ul>${w.exercises.map(e=>`<li>${e.name} — ${e.sets}x${e.reps} ${e.link&&e.link!=="#"?`<a class="video" href="${e.link}" target="_blank">vídeo</a>`:""}</li>`).join("")}</ul></div>`).join("")}</div>`}

function progressMonthName(m){return ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"][m]}
function progressISO(y,m,d){return `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`}
function progressFlags(date){
  const daily=u().dailyLogs.find(x=>x.date===date);
  const trainDaily=!!((daily?.exercises||[]).length>0 && (daily.exercises||[]).every(e=>e.done));
  const dietDaily=!!(daily?.diet?.complete || ((daily?.meals||[]).length>0 && (daily.meals||[]).every(m=>m.done) && (!(daily?.extras)||daily.extras.length===0 || daily.extras.every(e=>e.done))));
  const trainLog=(u().workoutLogs||[]).some(l=>l.date===date && ((l.exercises||[]).length>0 && (l.exercises||[]).every(e=>e.done)));
  const dietLog=(u().dietLogs||[]).some(l=>l.date===date && (l.complete || ((l.meals||[]).length>0 && (l.meals||[]).every(m=>m.done) && (!(l.extras)||l.extras.length===0 || l.extras.every(e=>e.done)))));
  return {train:trainDaily||trainLog,diet:dietDaily||dietLog};
}
function progressMonthStats(y,m){
  const days=new Date(y,m+1,0).getDate();let active=0,train=0,diet=0;
  for(let d=1;d<=days;d++){const f=progressFlags(progressISO(y,m,d));if(f.train||f.diet)active++;if(f.train)train++;if(f.diet)diet++}
  return {active,train,diet};
}
function changeProgressMonth(delta){
  const base=state.progressMonth?new Date(state.progressMonth+"-01T00:00"):new Date();
  base.setMonth(base.getMonth()+delta);
  state.progressMonth=`${base.getFullYear()}-${String(base.getMonth()+1).padStart(2,"0")}`;
  localStorage.setItem(KEY,JSON.stringify(state));
  renderProgress();
}
function progressCalendarHTML(){
  const base=state.progressMonth?new Date(state.progressMonth+"-01T00:00"):new Date();
  const y=base.getFullYear(),m=base.getMonth(),days=new Date(y,m+1,0).getDate(),start=new Date(y,m,1).getDay();
  let cells=[];
  for(let i=0;i<start;i++)cells.push(`<div class="progress-cal-cell empty"></div>`);
  for(let d=1;d<=days;d++){
    const date=progressISO(y,m,d),f=progressFlags(date);
    cells.push(`<div class="progress-cal-cell ${date===today()?"today":""}"><div class="progress-cal-day">${d}</div><div class="progress-cal-icons">${f.train?`<span class="progress-cal-icon train">🏋️</span>`:""}${f.diet?`<span class="progress-cal-icon diet">🍽️</span>`:""}</div></div>`);
  }
  const s=progressMonthStats(y,m);
  return `<div class="progress-calendar"><div class="progress-calendar-top"><button class="ghost" onclick="changeProgressMonth(-1)">‹</button><div><h2>${progressMonthName(m)} ${y}</h2><p class="muted">${s.active} dias ativos • ${s.train} treino(s) • ${s.diet} dieta(s)</p></div><button class="ghost" onclick="changeProgressMonth(1)">›</button></div><div class="progress-legend"><span><b class="legend-dot train"></b> Treino completo</span><span><b class="legend-dot diet"></b> Dieta completa</span></div><div class="progress-week-labels"><span>dom.</span><span>seg.</span><span>ter.</span><span>qua.</span><span>qui.</span><span>sex.</span><span>sáb.</span></div><div class="progress-month-grid">${cells.join("")}</div></div>`;
}

function renderProgress(){$("progress").innerHTML=`${head("Evolução","Calendário mensal de constância: treino, dieta ou ambos.")}<div class="grid three"><div class="card kpi"><div class="label">Peso</div><div class="value">${latestWeight()?latestWeight().toFixed(1):"—"} kg</div><div class="hint">inicial ${prof().initialWeight||"—"}</div></div><div class="card kpi"><div class="label">Progresso</div><div class="value">${pct()}%</div><div class="progress"><span style="width:${pct()}%"></span></div></div><div class="card kpi"><div class="label">Última medição</div><div class="value" style="font-size:18px">${lastBody()||"—"}</div><div class="hint">15 dias</div></div></div><div class="card"><h2>Calendário de progresso</h2>${progressCalendarHTML()}</div><div class="card"><h2>Histórico</h2><div class="list">${history()}</div></div>`}
function history(){let rows=[...u().dailyLogs].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,12);return rows.length?rows.map(r=>`<div class="history"><h3>${r.date} • ${r.day||"-"}</h3><p>Exercícios: ${(r.exercises||[]).filter(e=>e.done).length}/${(r.exercises||[]).length} • Dieta: ${r.diet?.complete?"completa":`${r.diet?.count??(r.meals||[]).filter(m=>m.done).length}/${r.diet?.total??(r.meals||[]).length}`}</p></div>`).join(""):`<p class="muted">Nenhum check-in.</p>`}
function renderMore(){$("more").innerHTML=`${head("Mais","Perfis, lembretes, exames e backup.")}<div class="card"><h2>Perfis</h2><div class="form-grid"><div><label>Perfil ativo</label><select onchange="switchProfile(this.value)">${Object.entries(PLAN.profiles).map(([k,p])=>`<option value="${k}" ${state.profile===k?"selected":""}>${p.name}</option>`).join("")}</select></div><div><label>Treino detectado</label><input readonly value="${activeDay()}"></div></div></div><div class="card"><h2>Lembretes</h2><p class="notice">Lembretes simples dependem do navegador/PWA. Para alerta confiável com app fechado, precisa Web Push com servidor.</p><div class="actions"><button class="primary" onclick="enableReminders()">Ativar</button><button class="ghost" onclick="testNotification()">Testar</button><button class="danger" onclick="disableReminders()">Desativar</button></div></div><div class="card"><h2>Rotina</h2><div class="list">${PLAN.schedule.map(s=>`<div class="item"><strong>${s.time} • ${s.item}</strong><span>${s.note}</span></div>`).join("")}</div></div><div class="card"><h2>Exames</h2><div class="list">${PLAN.exams.map(e=>`<div class="item"><strong>${e.group}</strong><span>${e.name} • ${e.frequency}</span></div>`).join("")}</div></div><div class="card"><h2>Backup</h2><div class="actions"><button class="primary" onclick="exportBackup()">Exportar JSON</button><button class="danger" onclick="resetAll()">Apagar tudo</button></div></div>`}
function exportBackup(){let b=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=`sheipados_backup_${today()}.json`;a.click()}
function resetAll(){if(confirm("Apagar dados locais?")){localStorage.removeItem(KEY);state={profile:"rogerio",users:{rogerio:{...u(),dailyLogs:[],bodyLogs:[],workoutLogs:[],dietLogs:[]},fernanda:{...u(),dailyLogs:[],bodyLogs:[],workoutLogs:[],dietLogs:[]}}};location.reload()}}
async function showNotify(t,b){if(!("Notification"in window))return alert("Sem suporte a notificações.");if(Notification.permission!=="granted")return;try{let reg=await navigator.serviceWorker.ready;reg.showNotification(t,{body:b,icon:"./icon-192.png?v=14"})}catch(e){new Notification(t,{body:b})}}
async function enableReminders(){if(!("Notification"in window))return alert("Sem suporte a notificações.");let p=await Notification.requestPermission();if(p!=="granted")return alert("Permissão negada.");u().settings.reminders=true;localStorage.setItem(KEY,JSON.stringify(state));scheduleReminders();alert("Lembretes ativados.")}
function disableReminders(){u().settings.reminders=false;localStorage.setItem(KEY,JSON.stringify(state));timers.forEach(clearTimeout);timers=[];render()}
function testNotification(){showNotify("Sheipados","Teste de alerta funcionando.")}
function scheduleReminders(){timers.forEach(clearTimeout);timers=[];if(!u().settings.reminders||!("Notification"in window)||Notification.permission!=="granted")return;let now=new Date();PLAN.schedule.forEach(s=>{if(s.weekly&&now.getDay()!==0)return;let [h,m]=s.hhmm.split(":").map(Number),target=new Date();target.setHours(h,m,0,0);let delay=target-now;if(delay>0&&delay<86400000)timers.push(setTimeout(()=>showNotify("Sheipados",`${s.time} • ${s.item}. ${s.note}`),delay))})}
function render(){shell();renderTrain();renderDiet();renderCalendar();renderProgress();renderMore();let h=location.hash.replace("#","")||"train";openTab(tabs.some(t=>t[0]===h)?h:"train")}
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));render();scheduleReminders();
