// Cargar la malla desde malla.json al iniciar
fetch('malla.json')
  .then(res => res.json())
  .then(data => {
    window.mallaData = data;
    renderMalla(); // Dibuja la malla con el progreso guardado
  });

const mallaContainer = document.getElementById('malla');
const resetButton = document.getElementById('reset-btn');

// Cargar ramos aprobados del localStorage o iniciar un set vacío
let aprobadas = new Set(JSON.parse(localStorage.getItem('ramosAprobadosUChile')) || []);

// Lógica del botón para limpiar el progreso
resetButton.addEventListener('click', () => {
  if (confirm('¿Estás seguro de que quieres limpiar todo tu progreso? Esta acción no se puede deshacer.')) {
    aprobadas.clear();
    localStorage.removeItem('ramosAprobadosUChile');
    renderMalla();
  }
});

// Función para guardar el progreso en el navegador
function guardarProgreso() {
  localStorage.setItem('ramosAprobadosUChile', JSON.stringify([...aprobadas]));
}

// --- FUNCIÓN PRINCIPAL ACTUALIZADA ---
function renderMalla() {
  mallaContainer.innerHTML = '';

  // Bucle 1: Itera sobre cada AÑO del archivo JSON
  window.mallaData.forEach(año => {
    const añoContainer = document.createElement('div');
    añoContainer.classList.add('año-wrapper'); // Contenedor para el título y los semestres de un año

    // Crea y añade el título del año (ej: "Primer Año")
    const añoTitulo = document.createElement('h2');
    añoTitulo.classList.add('año-titulo');
    añoTitulo.textContent = año.año;
    añoContainer.appendChild(añoTitulo);

    const semestresWrapper = document.createElement('div');
    semestresWrapper.classList.add('semestres-wrapper');

    // Bucle 2: Itera sobre los SEMESTRES dentro del año actual
    año.semestres.forEach(semestre => {
      const divSemestre = document.createElement('div');
      divSemestre.classList.add('trimestre'); // Reutilizamos la clase CSS

      const h2 = document.createElement('h2');
      h2.textContent = semestre.semestre;
      divSemestre.appendChild(h2);

      semestre.asignaturas.forEach(asig => {
        const divAsig = document.createElement('div');
        divAsig.classList.add('asignatura');

        const nombreAsignatura = document.createElement('span');
        nombreAsignatura.textContent = `${asig.nombre} (${asig.codigo})`;
        divAsig.appendChild(nombreAsignatura);

        const estaAprobada = aprobadas.has(asig.codigo);
        const puedeCursar = puedeDesbloquear(asig);

        if (estaAprobada) {
          divAsig.classList.add('aprobada');
        } else if (!puedeCursar) {
          divAsig.classList.add('bloqueado');
        }

        divAsig.onclick = (event) => {
          if (!puedeCursar && !estaAprobada) return;
          if (estaAprobada) {
            aprobadas.delete(asig.codigo);
          } else {
            aprobadas.add(asig.codigo);
            crearChispas(event.clientX, event.clientY);
          }
          guardarProgreso();
          renderMalla();
        };

        if (asig.req && asig.req.length > 0) {
          const tooltip = document.createElement('div');
          tooltip.className = 'tooltip';
          tooltip.textContent = 'Req: ' + asig.req.join(', ');
          divAsig.appendChild(tooltip);
        }
        divSemestre.appendChild(divAsig);
      });
      semestresWrapper.appendChild(divSemestre);
    });

    añoContainer.appendChild(semestresWrapper);
    mallaContainer.appendChild(añoContainer);
  });
}

// Función que revisa si los requisitos de un ramo están cumplidos
function puedeDesbloquear(asig) {
  if (!asig.req || asig.req.length === 0) {
    return true;
  }
  return asig.req.every(r => aprobadas.has(r));
}

// Función para crear las chispas mágicas
function crearChispas(x, y) {
  const cantidadDeChispas = 15;
  for (let i = 0; i < cantidadDeChispas; i++) {
    const chispa = document.createElement('div');
    chispa.classList.add('chispa');
    chispa.style.left = `${x}px`;
    chispa.style.top = `${y}px`;
    const randomX = (Math.random() - 0.5) * 200;
    const randomY = (Math.random() - 0.5) * 200;
    chispa.style.setProperty('--x', `${randomX}px`);
    chispa.style.setProperty('--y', `${randomY}px`);
    document.body.appendChild(chispa);
    setTimeout(() => {
      chispa.remove();
    }, 600);
  }
}