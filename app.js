
const PLAN=window.PLAN_DATA, KEY="sheipados_v31";
const tabs=[["train","Treino","✅"],["diet","Dieta","🍽️"],["calendar","Calendário","📅"],["progress","Evolução","📈"],["more","Mais","⚙️"]];
let timers=[];
function today(){const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,10)}
function dayName(){const m=["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"],d=m[new Date().getDay()];return d==="Sábado"||d==="Domingo"?"Sábado/Domingo":d}
function uid(){return crypto.randomUUID?crypto.randomUUID():String(Date.now())}
function blankUser(){return{week:1,calendarWeek:null,weekOverrideDate:null,weekOverride:null,dayOverrideDate:null,dayOverride:null,dailyLogs:[],bodyLogs:[],workoutLogs:[],dietLogs:[],examPdfLogs:[],examPdfLogs:[],settings:{reminders:false}}}
function blank(){return{profile:"rogerio",users:{rogerio:blankUser(),fernanda:blankUser()}}}
let state=(()=>{try{let raw=localStorage.getItem(KEY); if(!raw){for(const k of ["sheipados_v30","sheipados_v29","sheipados_v28","sheipados_v27","sheipados_v26","sheipados_v25","sheipados_v24","sheipados_v23","sheipados_v22","sheipados_v21","sheipados_v20","sheipados_v19","sheipados_v18","sheipados_v17","sheipados_v16","sheipados_v15","sheipados_v14","sheipados_v13","sheipados_v12","sheipados_v11","sheipados_v10","sheipados_v9","sheipados_v8","sheipados_v7","sheipados_v6","sheipados_v5"]){raw=localStorage.getItem(k); if(raw) break;}} let p=raw?JSON.parse(raw):null; return p?{...blank(),...p,users:{rogerio:{...blankUser(),...(p.users?.rogerio||{})},fernanda:{...blankUser(),...(p.users?.fernanda||{})}}}:blank()}catch(e){return blank()}})();
function u(){return state.users[state.profile]} function prof(){return PLAN.profiles[state.profile]} const TRAINING_START_DATE="2026-06-29";

function dateSerial(ds){
  return Math.floor(new Date(ds+"T00:00:00").getTime()/86400000);
}
function isAfterTrainingStart(ds){
  return !!ds && dateSerial(ds)>=dateSerial(TRAINING_START_DATE);
}
function isCoreWorkoutDayName(day){
  return day && day!=="Sábado/Domingo";
}
function validWorkoutLog(log){
  return log && isAfterTrainingStart(log.date) && isCoreWorkoutDayName(log.day) && ((log.exercises||[]).some(e=>e.done));
}
function coreWorkoutCheckins(){
  const seen=new Set();
  (u().workoutLogs||[]).forEach(log=>{
    if(validWorkoutLog(log)) seen.add(log.date);
  });
  return seen.size;
}
function autoWeek(){
  return Math.max(1,Math.min(12,Math.floor(coreWorkoutCheckins()/5)+1));
}
function weekProgressInCycle(){
  return coreWorkoutCheckins()%5;
}
function activeWeekNumber(){
  if(u().weekOverrideDate===today() && u().weekOverride) return Number(u().weekOverride);
  return autoWeek();
}
function calendarWeekNumber(){
  return Number(u().calendarWeek||activeWeekNumber());
}
function workoutBlockForWeek(weekNumber){
  const blocks=prof().workoutBlocks;
  if(!blocks) return {key:"A",name:"Bloco A",focus:"",workouts:prof().workouts};
  const wk=Number(weekNumber)||1;
  const key=wk<=4?"A":wk<=8?"B":"C";
  return {key,...blocks[key]};
}
function currentWorkoutBlock(){
  return workoutBlockForWeek(activeWeekNumber());
}
function workoutsForWeek(weekNumber){
  return workoutBlockForWeek(weekNumber).workouts||prof().workouts;
}
function workouts(){return workoutsForWeek(activeWeekNumber())}
function activeDay(){return u().dayOverrideDate===today()&&u().dayOverride?u().dayOverride:dayName()}
function workout(){return workouts()[activeDay()]||workouts().Segunda}
function week(){return PLAN.weeks.find(x=>x.week===activeWeekNumber())||PLAN.weeks[0]}
function calendarWeek(){return PLAN.weeks.find(x=>x.week===calendarWeekNumber())||PLAN.weeks[0]}

