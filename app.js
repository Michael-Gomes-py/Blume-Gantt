const PROFILES_KEY='blume_profiles_v1';
const ACTIVE_PROFILE_KEY='blume_active_profile_v1';
const LEGACY_STORAGE_KEY='blume_gantt_v4';
const LEGACY_PROJECTS_KEY='blume_projects_v2';
const OWNER_OPTIONS=['Liderança','Ryan','Michael','Vinicius','Kauã','Dimitri','Todos'];
const DEFAULT_TASKS=[
 {id:1,name:'Reunião de inicialização de projeto',owner:'Liderança',start:'2026-08-03',duration:2,status:'Concluída',progress:100},
 {id:2,name:'Levantamento de Requisitos do Sistema',owner:'Ryan',start:'2026-08-05',duration:3,status:'Concluída',progress:100},
 {id:3,name:'Aprovação do Plano',owner:'Liderança',start:'2026-08-10',duration:2,status:'Em andamento',progress:50},
 {id:4,name:'Reunião de alinhamento de tarefas',owner:'Liderança',start:'2026-08-10',duration:1,status:'Concluída',progress:100},
 {id:5,name:'Delegação geral das tarefas',owner:'Liderança',start:'2026-08-10',duration:1,status:'Concluída',progress:100},
 {id:6,name:'Estudo do pfSense',owner:'Todos',start:'2026-08-10',duration:90,status:'Em andamento',progress:10},
 {id:7,name:'Estudo específico do pfSense',owner:'Vinicius',start:'2026-08-10',duration:7,status:'Em andamento',progress:60},
 {id:8,name:'Estudo específico do pfSense',owner:'Kauã',start:'2026-08-10',duration:7,status:'Em andamento',progress:60},
 {id:9,name:'Documentação do projeto',owner:'Dimitri',start:'2026-08-24',duration:8,status:'Não iniciada',progress:0},
 {id:10,name:'Auxílio da topologia e endereçamentos',owner:'Michael',start:'2026-08-10',duration:20,status:'Em andamento',progress:35},
 {id:11,name:'Topologia e endereçamentos',owner:'Ryan',start:'2026-09-01',duration:5,status:'Não iniciada',progress:0}
];

let profiles=loadProfiles();
let activeProfileId=loadActiveProfileId();
let activeProfile=getActiveProfile();
let activeProjectId=activeProfile.activeProjectId||activeProfile.projects[0]?.id||1;
let activeProject=getActiveProject();
let tasks=activeProject.tasks;
let zoom=1;
let saveTimer=null;
let hasUnsavedChanges=false;

