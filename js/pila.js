/* ---------- TDA Pila (último en entrar, primero en salir) ---------- */
class Pila{
  #items = [];
  push(x){ this.#items.push(x); }
  pop(){ return this.#items.pop(); }
  peek(){ return this.#items[this.#items.length-1]; }
  estaVacia(){ return this.#items.length === 0; }
  get elementos(){ return [...this.#items]; }   // copia de solo lectura para dibujar
}

/* ---------- Algoritmo de equilibrado ---------- */
const PAREJAS  = { ')':'(', ']':'[', '}':'{', '?':'¿', '!':'¡', '/':'\\' };   // cierre -> apertura correspondiente
const APERTURAS = new Set(['(','[','{','¿','¡','\\']);
const CIERRES   = new Set([')',']','}','?','!','/']);
const SIMETRICOS = new Set(['"', "'"]);   // mismo carácter abre y cierra: alterna según la cima de la pila

// Analiza la cadena y devuelve un objeto de resultado.
// Registra cada paso para poder reproducirlo visualmente.
function analizarEquilibrado(cadena){
  const pila = new Pila();
  const pasos = [];   // {i, char, accion, pila}
  let error = null;   // {i, tipo, mensaje}

  for(let i=0; i<cadena.length && !error; i++){
    const c = cadena[i];
    if(SIMETRICOS.has(c)){
      if(!pila.estaVacia() && pila.peek() === c){
        pila.pop();
        pasos.push({i, char:c, accion:'extraer', pila:pila.elementos});
      }else{
        pila.push(c);
        pasos.push({i, char:c, accion:'apilar', pila:pila.elementos});
      }
    }else if(APERTURAS.has(c)){
      pila.push(c);
      pasos.push({i, char:c, accion:'apilar', pila:pila.elementos});
    }else if(CIERRES.has(c)){
      if(pila.estaVacia()){
        error = {i, tipo:'cierre-sin-apertura', mensaje:`Cierre «${c}» sin apertura previa`};
        pasos.push({i, char:c, accion:'error', pila:pila.elementos});
      }else if(pila.peek() === PAREJAS[c]){
        pila.pop();
        pasos.push({i, char:c, accion:'extraer', pila:pila.elementos});
      }else{
        error = {i, tipo:'no-coincide', mensaje:`Se esperaba cerrar «${pila.peek()}» pero llegó «${c}»`};
        pasos.push({i, char:c, accion:'error', pila:pila.elementos});
      }
    }else{
      pasos.push({i, char:c, accion:'ignorar', pila:pila.elementos});
    }
  }

  if(!error && !pila.estaVacia()){
    error = {i:cadena.length, tipo:'apertura-sin-cerrar',
             mensaje:`Quedaron ${pila.elementos.length} apertura(s) sin cerrar`};
  }

  return { equilibrado: !error, error, pasos, cadena };
}

/* ---------- Interfaz del módulo Pila ---------- */
const P = {
  input:   document.getElementById('pila-input'),
  tape:    document.getElementById('pila-tape'),
  stack:   document.getElementById('pila-stack'),
  log:     document.getElementById('pila-log'),
  verdict: document.getElementById('pila-verdict'),
  stepTimer:null
};

function dibujarPila(elementos){
  P.stack.innerHTML = '';
  if(elementos.length === 0){
    P.stack.innerHTML = '<div class="empty">vacía</div>';
    return;
  }
  elementos.forEach((c, idx) => {
    const div = document.createElement('div');
    div.className = 'cell' + (idx === elementos.length-1 ? ' top' : '');
    div.textContent = c;
    P.stack.appendChild(div);
  });
}

function dibujarCinta(cadena, curIdx, doneUpTo, badIdx){
  P.tape.innerHTML = '';
  if(cadena.length === 0){
    P.tape.innerHTML = '<span style="color:var(--muted);font-family:var(--sans);font-size:13px">expresión vacía</span>';
    return;
  }
  [...cadena].forEach((c, i) => {
    const s = document.createElement('span');
    s.className = 'ch';
    if(i === badIdx) s.classList.add('bad');
    else if(i === curIdx) s.classList.add('cur');
    else if(i < doneUpTo) s.classList.add('done');
    s.textContent = c;
    P.tape.appendChild(s);
  });
}

function mostrarVeredicto(res){
  P.verdict.className = 'verdict show ' + (res.equilibrado ? 'ok' : 'err');
  if(res.equilibrado){
    P.verdict.innerHTML = ' Expresión equilibrada. La pila quedó vacía al terminar.';
  }else{
    const pos = res.error.i < res.cadena.length ? `posición ${res.error.i}` : 'final de la cadena';
    P.verdict.innerHTML = `<b>Error</b> — ${res.error.mensaje} (${pos}).`;
  }
}

function analizarInstantaneo(){
  detenerPasos();
  const cadena = P.input.value;
  const res = analizarEquilibrado(cadena);
  const badIdx = res.error && res.error.i < cadena.length ? res.error.i : -1;
  dibujarCinta(cadena, -1, cadena.length, badIdx);
  const ult = res.pasos[res.pasos.length-1];
  dibujarPila(res.error && res.error.tipo==='apertura-sin-cerrar' && ult ? ult.pila
              : (badIdx>=0 && ult ? ult.pila : []));
  P.log.textContent = `${res.pasos.length} carácteres procesados`;
  mostrarVeredicto(res);
}

function reproducirPasos(){
  detenerPasos();
  const cadena = P.input.value;
  const res = analizarEquilibrado(cadena);
  P.verdict.className = 'verdict';
  let k = 0;
  const paso = () => {
    if(k >= res.pasos.length){
      const badIdx = res.error && res.error.i < cadena.length ? res.error.i : -1;
      dibujarCinta(cadena, -1, cadena.length, badIdx);
      mostrarVeredicto(res);
      P.stepTimer = null;
      return;
    }
    const p = res.pasos[k];
    dibujarCinta(cadena, p.i, p.i, p.accion==='error'?p.i:-1);
    dibujarPila(p.pila);
    const etiqueta = {apilar:'apilar (push)',extraer:'extraer (pop)',ignorar:'ignorar',error:'ERROR'}[p.accion];
    P.log.textContent = `[${p.i}] «${p.char}» → ${etiqueta}`;
    k++;
    P.stepTimer = setTimeout(paso, 1100);
  };
  paso();
}

function detenerPasos(){ if(P.stepTimer){ clearTimeout(P.stepTimer); P.stepTimer=null; } }

function reiniciarPila(){
  detenerPasos();
  P.input.value = '';
  dibujarCinta('', -1, 0, -1);
  dibujarPila([]);
  P.log.textContent = '';
  P.verdict.className = 'verdict';
  P.input.focus();
}

/* ---------- Eventos ---------- */
document.getElementById('pila-check').addEventListener('click', analizarInstantaneo);
document.getElementById('pila-step').addEventListener('click', reproducirPasos);
document.getElementById('pila-reset').addEventListener('click', reiniciarPila);
P.input.addEventListener('keydown', e => { if(e.key==='Enter') analizarInstantaneo(); });
document.getElementById('pila-examples').addEventListener('click', e => {
  if(e.target.classList.contains('chip')){
    P.input.value = e.target.textContent;
    analizarInstantaneo();
  }
});