function currentOpenTab(){
  const active=document.querySelector(".section.active");
  return active?.id || location.hash.replace("#","") || "train";
}

function scrollCalendarWeekIntoView(weekNumber){
  const apply = () => {
    const strip=document.querySelector("#calendar .week-strip");
    const chip=document.querySelector(`#calendar .week-chip[data-week="${weekNumber}"]`);
    if(!strip || !chip) return;

    const target = chip.offsetLeft - (strip.clientWidth / 2) + (chip.clientWidth / 2);
    const max = Math.max(0, strip.scrollWidth - strip.clientWidth);
    const left = Math.max(0, Math.min(target, max));

    strip.scrollLeft = left;
    if(strip.scrollTo) strip.scrollTo({left, behavior:"auto"});
  };

  requestAnimationFrame(apply);
  setTimeout(apply, 80);
  setTimeout(apply, 220);
  setTimeout(apply, 450);
}

function setCalendarWeek(weekNumber){
  u().calendarWeek=Number(weekNumber);
  localStorage.setItem(KEY,JSON.stringify(state));
  renderCalendar();
  openTab("calendar");
}

function save(){const tab=currentOpenTab();localStorage.setItem(KEY,JSON.stringify(state));render(tab)}
function $(id){return document.getElementById(id)} function num(v){let n=Number(v);return Number.isFinite(n)?n:0}
function latestWeight(){let l=[...u().bodyLogs].filter(x=>x.weight).sort((a,b)=>a.date.localeCompare(b.date));return l.length?num(l.at(-1).weight):(prof().initialWeight?num(prof().initialWeight):0)}
function lastBody(){let l=[...u().bodyLogs].filter(x=>x.weight||x.waist).sort((a,b)=>a.date.localeCompare(b.date));return l.length?l.at(-1).date:null}
function daysSince(ds){if(!ds)return 999;return Math.floor((new Date(today()+"T00:00")-new Date(ds+"T00:00"))/86400000)}
function pct(){let p=prof();if(!p.initialWeight||!p.targetWeight)return 0;return Math.max(0,Math.min(100,Math.round((latestWeight()-num(p.initialWeight))/(num(p.targetWeight)-num(p.initialWeight))*100)))}
function openTab(id){document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));document.querySelectorAll(".nav button").forEach(b=>b.classList.remove("active"));$(id).classList.add("active");document.querySelector(`[data-tab="${id}"]`).classList.add("active");let c=document.querySelector(".content"); if(c) c.scrollTop=0; history.replaceState(null,"","#"+id)}
function switchProfile(v){state.profile=v;save()}
function shell(){let p=prof();document.getElementById("app").innerHTML=`<div class="shell"><header class="topbar"><div class="title-row"><div class="brand"><div class="logo"><img src="./icon-192.png?v=14" alt="Sheipados" onerror="this.parentElement.outerHTML=\'<div class=&quot;logo-fallback&quot; aria-label=&quot;Sheipados&quot;></div>\'"></div><div><h1>${PLAN.project.name}</h1><div class="sub">${p.name}</div></div></div><select class="profile-select" onchange="switchProfile(this.value)">${Object.entries(PLAN.profiles).map(([k,v])=>`<option value="${k}" ${state.profile===k?"selected":""}>${v.name}</option>`).join("")}</select></div></header><main class="content">${tabs.map(t=>`<section class="section" id="${t[0]}"></section>`).join("")}</main><nav class="nav">${tabs.map(t=>`<button data-tab="${t[0]}" onclick="openTab('${t[0]}')"><span class="ico">${t[2]}</span><span>${t[1]}</span></button>`).join("")}</nav></div>`}
function input(id,label,type="text",ph="",val=""){return`<div><label>${label}</label><input id="${id}" type="${type}" placeholder="${ph}" value="${val}"></div>`}
function select(id,label,ops,val=""){return`<div><label>${label}</label><select id="${id}">${ops.map(o=>`<option ${o===val?"selected":""}>${o}</option>`).join("")}</select></div>`}
function head(t,s){return`<div class="page-head"><h2>${t}</h2><p>${s||""}</p></div>`}
function renderTrain(){let w=workout(), wk=week(), aw=activeWeekNumber(), done=weekProgressInCycle(), total=coreWorkoutCheckins();$("train").innerHTML=`${head("Hoje • Treino",`Detectado automaticamente: ${activeDay()}.`)}<div class="grid two"><div class="card kpi"><div class="label">Treino</div><div class="value" style="font-size:20px">${w.title}</div><div class="hint">${activeDay()}</div></div><div class="card kpi"><div class="label">Semana automática</div><div class="value">S${aw}</div><div class="hint">${done}/5 check-ins nesta semana</div></div></div><div class="card"><p class="pill">${currentWorkoutBlock().name} • ${currentWorkoutBlock().focus}</p><p class="notice"><b>Ciclo:</b> início em 29/06/2026. A cada 5 check-ins válidos de segunda a sexta, o app avança automaticamente uma semana. Sábado/domingo fica como bônus opcional e não conta para avançar semana.</p><p class="muted" style="font-size:13px">Check-ins válidos desde o início: ${total}. Semana atual: S${aw} • ${wk.phase}.</p><details><summary>Mudar treino só hoje</summary><div class="form-grid"><div><label>Semana só hoje</label><select onchange="u().weekOverrideDate=today();u().weekOverride=Number(this.value);save()">${PLAN.weeks.map(x=>`<option value="${x.week}" ${x.week===aw?"selected":""}>Semana ${x.week}</option>`).join("")}</select></div><div><label>Dia só hoje</label><select onchange="u().dayOverrideDate=today();u().dayOverride=this.value;save()">${Object.keys(workouts()).map(d=>`<option ${d===activeDay()?"selected":""}>${d}</option>`).join("")}</select></div></div><div class="actions"><button class="ghost" onclick="u().weekOverrideDate=null;u().weekOverride=null;u().dayOverrideDate=null;u().dayOverride=null;save()">Limpar troca de hoje</button></div></details><h3>Exercícios executados</h3><div class="list">${w.exercises.map((e,i)=>`<label class="check"><input type="checkbox" id="ex-${i}"><div><strong>${e.name}</strong><span>${e.sets}x${e.reps} • RPE ${e.rpe} ${e.link&&e.link!=="#"?`• <a href="${e.link}" target="_blank">vídeo</a>`:""}</span></div></label>`).join("")}</div><div style="margin-top:12px"><label>Nota do treino</label><textarea id="tr-note" placeholder="Ex.: completo, energia baixa, adaptação..."></textarea></div><div class="actions"><button class="primary" onclick="saveTrain()">Salvar treino</button></div></div>`}
function saveTrain(){let w=workout(), aw=activeWeekNumber(), ex=w.exercises.map((e,i)=>({name:e.name,done:$(`ex-${i}`).checked}));u().workoutLogs.push({id:uid(),date:today(),week:aw,day:activeDay(),title:w.title,exercises:ex,note:$("tr-note").value});upsertDaily({exercises:ex,day:activeDay(),week:aw,workoutTitle:w.title});save()}
function upsertDaily(part){let d=today(), log=u().dailyLogs.find(x=>x.date===d);if(!log){log={id:uid(),date:d,day:activeDay(),week:activeWeekNumber(),exercises:[],meals:[],water:[],schedule:[]};u().dailyLogs.push(log)}Object.assign(log,part)}

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
function toggleDietAll(){
  const flags=[...document.querySelectorAll(".diet-flag")];
  const allMarked=flags.length>0 && flags.every(x=>x.checked);
  flags.forEach(x=>x.checked=!allMarked);
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

function renderDiet(){let p=prof();$("diet").innerHTML=`${head("Hoje • Dieta","Refeições, água e suplementos agrupados em um só checklist.")}<div class="grid three"><div class="card kpi"><div class="label">Proteína</div><div class="value">${p.proteinTarget||"—"}g</div><div class="hint">meta</div></div><div class="card kpi"><div class="label">Calorias</div><div class="value">${p.caloriesTrainingDay||"—"}</div><div class="hint">dia treino</div></div><div class="card kpi"><div class="label">Água</div><div class="value">${p.waterTarget||"—"}L</div><div class="hint">meta</div></div></div><div class="card"><h2>Checklist da dieta</h2><p class="muted" style="font-size:13px;margin-top:-4px">Marque a refeição realizada, escolha exatamente o que consumiu e confirme água/suplementos associados.</p><div class="actions"><button class="ghost" onclick="toggleDietAll()">Marcar/Desmarcar tudo</button></div><div class="list">${PLAN.meals.map((m,i)=>`<div class="check diet-card"><input type="checkbox" class="diet-flag" id="meal-${i}"><div class="diet-body"><strong>${m.time} • ${m.name}</strong><span class="selected-meal"><b>Selecionado:</b> <span id="meal-selected-${i}">Base recomendada: ${m.qty}</span></span><span>${m.protein}g proteína • ${m.kcal} kcal</span><div class="choice-row"><label>Opção realizada</label><select id="meal-choice-${i}" onchange="updateMealSelection(${i})">${dietChoiceOptions(m)}</select></div>${i===1?`<p class="muted meal-note">Se escolher ovos/pão/fruta, não precisa tomar whey junto. Whey só entra quando a opção escolhida tiver whey ou quando você usar para completar proteína.</p>`:""}${dietExtras(i).length?`<div class="mini-flags">${dietExtras(i).map((x,j)=>`<label class="mini-check ${x.type}"><input type="checkbox" class="diet-flag" id="extra-${i}-${j}"><span>${x.item}</span></label>`).join("")}</div>`:""}</div></div>`).join("")}</div><div style="margin-top:12px"><label>Nota rápida</label><textarea id="diet-note" placeholder="Ex.: almocei fora, bati água, apetite baixo..."></textarea></div><div class="actions"><button class="primary" onclick="saveDiet()">Salvar dieta</button></div><p class="muted" style="font-size:12px">O ícone de comida no progresso aparece quando todos os flags da dieta do dia forem marcados: refeições, água e suplementos/rotina prescrita.</p></div>`}
function saveDiet(){let date=today(), flags=collectDietFlags();u().dietLogs.push({id:uid(),date,complete:flags.complete,meals:flags.meals,extras:flags.extras,water:flags.water,schedule:flags.schedule,note:$("diet-note").value});upsertDaily({date,meals:flags.meals,extras:flags.extras,water:flags.water,schedule:flags.schedule,diet:{complete:flags.complete,count:flags.count,total:flags.total}});save()}

function weekShortLabel(phase){
  if(!phase) return "";
  if(phase.includes("Base")) return "Base";
  if(phase.includes("Deload")) return "Deload";
  if(phase.includes("Força")) return "Força";
  if(phase.includes("Intensificação")) return "Intens.";
  if(phase.includes("Consolidação")) return "Consol.";
  return phase.split(" ")[0];
}

function renderCalendar(){let wk=calendarWeek(), cw=calendarWeekNumber(), block=workoutBlockForWeek(cw), list=workoutsForWeek(cw);$("calendar").innerHTML=`${head("Calendário de treinos","Consulta das 12 semanas. Não altera a aba Treino.")}<div class="week-strip week-grid">${PLAN.weeks.map(x=>`<button class="week-chip ${x.week===cw?"active":""}" data-week="${x.week}" onclick="setCalendarWeek(${x.week})"><span class="week-num">S${x.week}</span></button>`).join("")}</div><div class="card"><span class="pill">Semana ${wk.week} • ${wk.phase}</span><p class="muted" style="margin:8px 0 0">${block.name} • ${block.focus}</p><p class="notice">${wk.rule}</p><p class="muted" style="font-size:12px">Esta seleção é apenas para consulta. A aba Treino usa a semana automática baseada nos check-ins.</p></div><div class="calendar-grid" style="margin-top:12px">${Object.entries(list).map(([day,w])=>`<div class="card item"><div><strong>${day}</strong><div class="muted">${w.title}</div></div><ul>${w.exercises.map(e=>`<li>${e.name} — ${e.sets}x${e.reps} ${e.link&&e.link!=="#"?`<a class="video" href="${e.link}" target="_blank">vídeo</a>`:""}</li>`).join("")}</ul></div>`).join("")}</div>`}

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



function normalizeBioNumber(v){
  return String(v||"").replace(",",".");
}
function firstBioMatch(text, patterns){
  const clean=String(text||"").replace(/\s+/g," ");
  for(const p of patterns){
    const m=clean.match(p);
    if(m && m[1]) return normalizeBioNumber(m[1]);
  }
  return "";
}
async function extractPdfText(file){
  if(!window.pdfjsLib) throw new Error("Leitor de PDF não carregado. Atualize a página e tente novamente.");
  pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  const buffer=await file.arrayBuffer();
  const pdf=await pdfjsLib.getDocument({data:buffer}).promise;
  let text="";
  for(let i=1;i<=pdf.numPages;i++){
    const page=await pdf.getPage(i);
    const content=await page.getTextContent();
    text += " " + content.items.map(item=>item.str).join(" ");
  }
  return text;
}
function parseBioimpedanceText(text){
  const clean=String(text||"").replace(/\s+/g," ");
  return {
    weight:firstBioMatch(clean,[
      /(?:peso|weight|massa corporal)[^\d]{0,35}(\d{2,3}(?:[,.]\d+)?)/i,
      /(\d{2,3}(?:[,.]\d+)?)\s*kg(?:\s|$)/i
    ]),
    bodyFat:firstBioMatch(clean,[
      /(?:gordura corporal|percentual de gordura|% gordura|body fat|fat mass percentage)[^\d]{0,45}(\d{1,2}(?:[,.]\d+)?)/i,
      /(\d{1,2}(?:[,.]\d+)?)\s*%\s*(?:gordura|fat)/i
    ]),
    fatMass:firstBioMatch(clean,[
      /(?:massa de gordura|massa gorda|fat mass)[^\d]{0,45}(\d{1,3}(?:[,.]\d+)?)/i
    ]),
    leanMass:firstBioMatch(clean,[
      /(?:massa magra|lean mass|free fat mass|fat free mass)[^\d]{0,45}(\d{1,3}(?:[,.]\d+)?)/i
    ]),
    muscleMass:firstBioMatch(clean,[
      /(?:massa muscular|skeletal muscle mass|m[úu]sculo esquel[eé]tico)[^\d]{0,55}(\d{1,3}(?:[,.]\d+)?)/i
    ]),
    water:firstBioMatch(clean,[
      /(?:[áa]gua corporal total|total body water|tbw)[^\d]{0,55}(\d{1,3}(?:[,.]\d+)?)/i
    ]),
    bmi:firstBioMatch(clean,[
      /(?:imc|bmi)[^\d]{0,30}(\d{1,2}(?:[,.]\d+)?)/i
    ]),
    visceralFat:firstBioMatch(clean,[
      /(?:gordura visceral|visceral fat|visceral)[^\d]{0,45}(\d{1,3}(?:[,.]\d+)?)/i
    ]),
    bmr:firstBioMatch(clean,[
      /(?:taxa metab[oó]lica basal|metabolismo basal|bmr|basal metabolic rate)[^\d]{0,60}(\d{3,5}(?:[,.]\d+)?)/i
    ])
  };
}
function bioValue(v,unit){
  return v ? `${v}${unit?` ${unit}`:""}` : "—";
}
function latestBio(){
  return [...(u().bodyLogs||[])]
    .filter(x=>x.source==="bioimpedance_pdf")
    .sort((a,b)=>b.date.localeCompare(a.date))[0];
}
function bioTrendEntries(){
  return [...(u().bodyLogs||[])]
    .filter(x=>x.source==="bioimpedance_pdf")
    .sort((a,b)=>a.date.localeCompare(b.date));
}
function numVal(v){
  const n=parseFloat(String(v||"").replace(",","."));
  return Number.isFinite(n)?n:null;
}
function fmtDelta(v,unit){
  if(v===null || v===undefined || !Number.isFinite(v)) return "—";
  const sign=v>0?"+":"";
  return `${sign}${v.toFixed(1)} ${unit}`.trim();
}
function sparklineSVG(points){
  const width=320, height=120, padX=14, padY=14;
  const vals=points.map(p=>p.value);
  let min=Math.min(...vals), max=Math.max(...vals);
  if(min===max){ const pad=Math.max(1,Math.abs(min)*0.05); min-=pad; max+=pad; }
  const xStep=(width-padX*2)/Math.max(1, points.length-1);
  const yFor=v => height-padY - ((v-min)/(max-min))*(height-padY*2);
  const coords=points.map((p,i)=>`${(padX+i*xStep).toFixed(1)},${yFor(p.value).toFixed(1)}`);
  const area=`${padX},${height-padY} `+coords.join(" ")+` ${padX+(points.length-1)*xStep},${height-padY}`;
  const circles=points.map((p,i)=>`<circle cx="${(padX+i*xStep).toFixed(1)}" cy="${yFor(p.value).toFixed(1)}" r="3.2"></circle>`).join("");
  return `<svg class="spark" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true"><line x1="${padX}" y1="${height-padY}" x2="${width-padX}" y2="${height-padY}" class="axis"></line><line x1="${padX}" y1="${padY}" x2="${padX}" y2="${height-padY}" class="axis"></line><polyline points="${area}" class="area"></polyline><polyline points="${coords.join(" ")}" class="line"></polyline>${circles}</svg>`;
}
function bioTrendCard(title,key,unit){
  const rows=bioTrendEntries().map(r=>({date:r.date, value:numVal(r[key])})).filter(r=>r.value!==null);
  if(!rows.length){
    return `<div class="trend-card"><div class="trend-head"><strong>${title}</strong><span class="muted">Sem dados</span></div><div class="trend-empty">Importe ao menos 1 PDF com este indicador.</div></div>`;
  }
  const latest=rows[rows.length-1].value;
  const first=rows[0].value;
  const delta=latest-first;
  const subtitle=`${rows.length} medição(ões) • última ${rows[rows.length-1].date}`;
  return `<div class="trend-card"><div class="trend-head"><div><strong>${title}</strong><span>${subtitle}</span></div><div class="trend-value">${latest.toFixed(1)} ${unit}</div></div>${sparklineSVG(rows)}<div class="trend-foot"><span>Inicial: ${first.toFixed(1)} ${unit}</span><span>Variação: ${fmtDelta(delta,unit)}</span></div></div>`;
}
function bioTrendSection(){
  return `<div class="card"><h2>Tendências da bioimpedância</h2><p class="muted">Acompanhe os principais indicadores importados dos PDFs ao longo do tempo.</p><div class="trend-grid">${bioTrendCard("Peso","weight","kg")}${bioTrendCard("Gordura corporal","bodyFat","%")}${bioTrendCard("Massa muscular","muscleMass","kg")}${bioTrendCard("Massa magra","leanMass","kg")}</div></div>`;
}
function bioMeasurementCard(){
  const last=lastBody(), due=daysSince(last)>=15, latest=latestBio();
  return `<div class="card"><h2>Medição quinzenal</h2><p class="${due?"notice":"ok"}">${due?"Medição liberada/pendente.":"Última medição em "+last+". Próxima em aprox. "+(15-daysSince(last))+" dia(s)."}</p><p class="muted">Insira o PDF da bioimpedância. O app tenta ler automaticamente os principais valores e salva na evolução.</p><div><label>Selecionar PDF de bioimpedância</label><input id="bio-pdf-input" type="file" accept="application/pdf"></div><div class="actions"><button class="primary" onclick="handleBioPdfUpload()">Ler e salvar bioimpedância</button></div><p id="bio-pdf-status" class="muted" style="font-size:12px"></p>${latest?`<div class="bio-summary"><div><b>Último PDF</b><span>${latest.date} • ${latest.filename||"bioimpedância"}</span></div><div class="exam-grid"><div class="exam-result"><b>Peso</b><span>${bioValue(latest.weight,"kg")}</span></div><div class="exam-result"><b>Gordura corporal</b><span>${bioValue(latest.bodyFat,"%")}</span></div><div class="exam-result"><b>Massa gorda</b><span>${bioValue(latest.fatMass,"kg")}</span></div><div class="exam-result"><b>Massa magra</b><span>${bioValue(latest.leanMass,"kg")}</span></div><div class="exam-result"><b>Massa muscular</b><span>${bioValue(latest.muscleMass,"kg")}</span></div><div class="exam-result"><b>Água corporal</b><span>${bioValue(latest.water,"L")}</span></div><div class="exam-result"><b>IMC</b><span>${bioValue(latest.bmi,"")}</span></div><div class="exam-result"><b>Gordura visceral</b><span>${bioValue(latest.visceralFat,"")}</span></div><div class="exam-result"><b>Metabolismo basal</b><span>${bioValue(latest.bmr,"kcal")}</span></div></div></div>`:""}</div>`;
}
async function handleBioPdfUpload(){
  const input=$("bio-pdf-input");
  const status=$("bio-pdf-status");
  if(!input || !input.files || !input.files.length){alert("Selecione um PDF primeiro.");return;}
  const file=input.files[0];
  if(status) status.textContent="Lendo PDF de bioimpedância...";
  try{
    const text=await extractPdfText(file);
    const parsed=parseBioimpedanceText(text);
    const hasAny=Object.values(parsed).some(v=>!!v);
    if(!hasAny){
      if(status) status.textContent="PDF lido, mas não encontrei valores de bioimpedância automaticamente.";
      alert("Li o PDF, mas não identifiquei os valores automaticamente. Pode ser PDF escaneado/imagem ou um layout ainda não mapeado.");
      return;
    }
    const date=today();
    const rec={id:uid(),date,source:"bioimpedance_pdf",filename:file.name,size:file.size,...parsed,createdAt:new Date().toISOString()};
    u().bodyLogs.push(rec);
    save();
  }catch(err){
    console.error(err);
    if(status) status.textContent="Erro ao ler PDF: "+err.message;
    alert("Não consegui ler este PDF automaticamente. Se ele for imagem escaneada, precisaremos de OCR em versão separada.");
  }
}


function renderProgress(){$("progress").innerHTML=`${head("Evolução","Calendário mensal de constância, bioimpedância e histórico.")}<div class="grid three"><div class="card kpi"><div class="label">Peso</div><div class="value">${latestWeight()?latestWeight().toFixed(1):"—"} kg</div><div class="hint">última bio/medição</div></div><div class="card kpi"><div class="label">Progresso</div><div class="value">${pct()}%</div><div class="progress"><span style="width:${pct()}%"></span></div></div><div class="card kpi"><div class="label">Última medição</div><div class="value" style="font-size:18px">${lastBody()||"—"}</div><div class="hint">15 dias</div></div></div><div class="card"><h2>Calendário de progresso</h2>${progressCalendarHTML()}</div>${bioMeasurementCard()}${bioTrendSection()}<div class="card"><h2>Histórico</h2><div class="list">${history()}</div></div>`}

function history(){let rows=[...u().dailyLogs].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,10), bios=bioTrendEntries().slice(-6).reverse();let daily=rows.length?rows.map(r=>`<div class="history"><h3>${r.date} • ${r.day||"-"}</h3><p>Exercícios: ${(r.exercises||[]).filter(e=>e.done).length}/${(r.exercises||[]).length} • Dieta: ${r.diet?.complete?"completa":`${r.diet?.count??(r.meals||[]).filter(m=>m.done).length}/${r.diet?.total??(r.meals||[]).length}`}</p></div>`).join(""):`<p class="muted">Nenhum check-in.</p>`;let bio=bios.length?`<h3>Bioimpedâncias</h3>`+bios.map(b=>`<div class="history"><h3>${b.date} • ${b.filename||"PDF"}</h3><p>Peso: ${bioValue(b.weight,"kg")} • Gordura: ${bioValue(b.bodyFat,"%")} • Massa muscular: ${bioValue(b.muscleMass,"kg")}</p></div>`).join(""):"";return daily+bio}

