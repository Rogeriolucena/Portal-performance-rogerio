
const PLAN = window.PLAN_DATA;
const STORE_KEY = "portal_performance_rogerio_v1";

const tabs = [
  ["dashboard","Painel","🏠"],
  ["calendar","Treino","📅"],
  ["log","Registrar","✍️"],
  ["body","Corpo","📈"],
  ["nutrition","Dieta","🍽️"],
  ["more","Mais","⚙️"]
];

function today(){
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0,10);
}
function uid(){ return crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random(); }
function blankState(){
  return {
    profile: PLAN.profile,
    selectedWeek: 1,
    selectedDay: "Segunda",
    workoutLogs: [],
    bodyLogs: [],
    dietLogs: [],
    supplementLogs: [],
    examLogs: []
  }
}
function load(){
  try{
    const raw = localStorage.getItem(STORE_KEY);
    if(!raw) return blankState();
    return {...blankState(), ...JSON.parse(raw)};
  }catch(e){ return blankState(); }
}
let state = load();
function persist(){
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
  render();
}
function $(sel){ return document.querySelector(sel); }
function el(id){ return document.getElementById(id); }
function n(v){ const x = Number(v); return Number.isFinite(x) ? x : 0; }
function latestWeight(){
  const logs = [...state.bodyLogs].filter(x=>x.weight).sort((a,b)=>a.date.localeCompare(b.date));
  return logs.length ? n(logs.at(-1).weight) : state.profile.initialWeight;
}
function progress(){
  const p = (latestWeight() - state.profile.initialWeight) / (state.profile.targetWeight - state.profile.initialWeight) * 100;
  return Math.max(0, Math.min(100, Math.round(p)));
}
function feedback(){
  const logs = [...state.bodyLogs].filter(x=>x.weight).sort((a,b)=>a.date.localeCompare(b.date));
  if(logs.length < 2) return "Registre peso e cintura semanalmente para gerar tendência.";
  const d = n(logs.at(-1).weight) - n(logs.at(-2).weight);
  if(d < 0.1) return "Peso praticamente não subiu. Revise ingestão calórica, proteína e impacto da retatrutida no apetite.";
  if(d > 0.6) return "Peso subiu rápido. Confira cintura, fotos e qualidade visual para evitar ganho de gordura desnecessário.";
  return "Ritmo bom. Continue progredindo cargas e mantendo dieta.";
}
function week(){ return PLAN.weeks.find(w=>w.week === state.selectedWeek) || PLAN.weeks[0]; }
function workout(day=state.selectedDay){ return PLAN.workouts[day]; }
function sectionTitle(title, sub){
  return `<div class="section-title"><div><h2>${title}</h2><p>${sub || ""}</p></div></div>`;
}
function inputBlock(id,label,type="text",value="",placeholder=""){
  return `<div><label for="${id}">${label}</label><input id="${id}" type="${type}" value="${value}" placeholder="${placeholder}"></div>`;
}
function selectBlock(id,label,options,value=""){
  return `<div><label for="${id}">${label}</label><select id="${id}">${options.map(o=>`<option ${o===value?"selected":""}>${o}</option>`).join("")}</select></div>`;
}
function renderShell(){
  const app = $("#app");
  app.innerHTML = `
    <div class="app-shell">
      <header class="topbar">
        <div class="top-title">
          <div style="display:flex;gap:12px;align-items:center">
            <div class="logo">80</div>
            <div>
              <h1>Portal Performance</h1>
              <div class="subtitle">80 kg seco — ${state.profile.name}</div>
            </div>
          </div>
          <button class="ghost" onclick="exportBackup()">Backup</button>
        </div>
      </header>
      <nav class="nav">${tabs.map(t=>`<button data-tab="${t[0]}" onclick="openTab('${t[0]}')"><span class="ico">${t[2]}</span><span>${t[1]}</span></button>`).join("")}</nav>
      ${tabs.map(t=>`<section class="section" id="${t[0]}"></section>`).join("")}
    </div>
  `;
}
function openTab(id){
  document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));
  document.querySelectorAll(".nav button").forEach(b=>b.classList.remove("active"));
  el(id).classList.add("active");
  document.querySelector(`.nav button[data-tab="${id}"]`).classList.add("active");
  history.replaceState(null,"","#"+id);
}
function renderDashboard(){
  const p = state.profile;
  const wt = latestWeight();
  const doneWeek = state.workoutLogs.filter(l=>l.week===state.selectedWeek && l.done).length;
  const bodyLast = [...state.bodyLogs].sort((a,b)=>b.date.localeCompare(a.date))[0];
  el("dashboard").innerHTML = `
    ${sectionTitle("Painel", "Acompanhamento geral do ciclo de 12 semanas.")}
    <div class="grid four">
      <div class="card kpi"><div class="label">Peso atual</div><div class="value">${wt.toFixed(1)} kg</div><div class="small">Inicial: ${p.initialWeight} kg</div></div>
      <div class="card kpi"><div class="label">Meta</div><div class="value">${p.targetWeight} kg</div><div class="small">Controle de cintura e fotos</div></div>
      <div class="card kpi"><div class="label">Progresso</div><div class="value">${progress()}%</div><div class="progress"><span style="width:${progress()}%"></span></div></div>
      <div class="card kpi"><div class="label">Treinos da semana</div><div class="value">${doneWeek}/6</div><div class="small">Registros concluídos</div></div>
    </div>
    <div class="grid two" style="margin-top:12px">
      <div class="card">
        <div class="pill">Semana ${state.selectedWeek} • ${week().phase}</div>
        <h2 style="margin:12px 0 4px">${week().focus}</h2>
        <p class="warning"><b>Regra:</b> ${week().rule}</p>
        <p class="success"><b>Feedback:</b> ${feedback()}</p>
        <div class="actions">
          <button class="primary" onclick="openTab('log')">Registrar treino</button>
          <button class="ghost" onclick="openTab('body')">Registrar peso</button>
        </div>
      </div>
      <div class="card">
        <h2>Hoje/selecionado</h2>
        <div class="form-grid">
          <div><label>Semana</label><select onchange="state.selectedWeek=Number(this.value); persist()">${PLAN.weeks.map(w=>`<option value="${w.week}" ${w.week===state.selectedWeek?"selected":""}>Semana ${w.week}</option>`).join("")}</select></div>
          <div><label>Dia</label><select onchange="state.selectedDay=this.value; persist()">${Object.keys(PLAN.workouts).map(d=>`<option ${d===state.selectedDay?"selected":""}>${d}</option>`).join("")}</select></div>
        </div>
        <h3>${workout().title}</h3>
        <div class="list">${workout().exercises.slice(0,4).map(e=>`<div class="checkbox-row"><span>🏋️</span><div><b>${e.name}</b><br><span class="muted">${e.sets}x${e.reps} • RPE ${e.rpe}</span></div></div>`).join("")}</div>
      </div>
    </div>
    <div class="grid two" style="margin-top:12px">
      <div class="card"><h2>Evolução do peso</h2><div class="chart"><canvas id="weightChart"></canvas></div></div>
      <div class="card"><h2>Última medida</h2>
        ${bodyLast ? `<p><span class="pill">${bodyLast.date}</span></p><p>Peso: <b>${bodyLast.weight || "-"} kg</b></p><p>Cintura: <b>${bodyLast.waist || "-"} cm</b></p><p>Sono: <b>${bodyLast.sleep || "-"} h</b></p>` : `<p class="muted">Nenhuma medida registrada ainda.</p>`}
      </div>
    </div>
  `;
  setTimeout(drawWeightChart, 50);
}
function renderCalendar(){
  el("calendar").innerHTML = `
    ${sectionTitle("Calendário de treino", "Visualização da periodização em 12 semanas.")}
    <div class="week-strip">${PLAN.weeks.map(w=>`<button class="week-btn ${w.week===state.selectedWeek?"active":""}" onclick="state.selectedWeek=${w.week}; persist()">S${w.week}<br><small>${w.phase.split(" ")[0]}</small></button>`).join("")}</div>
    <div class="card" style="margin-bottom:12px">
      <div class="pill">Semana ${week().week} • ${week().phase}</div>
      <h2 style="margin:12px 0 4px">${week().focus}</h2>
      <p class="warning">${week().rule}</p>
    </div>
    <div class="calendar">
      ${Object.entries(PLAN.workouts).map(([day,w])=>`
        <div class="card day-card">
          <div class="day-head">
            <div><div class="day-name">${day}</div><div class="day-title">${w.title}</div></div>
            <button class="ghost" onclick="state.selectedDay='${day}'; persist(); openTab('log')">Registrar</button>
          </div>
          <ul>${w.exercises.slice(0,5).map(e=>`<li>${e.name} — ${e.sets}x${e.reps}</li>`).join("")}</ul>
        </div>
      `).join("")}
    </div>
  `;
}
function renderLog(){
  const w = workout();
  el("log").innerHTML = `
    ${sectionTitle("Registrar treino", "Carga, reps, RPE e observações por exercício.")}
    <div class="card">
      <div class="form-grid four">
        ${inputBlock("tr-date","Data","date",today())}
        <div><label>Semana</label><select id="tr-week">${PLAN.weeks.map(x=>`<option value="${x.week}" ${x.week===state.selectedWeek?"selected":""}>Semana ${x.week}</option>`).join("")}</select></div>
        <div><label>Dia</label><select id="tr-day" onchange="state.selectedDay=this.value; persist(); openTab('log')">${Object.keys(PLAN.workouts).map(d=>`<option ${d===state.selectedDay?"selected":""}>${d}</option>`).join("")}</select></div>
        ${inputBlock("tr-duration","Duração","text","50 min","50 min")}
      </div>
      <h2 style="margin-top:14px">${w.title}</h2>
      <div id="exercise-form">
        ${w.exercises.map((e,i)=>`
          <div class="exercise">
            <div class="exercise-top">
              <div><div class="exercise-name">${e.name}</div><div class="exercise-meta">${e.sets} séries • ${e.reps} reps • RPE ${e.rpe}</div></div>
              <a href="${e.link}" target="_blank">execução</a>
            </div>
            <div class="form-grid four">
              ${inputBlock(`load-${i}`,"Carga","text","","kg")}
              ${inputBlock(`reps-${i}`,"Reps feitas","text","","8/8/7")}
              ${inputBlock(`rpe-${i}`,"RPE real","text","","0-10")}
              ${inputBlock(`note-${i}`,"Nota","text","","observação")}
            </div>
          </div>
        `).join("")}
      </div>
      <div class="form-grid four">
        ${selectBlock("tr-energy","Energia",["Boa","Normal","Baixa"],"Boa")}
        ${selectBlock("tr-pain","Desconforto",["Não","Leve","Moderado","Forte"],"Não")}
        ${selectBlock("tr-done","Concluído",["Sim","Parcial"],"Sim")}
        ${inputBlock("tr-note","Observação geral","text","","sono, apetite, tempo...")}
      </div>
      <div class="actions"><button class="primary" onclick="saveWorkout()">Salvar treino</button></div>
    </div>
    <div class="card" style="margin-top:12px">
      <h2>Histórico recente</h2>
      <div class="list">${renderWorkoutHistory()}</div>
    </div>
  `;
}
function saveWorkout(){
  const day = el("tr-day").value;
  const w = PLAN.workouts[day];
  const log = {
    id:uid(),
    date:el("tr-date").value || today(),
    week:n(el("tr-week").value),
    day,
    title:w.title,
    duration:el("tr-duration").value,
    energy:el("tr-energy").value,
    pain:el("tr-pain").value,
    done:el("tr-done").value === "Sim",
    note:el("tr-note").value,
    exercises:w.exercises.map((e,i)=>({
      name:e.name, target:`${e.sets}x${e.reps}`, targetRpe:e.rpe,
      load:el(`load-${i}`).value,
      reps:el(`reps-${i}`).value,
      rpe:el(`rpe-${i}`).value,
      note:el(`note-${i}`).value
    }))
  };
  state.workoutLogs.push(log);
  state.selectedWeek = log.week;
  state.selectedDay = day;
  persist();
  openTab("log");
}
function renderWorkoutHistory(){
  const rows = [...state.workoutLogs].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,10);
  if(!rows.length) return `<p class="muted">Nenhum treino registrado ainda.</p>`;
  return rows.map(r=>`
    <div class="history-item">
      <h3>${r.date} • ${r.day} • Semana ${r.week}</h3>
      <p>${r.title} • ${r.done ? "Completo" : "Parcial"} • Energia: ${r.energy}</p>
      <p>${r.note || ""}</p>
      <div class="actions"><button class="danger" onclick="deleteItem('workoutLogs','${r.id}')">Excluir</button></div>
    </div>
  `).join("");
}
function renderBody(){
  el("body").innerHTML = `
    ${sectionTitle("Peso e medidas", "Controle semanal de composição, cintura e recuperação.")}
    <div class="grid two">
      <div class="card">
        <div class="form-grid four">
          ${inputBlock("bd-date","Data","date",today())}
          ${inputBlock("bd-weight","Peso kg","number","","76.0")}
          ${inputBlock("bd-waist","Cintura cm","number","","")}
          ${inputBlock("bd-arm","Braço cm","number","","")}
          ${inputBlock("bd-thigh","Coxa cm","number","","")}
          ${inputBlock("bd-sleep","Sono horas","number","","7.5")}
          ${selectBlock("bd-appetite","Apetite",["Bom","Normal","Baixo","Muito baixo"],"Normal")}
          ${selectBlock("bd-digestion","Digestão",["Normal","Constipado","Náusea","Refluxo","Diarreia"],"Normal")}
        </div>
        <div style="margin-top:12px"><label>Notas</label><textarea id="bd-note" placeholder="Fotos, visual, disposição, fome, observações para o nutrólogo..."></textarea></div>
        <div class="actions"><button class="primary" onclick="saveBody()">Salvar medidas</button></div>
      </div>
      <div class="card">
        <h2>Tendência</h2>
        <p class="warning">${feedback()}</p>
        <div class="chart"><canvas id="bodyChart"></canvas></div>
      </div>
    </div>
    <div class="card" style="margin-top:12px">
      <h2>Histórico</h2>
      <div class="list">${renderBodyHistory()}</div>
    </div>
  `;
  setTimeout(drawBodyChart,50);
}
function saveBody(){
  state.bodyLogs.push({
    id:uid(), date:el("bd-date").value || today(), weight:el("bd-weight").value,
    waist:el("bd-waist").value, arm:el("bd-arm").value, thigh:el("bd-thigh").value,
    sleep:el("bd-sleep").value, appetite:el("bd-appetite").value, digestion:el("bd-digestion").value,
    note:el("bd-note").value
  });
  persist();
  openTab("body");
}
function renderBodyHistory(){
  const rows = [...state.bodyLogs].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,12);
  if(!rows.length) return `<p class="muted">Nenhuma medida registrada.</p>`;
  return rows.map(r=>`
    <div class="history-item">
      <h3>${r.date} • ${r.weight || "-"} kg</h3>
      <p>Cintura: ${r.waist || "-"} cm • Sono: ${r.sleep || "-"} h • Apetite: ${r.appetite}</p>
      <p>${r.note || ""}</p>
      <div class="actions"><button class="danger" onclick="deleteItem('bodyLogs','${r.id}')">Excluir</button></div>
    </div>
  `).join("");
}
function renderNutrition(){
  const meals = PLAN.diet;
  el("nutrition").innerHTML = `
    ${sectionTitle("Dieta", "Checklist prático para rotina 08h–18h.")}
    <div class="grid two">
      <div class="card">
        <div class="form-grid four">
          ${inputBlock("dt-date","Data","date",today())}
          ${selectBlock("dt-type","Tipo",["Treino","Fim de semana","Descanso"],"Treino")}
          ${inputBlock("dt-kcal","Kcal estimada","number","","3115")}
          ${inputBlock("dt-protein","Proteína g","number","","172")}
          ${inputBlock("dt-water","Água L","number","","3.5")}
          ${selectBlock("dt-appetite","Apetite",["Bom","Normal","Baixo","Muito baixo"],"Normal")}
        </div>
        <h3>Refeições</h3>
        <div class="list">
          ${meals.map((m,i)=>`<label class="checkbox-row"><input type="checkbox" id="meal-${i}"><div><b>${m.time} • ${m.meal}</b><br><span class="muted">${m.base}</span></div></label>`).join("")}
        </div>
        <div style="margin-top:12px"><label>Notas</label><textarea id="dt-note" placeholder="Apetite baixo, refeição substituída, restaurante, shake extra..."></textarea></div>
        <div class="actions"><button class="primary" onclick="saveDiet()">Salvar dieta</button></div>
      </div>
      <div class="card">
        <h2>Referência do plano</h2>
        <p><span class="pill">Treino: ${state.profile.caloriesTrainingDay} kcal</span></p>
        <p><span class="pill">Fim de semana: ${state.profile.caloriesWeekend} kcal</span></p>
        <p><span class="pill">Proteína: ${state.profile.proteinTarget} g/dia</span></p>
        <p class="warning"><b>Atenção:</b> retatrutida pode reduzir apetite. Priorize proteína, refeições líquidas densas e acompanhamento médico.</p>
        <div class="table"><table><thead><tr><th>Horário</th><th>Refeição</th><th>Base</th></tr></thead><tbody>
          ${meals.map(m=>`<tr><td>${m.time}</td><td>${m.meal}</td><td>${m.base}</td></tr>`).join("")}
        </tbody></table></div>
      </div>
    </div>
    <div class="card" style="margin-top:12px">
      <h2>Histórico</h2>
      <div class="list">${renderDietHistory()}</div>
    </div>
  `;
}
function saveDiet(){
  state.dietLogs.push({
    id:uid(), date:el("dt-date").value || today(), type:el("dt-type").value,
    kcal:el("dt-kcal").value, protein:el("dt-protein").value, water:el("dt-water").value,
    appetite:el("dt-appetite").value,
    meals:PLAN.diet.map((m,i)=>({meal:m.meal, done:el(`meal-${i}`).checked})),
    note:el("dt-note").value
  });
  persist();
  openTab("nutrition");
}
function renderDietHistory(){
  const rows = [...state.dietLogs].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,10);
  if(!rows.length) return `<p class="muted">Nenhum registro alimentar.</p>`;
  return rows.map(r=>`
    <div class="history-item">
      <h3>${r.date} • ${r.type}</h3>
      <p>${r.kcal || "-"} kcal • ${r.protein || "-"} g proteína • ${r.water || "-"} L água</p>
      <p>Refeições feitas: ${r.meals.filter(m=>m.done).length}/${r.meals.length}</p>
      <p>${r.note || ""}</p>
      <div class="actions"><button class="danger" onclick="deleteItem('dietLogs','${r.id}')">Excluir</button></div>
    </div>
  `).join("");
}
function renderMore(){
  el("more").innerHTML = `
    ${sectionTitle("Mais", "Suplementos, medicamentos, exames e backup.")}
    <div class="grid two">
      <div class="card">
        <h2>Registro diário</h2>
        <div class="form-grid">
          ${inputBlock("sp-date","Data","date",today())}
          ${selectBlock("sp-tol","Tolerância geral",["Boa","Normal","Atenção","Ruim"],"Boa")}
          ${selectBlock("sp-appetite","Apetite",["Bom","Normal","Baixo","Muito baixo"],"Normal")}
          ${selectBlock("sp-gi","Náusea/refluxo",["Não","Leve","Moderado","Forte"],"Não")}
        </div>
        <h3>Suplementos</h3>
        <div class="list">${PLAN.supplements.map((s,i)=>`<label class="checkbox-row"><input type="checkbox" id="sup-${i}"><div><b>${s.name}</b><br><span class="muted">${s.priority} • ${s.decision}</span></div></label>`).join("")}</div>
        <h3>Medicamentos — só registro</h3>
        <div class="list">${PLAN.medications.map((m,i)=>`<label class="checkbox-row"><input type="checkbox" id="med-${i}"><div><b>${m.name}</b><br><span class="muted">${m.use}</span></div></label>`).join("")}</div>
        <div style="margin-top:12px"><label>Observação</label><textarea id="sp-note" placeholder="Sintomas, apetite, sono, pontos para levar ao médico..."></textarea></div>
        <div class="actions"><button class="primary" onclick="saveSupp()">Salvar registro</button></div>
      </div>
      <div class="card">
        <h2>Exames</h2>
        <div class="table"><table><thead><tr><th>Grupo</th><th>Exame</th><th>Periodicidade</th></tr></thead><tbody>${PLAN.exams.map(e=>`<tr><td>${e.group}</td><td>${e.name}</td><td>${e.frequency}</td></tr>`).join("")}</tbody></table></div>
      </div>
    </div>
    <div class="grid two" style="margin-top:12px">
      <div class="card">
        <h2>Histórico suplementos/meds</h2>
        <div class="list">${renderSuppHistory()}</div>
      </div>
      <div class="card">
        <h2>Backup</h2>
        <p class="warning">Os dados ficam neste navegador/dispositivo. Faça backup JSON toda semana.</p>
        <div class="actions">
          <button class="primary" onclick="exportBackup()">Exportar JSON</button>
          <button class="ghost" onclick="exportCSV('workoutLogs')">CSV treinos</button>
          <button class="ghost" onclick="exportCSV('bodyLogs')">CSV medidas</button>
          <button class="danger" onclick="resetAll()">Apagar tudo</button>
        </div>
        <div style="margin-top:12px"><label>Importar backup JSON</label><input type="file" id="backup-file" accept="application/json"></div>
        <div class="actions"><button class="ghost" onclick="importBackup()">Importar</button></div>
      </div>
    </div>
  `;
}
function saveSupp(){
  state.supplementLogs.push({
    id:uid(), date:el("sp-date").value || today(),
    tolerance:el("sp-tol").value, appetite:el("sp-appetite").value, gi:el("sp-gi").value,
    supplements:PLAN.supplements.filter((s,i)=>el(`sup-${i}`).checked).map(s=>s.name),
    medications:PLAN.medications.filter((m,i)=>el(`med-${i}`).checked).map(m=>m.name),
    note:el("sp-note").value
  });
  persist();
  openTab("more");
}
function renderSuppHistory(){
  const rows = [...state.supplementLogs].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,8);
  if(!rows.length) return `<p class="muted">Nenhum registro ainda.</p>`;
  return rows.map(r=>`
    <div class="history-item">
      <h3>${r.date} • ${r.tolerance}</h3>
      <p>Suplementos: ${r.supplements.join(", ") || "-"}</p>
      <p>Meds: ${r.medications.join(", ") || "-"}</p>
      <p>Apetite: ${r.appetite} • GI: ${r.gi}</p>
      <p>${r.note || ""}</p>
      <div class="actions"><button class="danger" onclick="deleteItem('supplementLogs','${r.id}')">Excluir</button></div>
    </div>
  `).join("");
}
function deleteItem(list,id){
  if(!confirm("Excluir este registro?")) return;
  state[list] = state[list].filter(x=>x.id !== id);
  persist();
}
function exportBackup(){
  const blob = new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `portal_performance_backup_${today()}.json`;
  a.click();
}
function flatten(obj,prefix="",out={}){
  Object.entries(obj).forEach(([k,v])=>{
    const key = prefix ? `${prefix}.${k}` : k;
    if(v && typeof v === "object" && !Array.isArray(v)) flatten(v,key,out);
    else out[key] = Array.isArray(v) ? JSON.stringify(v) : v;
  });
  return out;
}
function exportCSV(list){
  const arr = state[list] || [];
  if(!arr.length){ alert("Sem dados para exportar."); return; }
  const rows = arr.map(x=>flatten(x));
  const headers = [...new Set(rows.flatMap(r=>Object.keys(r)))];
  const esc = v => `"${String(v ?? "").replaceAll('"','""')}"`;
  const csv = [headers.join(","), ...rows.map(r=>headers.map(h=>esc(r[h])).join(","))].join("\n");
  const blob = new Blob([csv],{type:"text/csv;charset=utf-8"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${list}_${today()}.csv`;
  a.click();
}
function importBackup(){
  const file = el("backup-file").files[0];
  if(!file){ alert("Selecione o arquivo JSON."); return; }
  if(!confirm("Isso substituirá os dados atuais deste navegador. Continuar?")) return;
  const reader = new FileReader();
  reader.onload = e => {
    try{
      state = {...blankState(), ...JSON.parse(e.target.result)};
      persist();
      alert("Backup importado.");
    }catch(err){ alert("Arquivo inválido."); }
  };
  reader.readAsText(file);
}
function resetAll(){
  if(!confirm("Apagar todos os registros locais? Faça backup antes.")) return;
  localStorage.removeItem(STORE_KEY);
  state = blankState();
  render();
}
function drawLine(canvas, values, label){
  if(!canvas) return;
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.clientWidth, H = canvas.clientHeight;
  canvas.width = W*dpr; canvas.height = H*dpr; ctx.scale(dpr,dpr);
  ctx.clearRect(0,0,W,H);
  ctx.strokeStyle = "#273247"; ctx.lineWidth = 1;
  const p = 28;
  ctx.beginPath(); ctx.moveTo(p,H-p); ctx.lineTo(W-p,H-p); ctx.lineTo(W-p,p); ctx.stroke();
  if(!values.length){ ctx.fillStyle="#93a3b8"; ctx.fillText("Sem dados ainda",p,H/2); return; }
  const min = Math.min(...values), max = Math.max(...values), span = max-min || 1;
  const pts = values.map((v,i)=>[p+i*((W-2*p)/Math.max(1,values.length-1)), H-p-((v-min)/span)*(H-2*p)]);
  ctx.strokeStyle = "#6ea8ff"; ctx.lineWidth = 3; ctx.beginPath();
  pts.forEach((pt,i)=> i ? ctx.lineTo(pt[0],pt[1]) : ctx.moveTo(pt[0],pt[1])); ctx.stroke();
  ctx.fillStyle = "#49d17d";
  pts.forEach(pt=>{ ctx.beginPath(); ctx.arc(pt[0],pt[1],4,0,Math.PI*2); ctx.fill(); });
  ctx.fillStyle="#d7e3f3"; ctx.font="12px system-ui"; ctx.fillText(`${label}: ${values.at(-1)}`,p,18);
}
function drawWeightChart(){
  const values = [...state.bodyLogs].filter(x=>x.weight).sort((a,b)=>a.date.localeCompare(b.date)).slice(-12).map(x=>n(x.weight));
  drawLine(el("weightChart"), values, "Peso kg");
}
function drawBodyChart(){
  const values = [...state.bodyLogs].filter(x=>x.weight).sort((a,b)=>a.date.localeCompare(b.date)).slice(-12).map(x=>n(x.weight));
  drawLine(el("bodyChart"), values, "Peso kg");
}
function render(){
  renderShell();
  renderDashboard();
  renderCalendar();
  renderLog();
  renderBody();
  renderNutrition();
  renderMore();
  const hash = location.hash?.replace("#","") || "dashboard";
  openTab(tabs.some(t=>t[0]===hash) ? hash : "dashboard");
}
if("serviceWorker" in navigator){
  window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
}
render();
