
const PLAN = window.PLAN_DATA;
const STORE_KEY = "sheipados_v4";

const tabs = [
  ["today","Hoje","✅"],
  ["calendar","Calendário","📅"],
  ["progress","Evolução","📈"],
  ["more","Mais","⚙️"]
];

let reminderTimers = [];

function todayISO(){ const d=new Date(); d.setMinutes(d.getMinutes()-d.getTimezoneOffset()); return d.toISOString().slice(0,10); }
function uid(){ return crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random(); }
function dayName(){
  const map=["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];
  const d=map[new Date().getDay()];
  return d==="Sábado" || d==="Domingo" ? "Sábado/Domingo" : d;
}
function blankUser(){ return {selectedWeek:1, dayOverrideDate:null, dayOverride:null, workoutLogs:[], bodyLogs:[], dietLogs:[], supplementLogs:[], dailyLogs:[], settings:{remindersEnabled:false}}; }
function blank(){
  return {currentProfile:"rogerio", users:{rogerio:blankUser(), fernanda:blankUser()}};
}
function load(){
  try{
    const raw=localStorage.getItem(STORE_KEY);
    if(!raw) return blank();
    const parsed=JSON.parse(raw);
    return { ...blank(), ...parsed, users:{rogerio:{...blankUser(), ...(parsed.users?.rogerio||{})}, fernanda:{...blankUser(), ...(parsed.users?.fernanda||{})}} };
  }catch(e){ return blank(); }
}
let state=load();

function save(){ localStorage.setItem(STORE_KEY, JSON.stringify(state)); render(); scheduleReminders(); }
function $(id){ return document.getElementById(id); }
function num(v){ const x=Number(v); return Number.isFinite(x)?x:0; }
function user(){ return state.users[state.currentProfile]; }
function profile(){ return PLAN.profiles[state.currentProfile]; }
function workouts(){ return profile().workouts; }
function activeDay(){
  const u=user();
  if(u.dayOverrideDate===todayISO() && u.dayOverride) return u.dayOverride;
  return dayName();
}
function currentWeek(){ return PLAN.weeks.find(w=>w.week===user().selectedWeek)||PLAN.weeks[0]; }
function currentWorkout(){ return workouts()[activeDay()]||workouts()["Segunda"]; }
function latestWeight(){
  const logs=[...user().bodyLogs].filter(x=>x.weight).sort((a,b)=>a.date.localeCompare(b.date));
  const initial=profile().initialWeight;
  return logs.length ? num(logs.at(-1).weight) : (initial ? num(initial) : 0);
}
function lastBodyDate(){
  const logs=[...user().bodyLogs].filter(x=>x.weight || x.waist).sort((a,b)=>a.date.localeCompare(b.date));
  return logs.length ? logs.at(-1).date : null;
}
function daysSince(dateStr){ if(!dateStr) return 999; const d1=new Date(dateStr+"T00:00:00"), d2=new Date(todayISO()+"T00:00:00"); return Math.floor((d2-d1)/(1000*60*60*24)); }
function progressPct(){
  const p=profile(); if(!p.initialWeight || !p.targetWeight) return 0;
  const pct=(latestWeight()-num(p.initialWeight))/(num(p.targetWeight)-num(p.initialWeight))*100;
  return Math.max(0,Math.min(100,Math.round(pct)));
}
function feedback(){
  const logs=[...user().bodyLogs].filter(x=>x.weight).sort((a,b)=>a.date.localeCompare(b.date));
  if(logs.length<2) return "Medição quinzenal: registre peso e cintura a cada 15 dias.";
  const diff=num(logs.at(-1).weight)-num(logs.at(-2).weight);
  if(diff<0.1) return "Peso quase não subiu entre medições: revise calorias, proteína e apetite.";
  if(diff>1.2) return "Peso subiu rápido em 15 dias: confira cintura/fotos para evitar ganho de gordura.";
  return "Ritmo bom. Mantenha dieta, progressão de carga e sono.";
}
function openTab(id){
  document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));
  document.querySelectorAll(".nav button").forEach(b=>b.classList.remove("active"));
  $(id).classList.add("active");
  document.querySelector(`[data-tab="${id}"]`).classList.add("active");
  history.replaceState(null,"","#"+id);
}
function switchProfile(v){ state.currentProfile=v; save(); }
function shell(){
  const p=profile();
  document.getElementById("app").innerHTML=`
    <div class="shell">
      <header class="topbar">
        <div class="title-row">
          <div style="display:flex;gap:12px;align-items:center">
            <div class="logo">SH</div>
            <div><h1>${PLAN.project.name}</h1><div class="sub">${p.name} • ${p.goal || "Plano a configurar"}</div></div>
          </div>
          <select class="profile-select" onchange="switchProfile(this.value)">
            ${Object.entries(PLAN.profiles).map(([k,pf])=>`<option value="${k}" ${state.currentProfile===k?"selected":""}>${pf.name}</option>`).join("")}
          </select>
        </div>
      </header>
      <nav class="nav">${tabs.map(t=>`<button data-tab="${t[0]}" onclick="openTab('${t[0]}')"><span class="ico">${t[2]}</span><span>${t[1]}</span></button>`).join("")}</nav>
      ${tabs.map(t=>`<section class="section" id="${t[0]}"></section>`).join("")}
    </div>`;
}
function pageHead(title,sub){ return `<div class="page-head"><div><h2>${title}</h2><p>${sub||""}</p></div></div>`; }
function input(id,label,type="text",placeholder="",value=""){ return `<div><label>${label}</label><input id="${id}" type="${type}" placeholder="${placeholder}" value="${value}"></div>`; }
function select(id,label,options,value=""){ return `<div><label>${label}</label><select id="${id}">${options.map(o=>`<option ${o===value?"selected":""}>${o}</option>`).join("")}</select></div>`; }