function renderMore(){$("more").innerHTML=`${head("Mais","Perfis, exames recomendados e backup.")}<div class="card"><h2>Perfis</h2><div class="form-grid"><div><label>Perfil ativo</label><select onchange="switchProfile(this.value)">${Object.entries(PLAN.profiles).map(([k,p])=>`<option value="${k}" ${state.profile===k?"selected":""}>${p.name}</option>`).join("")}</select></div><div><label>Treino detectado</label><input readonly value="${activeDay()}"></div></div></div><div class="card"><h2>Exames recomendados</h2><div class="list">${PLAN.exams.map(e=>`<div class="item"><strong>${e.group}</strong><span>${e.name} • ${e.frequency}</span></div>`).join("")}</div></div><div class="card"><h2>Backup</h2><div class="actions"><button class="primary" onclick="exportBackup()">Exportar JSON</button><button class="danger" onclick="resetAll()">Apagar tudo</button></div></div>`}
function exportBackup(){let b=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=`sheipados_backup_${today()}.json`;a.click()}
function resetAll(){if(confirm("Apagar dados locais?")){localStorage.removeItem(KEY);state={profile:"rogerio",users:{rogerio:{...u(),dailyLogs:[],bodyLogs:[],workoutLogs:[],dietLogs:[]},fernanda:{...u(),dailyLogs:[],bodyLogs:[],workoutLogs:[],dietLogs:[]}}};location.reload()}}
async function showNotify(t,b){if(!("Notification"in window))return alert("Sem suporte a notificações.");if(Notification.permission!=="granted")return;try{let reg=await navigator.serviceWorker.ready;reg.showNotification(t,{body:b,icon:"./icon-192.png?v=14"})}catch(e){new Notification(t,{body:b})}}
async function enableReminders(){if(!("Notification"in window))return alert("Sem suporte a notificações.");let p=await Notification.requestPermission();if(p!=="granted")return alert("Permissão negada.");u().settings.reminders=true;localStorage.setItem(KEY,JSON.stringify(state));scheduleReminders();alert("Lembretes ativados.")}
function disableReminders(){u().settings.reminders=false;localStorage.setItem(KEY,JSON.stringify(state));timers.forEach(clearTimeout);timers=[];render()}
function testNotification(){showNotify("Sheipados","Teste de alerta funcionando.")}
function scheduleReminders(){timers.forEach(clearTimeout);timers=[];if(!u().settings.reminders||!("Notification"in window)||Notification.permission!=="granted")return;let now=new Date();PLAN.schedule.forEach(s=>{if(s.weekly&&now.getDay()!==0)return;let [h,m]=s.hhmm.split(":").map(Number),target=new Date();target.setHours(h,m,0,0);let delay=target-now;if(delay>0&&delay<86400000)timers.push(setTimeout(()=>showNotify("Sheipados",`${s.time} • ${s.item}. ${s.note}`),delay))})}

function safeRender(sectionId, fn){
  try{fn()}
  catch(err){
    console.error("Erro ao renderizar", sectionId, err);
    const el=$(sectionId);
    if(el) el.innerHTML=`${head("Erro ao carregar","Esta aba teve um erro de renderização.")}<div class="card"><p class="notice">${err?.message||err}</p></div>`;
  }
}

function render(forceTab){shell();safeRender("train",renderTrain);safeRender("diet",renderDiet);safeRender("calendar",renderCalendar);safeRender("progress",renderProgress);safeRender("more",renderMore);let h=forceTab||location.hash.replace("#","")||"train";openTab(tabs.some(t=>t[0]===h)?h:"train")}
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));render();
