const taskManager = new TaskManager();

console.log("Instancia de TaskManager:", taskManager);
console.log("Tareas guardadas:", taskManager.tasks);
console.log("¿Es una instancia válida?", taskManager instanceof TaskManager);

const form = document.querySelector("#task-form");
const taskList = document.querySelector("#task-list");
const taskName = document.querySelector("#task-name");
const taskCategory = document.querySelector("#task-category");
const taskPriority = document.querySelector("#task-priority");
const taskDescription = document.querySelector("#task-description");
const taskStartDate = document.querySelector("#task-start-date");
const taskEndDate = document.querySelector("#task-end-date");
const filterCategory = document.querySelector("#filter-category");
const filterPriority = document.querySelector("#filter-priority");
const filterStatus = document.querySelector("#filter-status");

if (typeof flatpickr !== "undefined") {
    const configFlatpickr = {
        locale: "es",
        dateFormat: "Y-m-d",
        minDate: "today",
        disableMobile: "true"
    };

    if (taskStartDate) flatpickr(taskStartDate, configFlatpickr);
    if (taskEndDate) flatpickr(taskEndDate, configFlatpickr);
}

const today = new Date().toISOString().split('T')[0];
if (taskStartDate) taskStartDate.setAttribute('min', today);
if (taskEndDate) taskEndDate.setAttribute('min', today);

if (!form) {
    console.error("No se encontró el formulario #task-form.");
}

if (!taskList) {
    console.error("No se encontró el contenedor #task-list.");
}

function escapeHtml(value) {
    const element = document.createElement("div");
    element.textContent = value;
    return element.innerHTML;
}

function validateTaskData(data) {
    if (!data.name.trim()) {
        return "Añade un título a la tarea.";
    }

    if (!data.category.trim()) {
        return "Selecciona una categoría.";
    }

    if (!data.priority.trim()) {
        return "Selecciona la prioridad de la tarea.";
    }

    if (!data.description.trim()) {
        return "Añade la descripción de la tarea.";
    }

    if (!data.startDate.trim()) {
        return "Selecciona la fecha de inicio.";
    }

    if (!data.dueDate.trim()) {
        return "Selecciona la fecha de finalización.";
    }

    if (
        data.startDate.trim() &&
        data.dueDate.trim() &&
        data.startDate > data.dueDate
    ) {
        return "La fecha de inicio no puede ser posterior a la fecha final.";
    }
    return null;
}

function normalizeTaskStatus(task) {
    if (task.completed) {
        return "FINALIZADO";
    }
    if (
        task.status === "POR HACER" ||
        task.status === "EN PROGRESO" ||
        task.status === "FINALIZADO"
    ) {
        return task.status;
    }
    return "POR HACER";
}

function populateFilters() {
    if (!filterCategory || !filterPriority || !filterStatus) {
        return;
    }

    const selectedCategory = filterCategory.value;
    const selectedPriority = filterPriority.value;
    const selectedStatus = filterStatus.value;

    const categories = [...new Set(taskManager.tasks.map(task => task.category).filter(category => category))];
    const priorities = [...new Set(taskManager.tasks.map(task => task.priority).filter(priority => priority))];
    const statuses = [...new Set(taskManager.tasks.map(task => normalizeTaskStatus(task)))];

    filterCategory.innerHTML = `<option value="">Categoría</option>`;
    filterPriority.innerHTML = `<option value="">Prioridad</option>`;
    filterStatus.innerHTML = `<option value="">Estado</option>`;
    categories.forEach(category => {
        filterCategory.innerHTML += `
            <option value="${escapeHtml(category)}">
                ${escapeHtml(category)}
            </option>`;
    });
    priorities.forEach(priority => {
        const priorityNames = {
            "1": "Baja",
            "2": "Media",
            "3": "Alta"
        };
        filterPriority.innerHTML += `
            <option value="${escapeHtml(priority)}">
                ${priorityNames[priority] || escapeHtml(priority)}
            </option>`;
    });
    statuses.forEach(status => {
        filterStatus.innerHTML += `
            <option value="${escapeHtml(status)}">
                ${escapeHtml(status)}
            </option>`;
    });

    filterCategory.value = selectedCategory;
    filterPriority.value = selectedPriority;
    filterStatus.value = selectedStatus;
}