function renderToday(){
  const p=profile(), u=user(), w=currentWeek(), workout=currentWorkout(), day=activeDay(), lastDate=lastBodyDate(), due=daysSince(lastDate)>=15;
  $("today").innerHTML=`
    ${pageHead("Hoje",`Treino detectado automaticamente: ${day}.`)}
    <div class="grid three">
      <div class="card kpi"><div class="label">Peso atual</div><div class="value">${latestWeight() ? latestWeight().toFixed(1) : "—"} kg</div><div class="hint">meta ${p.targetWeight || "—"} kg</div></div>
      <div class="card kpi"><div class="label">Progresso</div><div class="value">${progressPct()}%</div><div class="progress"><span style="width:${progressPct()}%"></span></div></div>
      <div class="card kpi"><div class="label">Água</div><div class="value">${p.waterTarget || "—"}L</div><div class="hint">meta diária</div></div>
    </div>

    <div class="card">
      <div class="pill">Semana ${u.selectedWeek} • ${w.phase}</div>
      <h2 style="margin-top:12px">${day}: ${workout.title}</h2>
      <p class="notice"><b>Regra:</b> ${w.rule}</p>
      <details class="details">
        <summary>Trocar dia manualmente só hoje</summary>
        <div class="form-grid">
          <div><label>Semana</label><select onchange="user().selectedWeek=Number(this.value); save()">${PLAN.weeks.map(x=>`<option value="${x.week}" ${x.week===u.selectedWeek?"selected":""}>Semana ${x.week}</option>`).join("")}</select></div>
          <div><label>Dia</label><select onchange="user().dayOverrideDate='${todayISO()}'; user().dayOverride=this.value; save()">${Object.keys(workouts()).map(d=>`<option ${d===day?"selected":""}>${d}</option>`).join("")}</select></div>
        </div>
      </details>
      <h3>Exercícios executados</h3>
      <div class="meal-list">
        ${workout.exercises.map((e,i)=>`
          <label class="big-check">
            <input type="checkbox" id="ex-${i}">
            <div><strong>${e.name}</strong><span>${e.sets}x${e.reps} • RPE ${e.rpe}</span></div>
          </label>`).join("")}
      </div>
    </div>

    <div class="card">
      <h2>Dieta do dia</h2>
      <div class="meal-list">
        ${PLAN.meals.map((m,i)=>`
          <label class="big-check">
            <input type="checkbox" id="meal-${i}">
            <div><strong>${m.time} • ${m.name}</strong><span>${m.short}</span></div>
          </label>`).join("")}
      </div>
      <h3>Água</h3>
      <div class="meal-list">
        ${["Manhã — 1,0 L","Tarde — 1,0 L","Treino/noite — 1,0 L","Completar restante — 0,5 L"].map((w,i)=>`
          <label class="big-check"><input type="checkbox" id="water-${i}"><div><strong>${w}</strong><span>Meta diária: aproximadamente ${p.waterTarget || "—"} L.</span></div></label>`).join("")}
      </div>
    </div>

    <div class="card">
      <h2>Rotina e lembretes</h2>
      <div class="meal-list">
        ${PLAN.schedule.map((s,i)=>`
          <label class="big-check">
            <input type="checkbox" id="sched-${i}">
            <div><strong>${s.time} • ${s.item}</strong><span>${s.note}</span></div>
          </label>`).join("")}
      </div>
      <div class="actions"><button class="ghost" onclick="enableReminders()">Ativar lembretes neste aparelho</button></div>
      <p class="notice" style="margin-top:12px"><b>Observação:</b> os lembretes simples funcionam melhor com o app aberto/recente. Alerta confiável com app fechado exige Web Push com servidor.</p>
    </div>

    <div class="card">
      <h2>Medição quinzenal</h2>
      <p class="${due ? "notice" : "ok"}">${due ? "Medição pendente ou liberada. Registre peso/cintura se hoje for o dia." : `Última medição em ${lastDate}. Próxima em aproximadamente ${15-daysSince(lastDate)} dia(s).`}</p>
      <details class="details" ${due ? "open" : ""}>
        <summary>Registrar peso/cintura</summary>
        <div class="form-grid">
          ${input("ck-weight","Peso kg","number","ex.: 76.4")}
          ${input("ck-waist","Cintura cm","number","ex.: 82")}
          ${input("ck-arm","Braço cm","number","opcional")}
          ${input("ck-thigh","Coxa cm","number","opcional")}
        </div>
      </details>
      <div class="form-grid" style="margin-top:12px">
        ${input("ck-date","Data","date","",todayISO())}
        ${input("ck-sleep","Sono h","number","ex.: 7.5")}
        ${select("ck-appetite","Apetite",["Bom","Normal","Baixo","Muito baixo"],"Normal")}
        ${select("ck-gi","Digestão/GI",["Normal","Constipado","Náusea","Refluxo","Diarreia"],"Normal")}
      </div>
      <div style="margin-top:12px"><label>Nota rápida</label><textarea id="ck-note" placeholder="Ex.: apetite baixo, fiz shake extra, treino rendeu bem..."></textarea></div>
      <div class="actions"><button class="primary" onclick="saveDaily()">Salvar dia</button></div>
    </div>

    <div class="card">
      <h2>Resumo visual da dieta</h2>
      <div class="meal-list">
        ${PLAN.meals.map(m=>`
          <details class="day-card">
            <summary><strong>${m.time} • ${m.name}</strong> <span class="pill">${m.protein}g prot.</span></summary>
            <div class="muted" style="margin-top:8px">${m.short}</div>
            <ul class="alt-list">${m.alternatives.map(a=>`<li>${a}</li>`).join("")}</ul>
          </details>`).join("")}
      </div>
    </div>`;
}
function saveDaily(){
  const date=$("ck-date").value||todayISO(), workout=currentWorkout(), day=activeDay(), u=user();
  const exercises=workout.exercises.map((e,i)=>({name:e.name,done:$(`ex-${i}`)?.checked||false}));
  const meals=PLAN.meals.map((m,i)=>({id:m.id,name:m.name,done:$(`meal-${i}`)?.checked||false}));
  const water=[0,1,2,3].map(i=>({item:i,done:$(`water-${i}`)?.checked||false}));
  const schedule=PLAN.schedule.map((s,i)=>({item:s.item,time:s.time,done:$(`sched-${i}`)?.checked||false}));
  const daily={id:uid(),date,week:u.selectedWeek,day,workoutTitle:workout.title,exercises,meals,water,schedule,weight:$("ck-weight")?.value||"",waist:$("ck-waist")?.value||"",arm:$("ck-arm")?.value||"",thigh:$("ck-thigh")?.value||"",sleep:$("ck-sleep").value,appetite:$("ck-appetite").value,gi:$("ck-gi").value,note:$("ck-note").value};
  u.dailyLogs=u.dailyLogs.filter(x=>x.date!==date);
  u.dailyLogs.push(daily);
  u.workoutLogs.push({id:uid(),date,week:u.selectedWeek,day,title:workout.title,done:exercises.some(e=>e.done),note:"Checklist de exercícios pelo Hoje.",exercises});
  u.dietLogs.push({id:uid(),date,type:"Check-in",meals,water,appetite:daily.appetite,note:daily.note});
  if(daily.weight || daily.waist || daily.arm || daily.thigh){
    u.bodyLogs.push({id:uid(),date,weight:daily.weight,waist:daily.waist,arm:daily.arm,thigh:daily.thigh,sleep:daily.sleep,appetite:daily.appetite,digestion:daily.gi,note:daily.note});
  }
  u.supplementLogs.push({id:uid(),date,schedule,appetite:daily.appetite,gi:daily.gi,note:daily.note});
  save();
}

