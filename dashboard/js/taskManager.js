class TaskManager {
    constructor() {
        this.apiUrl = typeof API_BASE_URL !== "undefined"
            ? API_BASE_URL
            : "https://thyra-backend.onrender.com";
        this.tasks = [];
    }

    async loadTasks() {
        try {
            const response = await fetch(this.apiUrl);
            if (!response.ok) {
                throw new Error(`Error HTTP ${response.status}`);
            }
            this.tasks = await response.json();
            return this.tasks;
        } catch (error) {
            console.error("No se pudieron cargar las tareas:", error);
            this.tasks = [];
            throw error;
        }
    }

    getTaskById(taskId) {
        return this.tasks.find(task => task.id === taskId);
    }

    async addTask(name, category, priority, description, startDate, dueDate) {
        const newTask = {
            name,
            category,
            priority,
            description,
            startDate,
            dueDate,
            status: "POR HACER",
            completed: false
        };

        const response = await fetch(this.apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newTask)
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => null);
            throw new Error(errorBody?.message || `Error HTTP ${response.status}`);
        }

        const savedTask = await response.json();
        this.tasks.push(savedTask);
        return savedTask;
    }

    async updateTask(taskId, changes) {
        const task = this.getTaskById(taskId);
        if (!task) {
            console.warn(`No existe una tarea con el ID ${taskId}.`);
            return false;
        }

        const updatedPayload = { ...task, ...changes };

        const response = await fetch(`${this.apiUrl}/${taskId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedPayload)
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => null);
            throw new Error(errorBody?.message || `Error HTTP ${response.status}`);
        }

        const savedTask = await response.json();
        Object.assign(task, savedTask);
        return true;
    }

    async updateTaskStatus(taskId, completed) {
        const status = completed ? "FINALIZADO" : "POR HACER";
        return this.updateTask(taskId, { completed, status });
    }

    async deleteTask(taskId) {
        const response = await fetch(`${this.apiUrl}/${taskId}`, {
            method: "DELETE"
        });

        if (response.status === 404) {
            return false;
        }
        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}`);
        }

        this.tasks = this.tasks.filter(task => task.id !== taskId);
        return true;
    }
}