function getFilteredTasks() {
    const category = filterCategory?.value || "";
    const priority = filterPriority?.value || "";
    const status = filterStatus?.value || "";

const filtered = taskManager.tasks.filter(task => {
        const taskStatus = normalizeTaskStatus(task);
        const matchesCategory = !category || task.category === category;
        const matchesPriority = !priority || task.priority === priority;
        const matchesStatus = !status || taskStatus === status;

        return matchesCategory && matchesPriority && matchesStatus;
    });
    return filtered.sort((a, b) => Number(b.priority) - Number(a.priority));
}

function createTaskElement(task) {
    const taskElement = document.createElement("li");
    const status = normalizeTaskStatus(task);
    const isTaskCreatePage = document.querySelector("#task-form") !== null;

    taskElement.className = `list-group-item prioridad-${task.priority} estado-${status.replace(" ", "-").toLowerCase()}`;
    taskElement.dataset.taskId = task.id;

    if (isTaskCreatePage) {
        taskElement.innerHTML = `
            <span>${escapeHtml(task.name)}</span>
            <div class="actions">
                <button type="button" class="btn btn-secondary task-details">Detalles</button>
                <button type="button" class="btn btn-danger delete-button">Eliminar</button>
            </div>`;
    } else {
        const completedClass = task.completed ? "completed" : "";
        const checkedAttribute = task.completed ? "checked" : "";
        taskElement.innerHTML = `
        <div class="form-check form-switch">
            <input
                type="checkbox"
                class="form-check-input task-toggle"
                ${checkedAttribute}
                aria-label="Marcar tarea como completada">
        </div>
        <span class="${completedClass}">
            ${escapeHtml(task.name)}
        </span>

        <select
            class="form-select task-status"
            aria-label="Cambiar estado de la tarea">
            <option value="POR HACER" ${status === "POR HACER" ? "selected" : ""}>
                Por hacer
            </option>

            <option value="EN PROGRESO" ${status === "EN PROGRESO" ? "selected" : ""}>
                En progreso
            </option>

            <option value="FINALIZADO" ${status === "FINALIZADO" ? "selected" : ""}>
                Finalizado
            </option>
        </select>

        <button type="button" class="btn btn-secondary task-details">
            Detalles
        </button>
        <button type="button" class="btn btn-danger delete-button">
            Eliminar
        </button>`;
    }
    return taskElement;
}

function renderTasks() {
    if (!taskList) {
        return;
    }

    populateFilters();

    const filteredTasks = getFilteredTasks();
    const isTaskCreatePage = document.querySelector("#task-form") !== null;
    taskList.innerHTML = "";

    if (filteredTasks.length === 0) {
        taskList.innerHTML = `<li class="list-group-item empty-task-message">No hay tareas.</li>`;
        return;
    }
    if (isTaskCreatePage) {
        filteredTasks = filteredTasks.reverse().slice(0, 4);
    }

    filteredTasks.forEach(task => {
        taskList.appendChild(createTaskElement(task));
    });
}

function showMessage(title, text, icon) {
    if (typeof Swal !== "undefined") {
        Swal.fire({
            title,
            text,
            icon
        });
        return;
    }
    alert(`${title}\n${text}`);
}

if (form) {
    form.addEventListener("submit", event => {
        event.preventDefault();
        const taskData = {
            name: taskName.value.trim(),
            category: taskCategory.value,
            priority: taskPriority.value,
            description: taskDescription.value.trim(),
            startDate: taskStartDate.value,
            dueDate: taskEndDate.value
        };

        const errorMessage = validateTaskData(taskData);
        if (errorMessage) {
            showMessage("Datos inválidos", errorMessage, "error");
            return;
        }

        taskManager.addTask(
            taskData.name,
            taskData.category,
            taskData.priority,
            taskData.description,
            taskData.startDate,
            taskData.dueDate
        );
        renderTasks();
        form.reset();
        showMessage("Tarea creada", "La tarea se ha creado correctamente.", "success");
    });
}

