/* ============================================================
   APP  ·  Compartido (acordado por ambas personas)
   Control de las pestañas y arranque de la aplicación.
   Se carga después de pila.js y cola.js.
   ============================================================ */

/* ---------- Pestañas ---------- */
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.setAttribute('aria-selected','false'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    tab.setAttribute('aria-selected','true');
    document.getElementById('panel-' + tab.dataset.mod).classList.add('active');
    if(tab.dataset.mod === 'pila') detenerPasos();   // definido en pila.js
  });
});

/* ---------- Estado inicial ---------- */
analizarInstantaneo();   // pila.js
mostrarCola();           // cola.js
