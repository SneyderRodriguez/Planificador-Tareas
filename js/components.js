async function cargarComponente(idContenedor, rutaArchivo) {
    const contenedor = document.getElementById(idContenedor);
    if (!contenedor) return;

    try {
        const respuesta = await fetch(rutaArchivo);
        if (!respuesta.ok) throw new Error(`No se pudo cargar: ${rutaArchivo}`);
        const contenido = await respuesta.text();
        contenedor.innerHTML = contenido;
    } catch (error) {
        console.error(error);
    }
}

function cargarEstiloUnaVez(rutaArchivo) {
    if (document.querySelector(`link[href="${rutaArchivo}"]`)) return;
    const enlace = document.createElement("link");
    enlace.rel = "stylesheet";
    enlace.href = rutaArchivo;
    document.head.appendChild(enlace);
}

async function iniciarComponentes() {
    // Detectamos en qué nivel de carpeta estamos viendo cómo se importó el script
    const scriptTag = document.querySelector('script[src*="components.js"]');
    const estamosEnDashboard = scriptTag && scriptTag.getAttribute('src').startsWith('../');
    
    // Configuramos la ruta base dependiendo de dónde estamos
    const rutaBase = estamosEnDashboard ? '../' : './';

    await cargarComponente(
        "aside-container",
        rutaBase + "components/aside.html"
    );

    // Pasamos las variables de ruta al evento para usarlas en la navegación
    document.dispatchEvent(new CustomEvent("componentesCargados", { 
        detail: { estamosEnDashboard, rutaBase } 
    }));
}

document.addEventListener("DOMContentLoaded", iniciarComponentes);

// Agregamos la lógica para conectar los botones de navegación de aside.html
document.addEventListener("componentesCargados", (evento) => {
    const { estamosEnDashboard, rutaBase } = evento.detail;

    // Seleccionamos los botones del aside
    const btnCrear = document.querySelector('.btn-task-create');
    const btnLista = document.querySelector('.btn-task-list');
    const btnPerfil = document.querySelector('.perfil a'); // Botón de inicio

    // Si estamos en dashboard, los HTML destino están al lado ('./')
    // Si estamos en la raíz, los HTML destino están en ('dashboard/')
    const rutaDashboard = estamosEnDashboard ? './' : 'dashboard/';

    // Conectar botón: Crear Tarea
    if (btnCrear) {
        btnCrear.addEventListener('click', () => {
            window.location.href = rutaDashboard + 'taskCreate.html';
        });
    }

    // Conectar botón: Tareas
    if (btnLista) {
        btnLista.addEventListener('click', () => {
            window.location.href = rutaDashboard + 'taskList.html';
        });
    }

    // Conectar botón del Perfil (Lo usamos para volver al Inicio / index.html)
    if (btnPerfil) {
        btnPerfil.addEventListener('click', (e) => {
            e.preventDefault(); // Prevenimos el "#" en la url
            window.location.href = rutaBase + 'index.html';
        });
    }
});