function renderCalendar(){
  const u=user(), w=currentWeek();
  $("calendar").innerHTML=`
    ${pageHead("Calendário de treinos","Periodização de 12 semanas.")}
    <div class="week-strip">${PLAN.weeks.map(x=>`<button class="${x.week===u.selectedWeek?"active":""}" onclick="user().selectedWeek=${x.week}; save()">S${x.week}<br><span style="font-size:10px">${x.phase.split(" ")[0]}</span></button>`).join("")}</div>
    <div class="card">
      <div class="pill">Semana ${w.week} • ${w.phase}</div>
      <h2 style="margin-top:12px">${w.focus}</h2>
      <p class="notice">${w.rule}</p>
    </div>
    <div class="calendar-grid" style="margin-top:12px">
      ${Object.entries(workouts()).map(([day,wo])=>`
        <div class="card day-card">
          <div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start">
            <div><strong>${day}</strong><div class="muted">${wo.title}</div></div>
            <button class="ghost" onclick="user().dayOverrideDate='${todayISO()}'; user().dayOverride='${day}'; save(); openTab('today')">Usar hoje</button>
          </div>
          <ul>${wo.exercises.slice(0,6).map(e=>`<li>${e.name} — ${e.sets}x${e.reps}</li>`).join("")}</ul>
        </div>`).join("")}
    </div>`;
}

