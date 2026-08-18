# Visualizador de TDA: Pila y Cola

Aplicación web que reúne dos ejercicios propuestos de estructuras de datos:

- **TDA Pila — Equilibrado de símbolos.** Verifica si los paréntesis, corchetes y llaves de una expresión están correctamente balanceados, con visualización paso a paso de la pila.
- **TDA Cola — Asignación de tareas.** Da de alta, elimina, muestra y procesa tareas, repartiéndolas entre *m* procesadores con la regla **SPT** (la tarea más corta primero) para minimizar el tiempo medio de finalización.

Todo corre en el navegador. No requiere servidor ni instalación.

## Cómo ejecutar

Abre `index.html` con doble clic, o desde un editor con "Live Server".

## Estructura del proyecto

```
.
├── index.html          Estructura y pestañas (compartido)
├── css/
│   └── estilos.css     Estilos (compartido)
└── js/
    ├── pila.js         Clase Pila, algoritmo de equilibrado e interfaz  → Persona A
    ├── cola.js         Clase Cola, operaciones y reparto SPT e interfaz → Persona B
    └── app.js          Pestañas y arranque (compartido)
```

## Notas conceptuales (para la sustentación)

- Las clases `Pila` y `Cola` usan campos privados (`#items`); por fuera solo se ven las operaciones del TDA, nunca el arreglo interno.
- El enunciado pide *minimizar el tiempo medio de finalización*: FIFO no lo logra, **SPT sí** (ordenar de menor a mayor duración).
- Con *n* procesadores para *n* tareas el problema se degenera (todo en paralelo); el caso interesante es *m* < *n*.
- Con un lote fijo de tareas conocidas, SPT no produce inanición: todas se ejecutan.