function clone(x){return JSON.parse(JSON.stringify(x))}
function uid(prefix='id'){return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`}
function loadActiveProfileId(){try{return localStorage.getItem(ACTIVE_PROFILE_KEY)||''}catch{return ''}}
function legacyTasks(){try{const saved=localStorage.getItem(LEGACY_STORAGE_KEY);return saved?JSON.parse(saved):clone(DEFAULT_TASKS)}catch{return clone(DEFAULT_TASKS)}}
function legacyProjects(){try{return JSON.parse(localStorage.getItem(LEGACY_PROJECTS_KEY))||[{id:1,name:'Projeto Blume',description:'Cronograma principal'}]}catch{return [{id:1,name:'Projeto Blume',description:'Cronograma principal'}]}}

function createDefaultProfile(){
  const legacy=legacyProjects();
  const legacyActive=legacy[0]||{id:1,name:'Projeto Blume',description:'Cronograma principal'};
  const project={id:uid('project'),name:String(legacyActive.name||'Meu projeto'),description:String(legacyActive.description||'Cronograma principal'),tasks:legacyTasks()};
  return {id:uid('profile'),name:'Meu perfil',projects:[project],activeProjectId:project.id};
}

function normalizeProfile(p){
  const profile={
    id:String(p?.id||uid('profile')),
    name:String(p?.name||'Meu perfil').trim()||'Meu perfil',
    projects:Array.isArray(p?.projects)?p.projects:[],
    activeProjectId:String(p?.activeProjectId||'')
  };
  if(!profile.projects.length){
    const project={id:uid('project'),name:'Meu projeto',description:'Cronograma principal',tasks:[]};
    profile.projects=[project];
    profile.activeProjectId=project.id;
  }
  profile.projects=profile.projects.map(pr=>({
    id:String(pr?.id||uid('project')),
    name:String(pr?.name||'Projeto sem nome').trim()||'Projeto sem nome',
    description:String(pr?.description||''),
    tasks:Array.isArray(pr?.tasks)?pr.tasks:[]
  }));
  if(!profile.projects.some(pr=>pr.id===profile.activeProjectId))profile.activeProjectId=profile.projects[0].id;
  return profile;
}

function loadProfiles(){
  try{
    const saved=localStorage.getItem(PROFILES_KEY);
    if(saved){
      const parsed=JSON.parse(saved);
      if(Array.isArray(parsed)&&parsed.length)return parsed.map(normalizeProfile);
    }
  }catch(err){console.warn('Falha ao carregar perfis.',err)}
  const profile=createDefaultProfile();
  try{localStorage.setItem(PROFILES_KEY,JSON.stringify([profile]));localStorage.setItem(ACTIVE_PROFILE_KEY,profile.id)}catch{}
  return [profile];
}

function getActiveProfile(){
  let p=profiles.find(x=>x.id===activeProfileId);
  if(!p){p=profiles[0];activeProfileId=p.id;}
  return p;
}
function getActiveProject(){
  activeProfile=getActiveProfile();
  let p=activeProfile.projects.find(x=>x.id===activeProjectId);
  if(!p){p=activeProfile.projects[0];activeProjectId=p.id;activeProfile.activeProjectId=p.id;}
  if(!Array.isArray(p.tasks))p.tasks=[];
  return p;
}
function syncCurrentSelection(){
  activeProfile=getActiveProfile();
  activeProfile.activeProjectId=activeProjectId;
  activeProject=getActiveProject();
  tasks=activeProject.tasks;
  updateProfileLabel();
}
function persistProfiles(){
  activeProject.tasks=tasks;
  activeProfile.activeProjectId=activeProjectId;
  localStorage.setItem(PROFILES_KEY,JSON.stringify(profiles));
  localStorage.setItem(ACTIVE_PROFILE_KEY,activeProfileId);
}

function save(){
  hasUnsavedChanges=true;
  const status=document.getElementById('saveStatus');
  if(status)status.textContent='● Salvando...';
  try{
    persistProfiles();
    hasUnsavedChanges=false;
    if(status)status.textContent='● Dados sincronizados';
  }catch(err){
    console.error('Erro ao salvar o projeto.',err);
    if(status)status.textContent='● Erro ao salvar';
  }
}
function queueSave(){clearTimeout(saveTimer);saveTimer=setTimeout(save,120)}
function forceSave(){clearTimeout(saveTimer);if(hasUnsavedChanges)save()}
function manualSave(){clearTimeout(saveTimer);save();const status=document.getElementById('saveStatus');if(status){status.textContent='✓ Dados salvos agora';clearTimeout(window.__saveFeedbackTimer);window.__saveFeedbackTimer=setTimeout(()=>{status.textContent='● Dados sincronizados'},1800)}}

function sanitizeFileName(value){return String(value||'Blume').replace(/[^a-z0-9À-ÿ_-]+/gi,'_').replace(/^_+|_+$/g,'')||'Blume'}
function downloadBackup(){
  forceSave();
  const backup={app:'Blume Project Management',version:'V19',scope:'profile',exportedAt:new Date().toISOString(),profile:clone(activeProfile)};
  const blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const link=document.createElement('a');
  const stamp=new Date(),pad=n=>String(n).padStart(2,'0');
  const fileName=`Blume_${sanitizeFileName(activeProfile.name)}_Backup_${stamp.getFullYear()}-${pad(stamp.getMonth()+1)}-${pad(stamp.getDate())}_${pad(stamp.getHours())}-${pad(stamp.getMinutes())}.json`;
  link.href=url;link.download=fileName;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  const status=document.getElementById('saveStatus');if(status){status.textContent='✓ Backup do perfil baixado';clearTimeout(window.__saveFeedbackTimer);window.__saveFeedbackTimer=setTimeout(()=>{status.textContent='● Dados sincronizados'},2200)}
}

function normalizeTask(t){
  const status=['Não iniciada','Em andamento','Concluída','Cancelada'].includes(t?.status)?t.status:'Não iniciada';
  return {id:Number(t?.id)||Date.now()+Math.floor(Math.random()*100000),name:String(t?.name||'Nova etapa / tarefa'),owner:String(t?.owner||'Liderança'),start:normalizeStart(t?.start)||iso(new Date()),duration:Math.max(1,Math.min(3650,parseInt(t?.duration,10)||1)),status,progress:Math.max(0,Math.min(100,Number(t?.progress)||0))};
}
function normalizeImportedProfile(p){
  const np=normalizeProfile({id:activeProfile.id,name:p?.name||activeProfile.name,activeProjectId:p?.activeProjectId,projects:Array.isArray(p?.projects)?p.projects.map(pr=>({...pr,tasks:Array.isArray(pr?.tasks)?pr.tasks.map(normalizeTask):[]})):[]});
  return np;
}
function restoreBackup(file){
  if(!file)return;
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const backup=JSON.parse(reader.result);
      let importedProfile=null;
      if(backup?.profile && typeof backup.profile==='object') importedProfile=normalizeImportedProfile(backup.profile);
      else if(Array.isArray(backup?.tasks)){
        const projects=Array.isArray(backup.projects)&&backup.projects.length?backup.projects:[{id:uid('project'),name:'Projeto Blume',description:'Cronograma restaurado'}];
        const first={...projects[0],tasks:backup.tasks.map(normalizeTask)};
        importedProfile=normalizeImportedProfile({name:activeProfile.name,activeProjectId:String(first.id),projects:[first]});
      } else throw new Error('Formato de backup inválido.');

      const totalTasks=importedProfile.projects.reduce((sum,p)=>sum+p.tasks.length,0);
      if(!totalTasks && !confirm('O backup não possui tarefas. Deseja restaurar mesmo assim?'))return;
      if(!confirm(`Restaurar o perfil “${importedProfile.name}” com ${importedProfile.projects.length} projeto(s) e ${totalTasks} tarefa(s)? Os dados atuais deste perfil serão substituídos.`))return;

      importedProfile.id=activeProfile.id;
      profiles=profiles.map(p=>p.id===activeProfile.id?importedProfile:p);
      activeProfile=importedProfile;
      activeProfileId=importedProfile.id;
      activeProjectId=importedProfile.activeProjectId;
      syncCurrentSelection();
      localStorage.setItem(PROFILES_KEY,JSON.stringify(profiles));
      localStorage.setItem(ACTIVE_PROFILE_KEY,activeProfileId);
      hasUnsavedChanges=false;
      renderFilter();render();
      const status=document.getElementById('saveStatus');if(status){status.textContent='✓ Perfil restaurado';clearTimeout(window.__saveFeedbackTimer);window.__saveFeedbackTimer=setTimeout(()=>{status.textContent='● Dados sincronizados'},2500)}
    }catch(err){console.error('Erro ao restaurar backup.',err);alert('Não foi possível restaurar o backup. Verifique se o arquivo é um backup válido do Blume.')}
  };
  reader.onerror=()=>alert('Não foi possível ler o arquivo de backup.');
  reader.readAsText(file);
}

function parseDate(s){
  if(!s||typeof s!=='string')return null;s=s.trim();
  let m=/(^\d{4})-(\d{2})-(\d{2})$/.exec(s);
  const br=/^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s);
  if(!m&&br)m=[null,br[3],br[2],br[1]];
  if(!m)return null;
  const y=Number(m[1]),mo=Number(m[2]),day=Number(m[3]),d=new Date(y,mo-1,day);
  if(Number.isNaN(d.getTime())||d.getFullYear()!==y||d.getMonth()!==mo-1||d.getDate()!==day)return null;return d;
}
function normalizeStart(value){const d=parseDate(String(value??''));return d?iso(d):null}
function addDays(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x}
function fmt(d){return d?d.toLocaleDateString('pt-BR'):''}
function iso(d){if(!d||Number.isNaN(d.getTime()))return '';return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
function endDate(t){const d=parseDate(t.start);return d?addDays(d,Math.max(0,(Number(t.duration)||1)-1)):null}
function filtered(){const o=document.getElementById('filterOwner').value,s=document.getElementById('filterStatus').value;return tasks.filter(t=>(!o||o==='TODOS'||t.owner===o)&&(!s||s==='TODOS'||t.status===s))}
function dateRange(list){const valid=list.filter(t=>parseDate(t.start));if(!valid.length)return null;let a=new Date(Math.min(...valid.map(t=>parseDate(t.start))));let b=new Date(Math.max(...valid.map(t=>endDate(t))));a=addDays(a,-2);b=addDays(b,2);return {start:a,end:b,days:Math.round((b-a)/86400000)+1}}
function owners(){return [...new Set([...OWNER_OPTIONS,...tasks.map(t=>t.owner).filter(Boolean)])]}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function isLate(t){const n=new Date();n.setHours(0,0,0,0);return t.status!=='Concluída'&&t.status!=='Cancelada'&&endDate(t)<n}
function updateProfileLabel(){const el=document.getElementById('profileName');if(el)el.textContent=activeProfile.name}

function renderFilter(){
  const s=document.getElementById('filterOwner'),current=s.value||'TODOS';
  s.innerHTML='<option value="TODOS">Todos os responsáveis</option>'+owners().map(o=>`<option value="${esc(o)}">${esc(o)}</option>`).join('');
  if([...s.options].some(x=>x.value===current))s.value=current;
  updateProfileLabel();
}

function render(){
 const list=filtered(),range=dateRange(list)||{start:new Date(),end:addDays(new Date(),29),days:30};
 const head=document.getElementById('ganttHead');while(head.children.length>7)head.removeChild(head.lastChild);
 for(let i=0;i<range.days;i++){const d=addDays(range.start,i),th=document.createElement('th');th.className='day';th.textContent=String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0');if(d.toDateString()===new Date().toDateString())th.classList.add('today');head.appendChild(th)}
 const body=document.getElementById('ganttBody');body.innerHTML='';
 if(!list.length){body.innerHTML='<tr><td colspan="'+(7+range.days)+'" class="empty">Nenhuma tarefa encontrada.</td></tr>';updateKpis(list);return}
 const statusOptions=['Não iniciada','Em andamento','Concluída','Cancelada'];
 list.forEach(t=>{
  const tr=document.createElement('tr');tr.dataset.id=t.id;if(isLate(t))tr.classList.add('late-row');
  const start=parseDate(t.start),end=endDate(t);const statusClass=t.status==='Concluída'?'done':t.status==='Em andamento'?'progress':t.status==='Cancelada'?'cancel':'todo';
  tr.innerHTML=`
  <td class="sticky-1 col-task"><input class="task-input" data-field="name" value="${esc(t.name)}" aria-label="Nome da tarefa">${isLate(t)?'<span class="late-badge">ATRASADA</span>':''}</td>
  <td class="sticky-2 col-owner"><select class="owner-select" data-field="owner" aria-label="Responsável">${owners().map(o=>`<option value="${esc(o)}" ${t.owner===o?'selected':''}>${esc(o)}</option>`).join('')}</select></td>
  <td class="sticky-3 col-status"><select class="status-select ${statusClass}" data-field="status" aria-label="Status da tarefa">${statusOptions.map(s=>`<option value="${s}" ${t.status===s?'selected':''}>${s}</option>`).join('')}</select></td>
  <td class="sticky-4 col-date"><input type="date" lang="pt-BR" style="width:100%" data-field="start" value="${esc(t.start)}" autocomplete="off" aria-label="Data de início" title="Selecionar data de início"></td>
  <td class="sticky-5 col-days"><input type="number" style="width:100%" min="1" max="3650" data-field="duration" value="${Number(t.duration)||1}" aria-label="Duração"></td>
  <td class="sticky-6 col-end">${fmt(end)}</td><td class="sticky-7 col-actions"><button class="delete" title="Excluir" aria-label="Excluir">×</button></td>`;
  const barClass=t.status==='Concluída'?'':t.status==='Em andamento'?'progress-bar':'todo-bar';
  for(let i=0;i<range.days;i++){const d=addDays(range.start,i),td=document.createElement('td');td.className='day';if(d.toDateString()===new Date().toDateString())td.classList.add('today');if(start&&end&&d>=start&&d<=end){td.classList.add('bar');if(barClass)td.classList.add(barClass);if(d.toDateString()===start.toDateString())td.classList.add('start');if(d.toDateString()===end.toDateString())td.classList.add('finish');td.title=`${t.name} • ${fmt(d)} • ${t.status}`}tr.appendChild(td)}
  body.appendChild(tr);
 });
 updateKpis(list);syncStickyWidths();
}
function updateKpis(list){document.getElementById('kpiTasks').textContent=list.length;const r=dateRange(list);document.getElementById('kpiDays').textContent=r?r.days+' dias':'0 dias';document.getElementById('kpiOwners').textContent=new Set(list.filter(t=>t.owner!=='Todos').map(t=>t.owner)).size;const done=list.filter(t=>t.status==='Concluída').length;document.getElementById('kpiDone').textContent=list.length?Math.round(done/list.length*100)+'%':'0%';document.getElementById('kpiLate').textContent=list.filter(isLate).length}
function updateTask(id,field,value,shouldRender=false){const t=tasks.find(x=>x.id===id);if(!t)return;if(field==='duration')value=Math.max(1,Math.min(3650,parseInt(value,10)||1));if(field==='start'){const normalized=normalizeStart(value);if(!normalized)return;value=normalized}if(field==='status'){if(value==='Concluída')t.progress=100;else if(value==='Não iniciada')t.progress=0}t[field]=value;hasUnsavedChanges=true;save();if(shouldRender&&['status','start','duration','owner'].includes(field))render()}
function addTask(){const base=new Date();tasks.push({id:Date.now(),name:'Nova etapa / tarefa',owner:'Liderança',start:iso(base),duration:5,status:'Não iniciada',progress:0});save();render()}
function deleteTask(id){const t=tasks.find(x=>x.id===id);if(t&&confirm(`Excluir "${t.name}"?`)){tasks=tasks.filter(x=>x.id!==id);activeProject.tasks=tasks;save();render()}}

function syncStickyWidths(){const table=document.getElementById('ganttTable');if(!table)return;const row=table.tHead?.rows[0];if(!row)return;const cells=[...row.children].slice(0,7);if(cells.length<7)return;const widths=cells.map(c=>Math.ceil(c.getBoundingClientRect().width));widths.forEach((w,i)=>table.style.setProperty(`--w${i+1}`,`${w}px`))}
function fit(){const wrap=document.getElementById('ganttWrap'),table=document.getElementById('ganttTable');if(!wrap||!table)return;zoom=1;table.style.zoom=1;syncStickyWidths();requestAnimationFrame(()=>{const natural=table.scrollWidth,available=wrap.clientWidth;zoom=Math.max(.45,Math.min(1,available/natural));applyZoom();requestAnimationFrame(syncStickyWidths)})}
function applyZoom(){document.getElementById('ganttTable').style.zoom=zoom;document.getElementById('zoomInfo').textContent=Math.round(zoom*100)+'%'}

function exportExcel(){
 if(typeof XLSX==='undefined'){alert('Biblioteca XLSX indisponível.');return}
 const list=filtered(),range=dateRange(list)||{start:new Date(),days:30},wb=XLSX.utils.book_new();
 const infoData=list.map(t=>({'Tarefa':t.name,'Responsável':t.owner,'Status':t.status,'Início':t.start,'Duração (Dias)':t.duration,'Fim':fmt(endDate(t)),'Atrasada':isLate(t)?'Sim':'Não'}));
 const wsInfo=XLSX.utils.json_to_sheet(infoData);wsInfo['!cols']=[{wch:35},{wch:18},{wch:16},{wch:12},{wch:14},{wch:12},{wch:10}];XLSX.utils.book_append_sheet(wb,wsInfo,'Informações');
 const fixedHeaders=['Tarefa','Responsável','Status','Início','Dias','Fim'];const dateHeaders=Array.from({length:range.days},(_,i)=>fmt(addDays(range.start,i)));const ganttRows=[[...fixedHeaders,...dateHeaders]];
 list.forEach(t=>ganttRows.push([t.name,t.owner,t.status,t.start,t.duration,fmt(endDate(t)),...Array.from({length:range.days},()=>'' )]));
 const wsGantt=XLSX.utils.aoa_to_sheet(ganttRows),colWidths=[{wch:30},{wch:15},{wch:14},{wch:12},{wch:8},{wch:12}];for(let i=0;i<range.days;i++)colWidths.push({wch:9.75});wsGantt['!cols']=colWidths;
 list.forEach((t,rowIndex)=>{const tStart=parseDate(t.start),tEnd=endDate(t),excelRowIndex=rowIndex+2;let hexColor='FF00FF';if(t.status==='Em andamento')hexColor='4EE1C1';if(t.status==='Não iniciada')hexColor='9BA8B4';if(t.status==='Cancelada')hexColor='FF5C68';for(let colIndex=0;colIndex<range.days;colIndex++){const currentDate=addDays(range.start,colIndex);if(tStart&&tEnd&&currentDate>=tStart&&currentDate<=tEnd){const cellAddress=XLSX.utils.encode_cell({r:excelRowIndex-1,c:6+colIndex});if(!wsGantt[cellAddress])wsGantt[cellAddress]={v:'',t:'s'};wsGantt[cellAddress].s={fill:{patternType:'solid',fgColor:{rgb:hexColor}},border:{top:{style:'thin',color:{rgb:'CCCCCC'}},bottom:{style:'thin',color:{rgb:'CCCCCC'}},left:{style:'thin',color:{rgb:'CCCCCC'}},right:{style:'thin',color:{rgb:'CCCCCC'}}}}}}});
 XLSX.utils.book_append_sheet(wb,wsGantt,'Gantt Visual');XLSX.writeFile(wb,`${sanitizeFileName(activeProfile.name)}_Cronograma.xlsx`)
}
function exportImage(){if(typeof html2canvas==='undefined'){alert('Biblioteca de captura indisponível.');return}const btn=document.getElementById('exportImage');btn.textContent='Gerando imagem...';btn.disabled=true;const table=document.getElementById('ganttTable'),savedZoom=zoom;table.style.zoom=1;html2canvas(table,{backgroundColor:'#10151b',scale:2,scrollX:0,scrollY:0}).then(canvas=>{const link=document.createElement('a');link.download=`${sanitizeFileName(activeProfile.name)}_Cronograma.png`;link.href=canvas.toDataURL('image/png');link.click()}).finally(()=>{table.style.zoom=savedZoom;btn.textContent='Exportar como imagem';btn.disabled=false})}

function openProjects(){
 const backdrop=document.createElement('div');backdrop.className='modal-backdrop';
 const projectRows=activeProfile.projects.map(p=>`<div class="modal-row ${p.id===activeProjectId?'active':''}"><div class="modal-row-main"><strong>${esc(p.name)}</strong><small>${esc(p.description||'Sem descrição')} • ${p.tasks.length} tarefa(s)</small></div><div class="modal-row-actions"><button class="btn" data-action="open" data-id="${esc(p.id)}">Abrir</button><button class="btn" data-action="rename" data-id="${esc(p.id)}">Renomear</button><button class="btn" data-action="duplicate" data-id="${esc(p.id)}">Duplicar</button>${activeProfile.projects.length>1?`<button class="btn danger" data-action="delete" data-id="${esc(p.id)}">Excluir</button>`:''}</div></div>`).join('');
 backdrop.innerHTML=`<div class="modal wide"><h3>Projetos de ${esc(activeProfile.name)}</h3><div class="modal-toolbar"><button class="btn primary" id="newProject">＋ Novo projeto</button><button class="btn" id="closeProjects">Fechar</button></div><div class="modal-list">${projectRows}</div><p class="profile-current">Cada perfil possui seus próprios projetos, tarefas e backups.</p></div>`;
 document.body.appendChild(backdrop);
 backdrop.querySelector('#closeProjects').onclick=()=>backdrop.remove();
 backdrop.querySelector('#newProject').onclick=()=>{const name=prompt('Nome do novo projeto:','Novo projeto');if(!name?.trim())return;const desc=prompt('Descrição do projeto:','');const project={id:uid('project'),name:name.trim(),description:(desc||'').trim(),tasks:[]};activeProfile.projects.push(project);activeProjectId=project.id;syncCurrentSelection();save();renderFilter();render();backdrop.remove()};
 backdrop.querySelectorAll('[data-action]').forEach(btn=>btn.onclick=()=>{
   const action=btn.dataset.action,id=btn.dataset.id,project=activeProfile.projects.find(p=>p.id===id);if(!project)return;
   if(action==='open'){activeProjectId=id;syncCurrentSelection();save();renderFilter();render();backdrop.remove()}
   if(action==='rename'){const name=prompt('Novo nome do projeto:',project.name);if(!name?.trim())return;project.name=name.trim();save();render();openProjects();backdrop.remove()}
   if(action==='duplicate'){const copy=clone(project);copy.id=uid('project');copy.name=`${project.name} (cópia)`;copy.tasks=copy.tasks.map(t=>({...t,id:Date.now()+Math.floor(Math.random()*1000000)}));activeProfile.projects.push(copy);activeProjectId=copy.id;syncCurrentSelection();save();renderFilter();render();backdrop.remove()}
   if(action==='delete'){if(activeProfile.projects.length<=1){alert('O perfil precisa ter pelo menos um projeto.');return}if(!confirm(`Excluir o projeto “${project.name}”?`))return;activeProfile.projects=activeProfile.projects.filter(p=>p.id!==id);if(activeProjectId===id)activeProjectId=activeProfile.projects[0].id;syncCurrentSelection();save();renderFilter();render();backdrop.remove()}
 });
}

function openProfiles(){
 const backdrop=document.createElement('div');backdrop.className='modal-backdrop';
 const rows=profiles.map(p=>`<div class="modal-row ${p.id===activeProfileId?'active':''}"><div class="modal-row-main"><strong>${esc(p.name)}</strong><small>${p.projects.length} projeto(s) • ${p.projects.reduce((n,pr)=>n+pr.tasks.length,0)} tarefa(s)</small></div><div class="modal-row-actions"><button class="btn" data-profile-action="switch" data-id="${esc(p.id)}">Entrar</button><button class="btn" data-profile-action="rename" data-id="${esc(p.id)}">Renomear</button>${profiles.length>1?`<button class="btn danger" data-profile-action="delete" data-id="${esc(p.id)}">Excluir</button>`:''}</div></div>`).join('');
 backdrop.innerHTML=`<div class="modal wide"><h3>Perfis locais</h3><div class="modal-toolbar"><button class="btn primary" id="newProfile">＋ Novo perfil</button><button class="btn" id="closeProfiles">Fechar</button></div><div class="modal-section"><h4>Perfil ativo</h4><strong>${esc(activeProfile.name)}</strong><div class="profile-current">Os dados de cada perfil ficam separados neste navegador.</div></div><div class="modal-section"><h4>Seus perfis</h4><div class="modal-list">${rows}</div></div><p class="profile-current">Use “Backup do perfil” para levar somente os dados deste perfil para outro navegador ou computador.</p></div>`;
 document.body.appendChild(backdrop);
 backdrop.querySelector('#closeProfiles').onclick=()=>backdrop.remove();
 backdrop.querySelector('#newProfile').onclick=()=>{const name=prompt('Nome do novo perfil:','Meu perfil');if(!name?.trim())return;const project={id:uid('project'),name:'Meu projeto',description:'Cronograma principal',tasks:[]};const p={id:uid('profile'),name:name.trim(),projects:[project],activeProjectId:project.id};profiles.push(p);activeProfileId=p.id;activeProfile=p;activeProjectId=project.id;activeProject=project;tasks=project.tasks;persistProfiles();renderFilter();render();backdrop.remove()};
 backdrop.querySelectorAll('[data-profile-action]').forEach(btn=>btn.onclick=()=>{
   const action=btn.dataset.profileAction,id=btn.dataset.id,p=profiles.find(x=>x.id===id);if(!p)return;
   if(action==='switch'){forceSave();activeProfileId=id;activeProfile=p;activeProjectId=p.activeProjectId||p.projects[0].id;syncCurrentSelection();persistProfiles();renderFilter();render();backdrop.remove()}
   if(action==='rename'){const name=prompt('Novo nome do perfil:',p.name);if(!name?.trim())return;p.name=name.trim();persistProfiles();renderFilter();openProfiles();backdrop.remove()}
   if(action==='delete'){if(profiles.length<=1){alert('O Blume precisa ter pelo menos um perfil.');return}if(!confirm(`Excluir o perfil “${p.name}” e todos os seus projetos?`))return;profiles=profiles.filter(x=>x.id!==id);if(activeProfileId===id){activeProfileId=profiles[0].id;activeProfile=profiles[0];activeProjectId=activeProfile.activeProjectId||activeProfile.projects[0].id;syncCurrentSelection()}persistProfiles();renderFilter();render();backdrop.remove()}
 });
}

document.getElementById('addTask').onclick=addTask;
document.getElementById('filterOwner').onchange=render;
document.getElementById('filterStatus').onchange=render;
document.getElementById('profileManager').onclick=openProfiles;
document.getElementById('projectManager').onclick=openProjects;
document.getElementById('saveNow').onclick=manualSave;
document.getElementById('downloadBackup').onclick=downloadBackup;
document.getElementById('restoreBackup').onclick=()=>document.getElementById('backupFileInput').click();
document.getElementById('backupFileInput').addEventListener('change',e=>{const file=e.target.files?.[0];restoreBackup(file);e.target.value=''})
document.getElementById('reset').onclick=()=>{if(confirm('Restaurar as tarefas padrão deste projeto?')){tasks=clone(DEFAULT_TASKS);activeProject.tasks=tasks;save();renderFilter();render()}};
document.getElementById('fit').onclick=fit;
document.getElementById('zoomIn').onclick=()=>{zoom=Math.min(1.5,zoom+.1);applyZoom()};
document.getElementById('zoomOut').onclick=()=>{zoom=Math.max(.4,zoom-.1);applyZoom()};
document.getElementById('exportExcel').onclick=exportExcel;
document.getElementById('exportImage').onclick=exportImage;

document.getElementById('ganttBody').addEventListener('input',e=>{
 const field=e.target.dataset.field;if(!field)return;const row=e.target.closest('tr');if(!row)return;
 if(['name','start','duration'].includes(field)){
   const id=Number(row.dataset.id),task=tasks.find(t=>t.id===id);if(!task)return;
   if(field==='duration'){const raw=e.target.value;task.duration=raw===''?'':Math.max(1,Math.min(3650,parseInt(raw,10)||1));hasUnsavedChanges=true;queueSave()}
   else if(field==='name'){task.name=e.target.value;hasUnsavedChanges=true;queueSave()}
   else if(field==='start'){const normalized=normalizeStart(e.target.value);if(normalized){task.start=normalized;hasUnsavedChanges=true;queueSave()}}
 }
});
document.getElementById('ganttBody').addEventListener('change',e=>{const field=e.target.dataset.field;if(!field)return;const row=e.target.closest('tr');if(!row)return;updateTask(Number(row.dataset.id),field,e.target.value,true)});
document.getElementById('ganttBody').addEventListener('click',e=>{if(e.target.classList.contains('delete'))deleteTask(Number(e.target.closest('tr').dataset.id))});
window.addEventListener('resize',()=>{clearTimeout(window.__fit);window.__fit=setTimeout(()=>{syncStickyWidths();fit()},180)});
window.addEventListener('pagehide',forceSave);window.addEventListener('beforeunload',forceSave);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')forceSave()});window.addEventListener('blur',()=>{if(hasUnsavedChanges)forceSave()});
document.getElementById('todayDisplay').textContent='Hoje: '+new Date().toLocaleDateString('pt-BR');
renderFilter();render();