function renderProgress(){
  const u=user();
  $("progress").innerHTML=`
    ${pageHead("Evolução","Medições a cada 15 dias.")}
    <div class="grid three">
      <div class="card kpi"><div class="label">Peso atual</div><div class="value">${latestWeight() ? latestWeight().toFixed(1) : "—"} kg</div><div class="hint">inicial ${profile().initialWeight || "—"} kg</div></div>
      <div class="card kpi"><div class="label">Progresso</div><div class="value">${progressPct()}%</div><div class="progress"><span style="width:${progressPct()}%"></span></div></div>
      <div class="card kpi"><div class="label">Última medição</div><div class="value" style="font-size:18px">${lastBodyDate()||"—"}</div><div class="hint">intervalo alvo: 15 dias</div></div>
    </div>
    <div class="card"><h2>Tendência</h2><p class="notice">${feedback()}</p><div class="chart"><canvas id="weight-chart"></canvas></div></div>
    <div class="card"><h2>Histórico de check-ins</h2><div class="compact-list">${dailyHistory()}</div></div>`;
  setTimeout(drawWeight,50);
}
function dailyHistory(){
  const rows=[...user().dailyLogs].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,12);
  if(!rows.length) return `<p class="muted">Nenhum check-in salvo ainda.</p>`;
  return rows.map(r=>`<div class="history"><h3>${r.date} • ${r.day}</h3><p>Exercícios: ${r.exercises.filter(e=>e.done).length}/${r.exercises.length} • Refeições: ${r.meals.filter(m=>m.done).length}/${r.meals.length} • Água: ${r.water.filter(w=>w.done).length}/4</p><p>Peso: ${r.weight||"-"} kg • Cintura: ${r.waist||"-"} cm • Sono: ${r.sleep||"-"} h</p><p>${r.note||""}</p><div class="actions"><button class="danger" onclick="deleteItem('dailyLogs','${r.id}')">Excluir</button></div></div>`).join("");
}