if (taskList) {
    taskList.addEventListener("change", event => {
        const taskElement = event.target.closest("[data-task-id]");
        if (!taskElement) {
            return;
        }

        const taskId = Number(taskElement.dataset.taskId);
        const task = taskManager.getTaskById(taskId);

        if (!task) {
            console.warn("No se encontró la tarea seleccionada.");
            return;
        }

        if (event.target.classList.contains("task-toggle")) {
            const completed = event.target.checked;

            taskManager.updateTaskStatus(taskId, completed);
            renderTasks();

            return;
        }

        if (event.target.classList.contains("task-status")) {
            const newStatus = event.target.value;
            const completed = newStatus === "FINALIZADO";

            taskManager.updateTask(taskId, {
                status: newStatus,
                completed
            });

            renderTasks();
        }
    });

    taskList.addEventListener("click", event => {
        const taskElement = event.target.closest("[data-task-id]");

        if (!taskElement) {
            return;
        }

        const taskId = Number(taskElement.dataset.taskId);
        const task = taskManager.getTaskById(taskId);
        if (!task) {
            console.warn("No se encontró la tarea seleccionada.");
            return;
        }

        const deleteButton = event.target.closest(".delete-button");
        if (deleteButton) {
            deleteTaskFromInterface(deleteButton);
            return;
        }
        const detailsButton = event.target.closest(".task-details");
        if (!detailsButton) {
            return;
        }
        showTaskDetails(task);
    });
}

if (filterCategory && filterPriority && filterStatus) {
    filterCategory.addEventListener("change", renderTasks);
    filterPriority.addEventListener("change", renderTasks);
    filterStatus.addEventListener("change", renderTasks);
}

function deleteTaskFromInterface(deleteButton) {
    const parentTask = deleteButton.closest("[data-task-id]");

    if (!parentTask) {
        console.warn("No se encontró el contenedor de la tarea.");
        return;
    }

    const taskId = Number(parentTask.dataset.taskId);

    if (!Number.isInteger(taskId)) {
        console.warn("El identificador de la tarea no es válido.");
        return;
    }

    const task = taskManager.getTaskById(taskId);
    if (!task) {
        console.warn(`No existe una tarea con el ID ${taskId}.`);
        return;
    }

    const confirmDelete = confirm(`¿Quieres eliminar la tarea "${task.name}"?`);
    if (!confirmDelete) {
        return;
    }

    const taskWasDeleted = taskManager.deleteTask(taskId);
    if (!taskWasDeleted) {
        showMessage("No se pudo eliminar", "La tarea no fue encontrada.", "error");
        return;
    }
    renderTasks();
    showMessage("Tarea eliminada", "La tarea se eliminó correctamente.", "success");
}

function showTaskDetails(task) {
    const detailsModalElement = document.querySelector("#task-details-modal");
    if (!detailsModalElement) {
        const detailsText = `
                Nombre: ${task.name}
                Categoría: ${task.category}
                Prioridad: ${task.priority}
                Descripción: ${task.description}
                Fecha de inicio: ${task.startDate}
                Fecha final: ${task.dueDate}
                Estado: ${task.status} `.trim();

        showMessage("Detalles de la tarea", detailsText, "info");
        return;
    }

    const modalName = detailsModalElement.querySelector("#modal-task-name");
    const modalDescription = detailsModalElement.querySelector(
        "#modal-task-description"
    );
    const modalCategory = detailsModalElement.querySelector(
        "#modal-task-category"
    );
    const modalPriority = detailsModalElement.querySelector(
        "#modal-task-priority"
    );
    const modalStartDate = detailsModalElement.querySelector(
        "#modal-task-start-date"
    );
    const modalEndDate = detailsModalElement.querySelector(
        "#modal-task-end-date"
    );
    const modalStatus = detailsModalElement.querySelector(
        "#modal-task-status"
    );

    const priorityNames = {
        "1": "Baja",
        "2": "Media",
        "3": "Alta"
    };

    if (modalName) {
        modalName.textContent = task.name;
    }

    if (modalDescription) {
        modalDescription.textContent = task.description;
    }

    if (modalCategory) {
        modalCategory.textContent = task.category;
    }

    if (modalPriority) {
        modalPriority.textContent = priorityNames[task.priority] || task.priority;
    }

    if (modalStartDate) {
        modalStartDate.textContent = task.startDate;
    }

    if (modalEndDate) {
        modalEndDate.textContent = task.dueDate;
    }

    if (modalStatus) {
        modalStatus.textContent = task.status;
    }

    if (
        typeof bootstrap !== "undefined" &&
        bootstrap.Modal
    ) {
        const modal = bootstrap.Modal.getOrCreateInstance(
            detailsModalElement
        );
        modal.show();
    }
}
renderTasks();