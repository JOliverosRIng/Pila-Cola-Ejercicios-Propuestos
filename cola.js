/* ============================================================
   MÓDULO COLA  ·  Responsable: Persona B
   Asignación de tareas con un TDA Cola (FIFO) y reparto SPT.
   ============================================================ */

/* ---------- TDA Cola (primero en entrar, primero en salir) ---------- */
class Cola{
  #items = [];
  encolar(x){ this.#items.push(x); }
  desencolar(){ return this.#items.shift(); }
  frente(){ return this.#items[0]; }
  estaVacia(){ return this.#items.length === 0; }
  get elementos(){ return [...this.#items]; }
}

const colaTareas = new Cola();
let contadorAuto = 0;

const C = {
  id:    document.getElementById('cola-id'),
  dur:   document.getElementById('cola-dur'),
  tabla: document.getElementById('cola-tabla'),
  proc:  document.getElementById('cola-proc'),
  gantt: document.getElementById('cola-gantt'),
  ticks: document.getElementById('cola-ticks'),
  fin:   document.getElementById('cola-fin'),
  stats: document.getElementById('cola-stats'),
  res:   document.getElementById('cola-resultado')
};

/* ---------- Operación: dar de alta ---------- */
function darDeAlta(id, duracion){
  colaTareas.encolar({ id, duracion });
  mostrarCola();
}

/* ---------- Operación: eliminar (con cola auxiliar, respetando el TDA) ---------- */
function eliminarTarea(id){
  const aux = new Cola();
  while(!colaTareas.estaVacia()){
    const t = colaTareas.desencolar();
    if(t.id !== id) aux.encolar(t);
  }
  while(!aux.estaVacia()) colaTareas.encolar(aux.desencolar());
  mostrarCola();
}

/* ---------- Operación: mostrar ---------- */
function mostrarCola(){
  const items = colaTareas.elementos;
  if(items.length === 0){
    C.tabla.innerHTML = '<p class="queue-empty">La cola está vacía. Da de alta una tarea para empezar.</p>';
    return;
  }
  let html = '<table><thead><tr><th>Posición</th><th>Tarea</th><th class="mono">Duración tᵢ</th><th></th></tr></thead><tbody>';
  items.forEach((t, i) => {
    const etiqueta = i===0 ? ' (frente)' : (i===items.length-1 ? ' (final)' : '');
    html += `<tr>
      <td class="mono">${i+1}${etiqueta}</td>
      <td class="mono">${t.id}</td>
      <td class="mono">${t.duracion}</td>
      <td><button class="del" data-id="${t.id}">eliminar</button></td>
    </tr>`;
  });
  html += '</tbody></table>';
  C.tabla.innerHTML = html;
}

/* ---------- Operación: procesar — reparto SPT en m procesadores ---------- */
function procesar(){
  const items = colaTareas.elementos;
  if(items.length === 0){ alert('La cola está vacía. Da de alta al menos una tarea.'); return; }

  let m = parseInt(C.proc.value, 10);
  if(isNaN(m) || m < 1) m = 1;
  m = Math.min(m, items.length);   // más procesadores que tareas no aporta

  // 1) ordenar una COPIA por duración ascendente (SPT)
  const orden = [...items].sort((a,b) => a.duracion - b.duracion);

  // 2) m procesadores, cada uno con su "tiempo libre" y su lista de bloques
  const libres = Array.from({length:m}, () => 0);
  const tracks = Array.from({length:m}, () => []);
  const finals = [];   // {id, duracion, inicio, fin, proc}

  // 3) asignar cada tarea al procesador que se libere primero
  orden.forEach(t => {
    let p = 0;
    for(let k=1; k<m; k++) if(libres[k] < libres[p]) p = k;
    const inicio = libres[p];
    const fin = inicio + t.duracion;
    libres[p] = fin;
    tracks[p].push({ id:t.id, duracion:t.duracion, inicio, fin });
    finals.push({ id:t.id, duracion:t.duracion, inicio, fin, proc:p });
  });

  // 4) tiempo medio de finalización
  const sumaFin = finals.reduce((s,f) => s + f.fin, 0);
  const media = sumaFin / finals.length;
  const makespan = Math.max(...libres);

  dibujarResultado({ tracks, finals, media, sumaFin, makespan, m });
}

function dibujarResultado({tracks, finals, media, sumaFin, makespan, m}){
  C.res.style.display = 'block';

  // Gantt
  C.gantt.innerHTML = '';
  tracks.forEach((blocks, p) => {
    const proc = document.createElement('div');
    proc.className = 'proc';
    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = 'Proc ' + (p+1);
    const track = document.createElement('div');
    track.className = 'track';
    blocks.forEach(b => {
      const el = document.createElement('div');
      el.className = 'blk';
      el.style.left  = (b.inicio / makespan * 100) + '%';
      el.style.width = (b.duracion / makespan * 100) + '%';
      el.innerHTML = `${b.id}<small>&nbsp;(${b.duracion})</small>`;
      track.appendChild(el);
    });
    proc.appendChild(name); proc.appendChild(track);
    C.gantt.appendChild(proc);
  });

  // Ticks del eje (0 .. makespan)
  C.ticks.innerHTML = '';
  const nT = Math.min(makespan, 10);
  for(let k=0; k<=nT; k++){
    const val = Math.round(makespan * k / nT);
    const s = document.createElement('span');
    s.style.left = (val / makespan * 100) + '%';
    s.textContent = val;
    C.ticks.appendChild(s);
  }

  // Tabla de finalizaciones (en orden de ejecución SPT)
  let html = '<thead><tr><th>Orden</th><th>Tarea</th><th class="mono">tᵢ</th><th class="mono">Inicio</th><th class="mono">Proc</th><th class="mono">Finalización</th></tr></thead><tbody>';
  finals.forEach((f, i) => {
    html += `<tr class="finrow">
      <td class="mono">${i+1}</td>
      <td class="mono">${f.id}</td>
      <td class="mono">${f.duracion}</td>
      <td class="mono">${f.inicio}</td>
      <td class="mono">${f.proc+1}</td>
      <td class="fin">${f.fin}</td>
    </tr>`;
  });
  html += '</tbody>';
  C.fin.innerHTML = html;

  // Estadísticas
  C.stats.innerHTML = `
    <div class="stat"><div class="k">Procesadores</div><div class="v">${m}</div></div>
    <div class="stat"><div class="k">Σ finalizaciones</div><div class="v">${sumaFin}</div></div>
    <div class="stat"><div class="k">Tiempo medio</div><div class="v">${media.toFixed(2)}</div></div>
    <div class="stat"><div class="k">Makespan</div><div class="v">${makespan}</div></div>`;
}

/* ---------- Eventos ---------- */
document.getElementById('cola-add').addEventListener('click', () => {
  let id = C.id.value.trim();
  const dur = parseInt(C.dur.value, 10);
  if(isNaN(dur) || dur < 1){ alert('La duración debe ser un entero de 1 o más.'); C.dur.focus(); return; }
  if(!id){ id = 'T' + (++contadorAuto); }
  if(colaTareas.elementos.some(t => t.id === id)){ alert(`Ya existe una tarea con el identificador «${id}».`); C.id.focus(); return; }
  darDeAlta(id, dur);
  C.id.value = ''; C.dur.value = ''; C.id.focus();
});
C.dur.addEventListener('keydown', e => { if(e.key==='Enter') document.getElementById('cola-add').click(); });

C.tabla.addEventListener('click', e => {
  if(e.target.classList.contains('del')) eliminarTarea(e.target.dataset.id);
});

document.getElementById('cola-run').addEventListener('click', procesar);

document.getElementById('cola-demo').addEventListener('click', () => {
  while(!colaTareas.estaVacia()) colaTareas.desencolar();
  [['A',5],['B',2],['C',8],['D',1]].forEach(([id,d]) => colaTareas.encolar({id,duracion:d}));
  mostrarCola();
  C.res.style.display = 'none';
});
document.getElementById('cola-clear').addEventListener('click', () => {
  while(!colaTareas.estaVacia()) colaTareas.desencolar();
  mostrarCola();
  C.res.style.display = 'none';
});