function renderMore(){
  const u=user();
  $("more").innerHTML=`
    ${pageHead("Mais","Perfis, lembretes, exames e backup.")}
    <div class="card">
      <h2>Perfis</h2>
      <p class="muted">Os dados de Rogério e Fernanda ficam separados neste aparelho. Isto ainda não é login com senha/sincronização em nuvem.</p>
      <div class="form-grid">
        <div><label>Perfil ativo</label><select onchange="switchProfile(this.value)">${Object.entries(PLAN.profiles).map(([k,p])=>`<option value="${k}" ${state.currentProfile===k?"selected":""}>${p.name}</option>`).join("")}</select></div>
        <div><label>Treino de hoje</label><input readonly value="${activeDay()}"></div>
      </div>
    </div>
    <div class="card">
      <h2>Lembretes</h2>
      <p class="notice">Lembretes simples dependem do navegador/PWA. Para notificações confiáveis com app fechado, será preciso Web Push com servidor.</p>
      <div class="actions">
        <button class="primary" onclick="enableReminders()">Ativar lembretes</button>
        <button class="ghost" onclick="testNotification()">Testar alerta</button>
        <button class="danger" onclick="disableReminders()">Desativar</button>
      </div>
      <p class="muted">Status: ${u.settings.remindersEnabled ? "ativado neste perfil/aparelho" : "desativado"}</p>
    </div>
    <div class="card"><h2>Horários e rotina</h2><div class="compact-list">${PLAN.schedule.map(s=>`<div class="day-card"><strong>${s.time} • ${s.item}</strong><div class="muted">${s.note}</div></div>`).join("")}</div></div>
    <div class="card"><h2>Suplementos — referência</h2><div class="compact-list">${PLAN.supplements.map(s=>`<div class="day-card"><strong>${s.name}</strong><div class="muted">${s.priority} • ${s.decision}</div></div>`).join("")}</div></div>
    <div class="card"><h2>Exames</h2><div class="compact-list">${PLAN.exams.map(e=>`<div class="day-card"><strong>${e.group}</strong><div>${e.name}</div><div class="muted">${e.frequency}</div></div>`).join("")}</div></div>
    <div class="card"><h2>Backup</h2><p class="notice">Os dados ficam neste navegador/dispositivo. Faça backup JSON toda semana.</p><div class="actions"><button class="primary" onclick="exportBackup()">Exportar JSON</button><button class="ghost" onclick="exportCSV('dailyLogs')">CSV check-ins</button><button class="danger" onclick="resetAll()">Apagar tudo</button></div><div style="margin-top:12px"><label>Importar backup JSON</label><input type="file" id="backup-file" accept="application/json"></div><div class="actions"><button class="ghost" onclick="importBackup()">Importar backup</button></div></div>`;
}

function deleteItem(list,id){ if(!confirm("Excluir este registro?")) return; user()[list]=user()[list].filter(x=>x.id!==id); save(); }
function exportBackup(){ const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`sheipados_backup_${todayISO()}.json`; a.click(); }
function flatten(obj,prefix="",out={}){ Object.entries(obj).forEach(([k,v])=>{ const key=prefix?`${prefix}.${k}`:k; if(v&&typeof v==="object"&&!Array.isArray(v)) flatten(v,key,out); else out[key]=Array.isArray(v)?JSON.stringify(v):v; }); return out; }
function exportCSV(list){ const arr=user()[list]||[]; if(!arr.length){alert("Sem dados para exportar.");return;} const rows=arr.map(x=>flatten(x)); const headers=[...new Set(rows.flatMap(r=>Object.keys(r)))]; const esc=v=>`"${String(v??"").replaceAll('"','""')}"`; const csv=[headers.join(","),...rows.map(r=>headers.map(h=>esc(r[h])).join(","))].join("\n"); const blob=new Blob([csv],{type:"text/csv;charset=utf-8"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`${state.currentProfile}_${list}_${todayISO()}.csv`; a.click(); }
function importBackup(){ const file=$("backup-file")?.files?.[0]; if(!file){alert("Selecione um arquivo JSON.");return;} if(!confirm("Isso substituirá os dados atuais deste navegador. Continuar?")) return; const reader=new FileReader(); reader.onload=e=>{try{state={...blank(),...JSON.parse(e.target.result)};localStorage.setItem(STORE_KEY, JSON.stringify(state));render();alert("Backup importado.");}catch(err){alert("Arquivo inválido.");}}; reader.readAsText(file); }
function resetAll(){ if(!confirm("Apagar todos os dados locais? Faça backup antes.")) return; localStorage.removeItem(STORE_KEY); state=blank(); render(); }

async function showNotify(title, body){
  if(!("Notification" in window)) return alert("Notificações não suportadas neste navegador.");
  if(Notification.permission !== "granted") return;
  try{
    if(navigator.serviceWorker && navigator.serviceWorker.ready){
      const reg = await navigator.serviceWorker.ready;
      reg.showNotification(title, {body, icon:"./icons/icon-192.svg", badge:"./icons/icon-192.svg"});
    } else {
      new Notification(title, {body});
    }
  }catch(e){ try{ new Notification(title, {body}); }catch(_){} }
}
async function enableReminders(){
  if(!("Notification" in window)){ alert("Este navegador não suporta notificações."); return; }
  const permission = await Notification.requestPermission();
  if(permission !== "granted"){ alert("Permissão de notificação não concedida."); return; }
  user().settings.remindersEnabled = true;
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
  scheduleReminders();
  alert("Lembretes ativados neste aparelho.");
}
function disableReminders(){
  user().settings.remindersEnabled = false;
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
  clearReminderTimers();
  render();
}
function testNotification(){ showNotify("Sheipados", "Teste de lembrete funcionando neste aparelho."); }
function clearReminderTimers(){ reminderTimers.forEach(t=>clearTimeout(t)); reminderTimers=[]; }
function scheduleReminders(){
  clearReminderTimers();
  if(!user().settings.remindersEnabled || !("Notification" in window) || Notification.permission !== "granted") return;
  const now = new Date();
  PLAN.schedule.forEach(item=>{
    if(item.type === "medication_weekly" && now.getDay() !== 0) return;
    if(!item.hhmm || !item.hhmm.includes(":")) return;
    const [h,m] = item.hhmm.split(":").map(Number);
    const target = new Date();
    target.setHours(h,m,0,0);
    const delay = target.getTime() - now.getTime();
    if(delay > 0 && delay < 24*60*60*1000){
      const timer = setTimeout(()=>showNotify("Sheipados", `${item.time} • ${item.item}. ${item.note}`), delay);
      reminderTimers.push(timer);
    }
  });
}

function drawLine(canvas,values,label){ if(!canvas)return; const ctx=canvas.getContext("2d"),dpr=window.devicePixelRatio||1,W=canvas.clientWidth,H=canvas.clientHeight; canvas.width=W*dpr; canvas.height=H*dpr; ctx.scale(dpr,dpr); ctx.clearRect(0,0,W,H); const p=28; ctx.strokeStyle="#2a3650"; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(p,H-p); ctx.lineTo(W-p,H-p); ctx.lineTo(W-p,p); ctx.stroke(); if(!values.length){ctx.fillStyle="#96a6bb";ctx.fillText("Sem dados ainda",p,H/2);return;} const min=Math.min(...values),max=Math.max(...values),span=max-min||1; const pts=values.map((v,i)=>[p+i*((W-2*p)/Math.max(1,values.length-1)),H-p-((v-min)/span)*(H-2*p)]); ctx.strokeStyle="#70a7ff"; ctx.lineWidth=3; ctx.beginPath(); pts.forEach((pt,i)=>i?ctx.lineTo(pt[0],pt[1]):ctx.moveTo(pt[0],pt[1])); ctx.stroke(); ctx.fillStyle="#4ade80"; pts.forEach(pt=>{ctx.beginPath();ctx.arc(pt[0],pt[1],4,0,Math.PI*2);ctx.fill();}); ctx.fillStyle="#e8f0ff"; ctx.font="12px system-ui"; ctx.fillText(`${label}: ${values.at(-1)}`,p,18); }
function drawWeight(){ const vals=[...user().bodyLogs].filter(x=>x.weight).sort((a,b)=>a.date.localeCompare(b.date)).slice(-12).map(x=>num(x.weight)); drawLine($("weight-chart"),vals,"Peso kg"); }
function render(){ shell(); renderToday(); renderCalendar(); renderProgress(); renderMore(); const hash=location.hash?.replace("#","")||"today"; openTab(tabs.some(t=>t[0]===hash)?hash:"today"); }
if("serviceWorker" in navigator){ window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{})); }
render();
scheduleReminders();
