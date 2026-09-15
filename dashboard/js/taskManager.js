class TaskManager {
    constructor() {
        this.storageKey = "tasks";
        this.currentIdStorageKey = "currentId"
        this.tasks = this.loadTasks();
        this.currentId = this.loadCurrentId();
    }

    loadTasks() {
        const savedTasks = localStorage.getItem(this.storageKey);
        if (!savedTasks) {
            return [];
        }
        try {
            const parsedTasks = JSON.parse(savedTasks);
            if (!Array.isArray(parsedTasks)) {
                console.warn("Los datos guardados no tienen un formato válido.");
                return [];
            }
            return parsedTasks;
        } catch (error) {
            console.error("No se pudieron cargar las tareas:", error);
            return [];
        }
    }

    loadCurrentId(){
        const savedCurrentId = localStorage.getItem(this.currentIdStorageKey);
        if(savedCurrentId === null){
            return this.getNextId();
        }
        const currentId = Number(savedCurrentId);
        if (!Number.isInteger(currentId) || currentId <1) {
            console.warn("El currentId guardado no es válido.");
            return this.getNextId();
        }
        return currentId;
    }

    saveTasks() {
        try {
            localStorage.setItem(
                this.storageKey,
                JSON.stringify(this.tasks)
            );
            localStorage.setItem(
                this.currentIdStorageKey, 
                String(this.currentId)
            );
        } catch (error) {
            console.error("No se pudieron guardar las tareas:", error);
        }
    }

    getNextId() {
        if (this.tasks.length === 0) {
            return 1;
        }
        const ids = this.tasks
            .map(task => Number(task.id))
            .filter(id => Number.isInteger(id));
        if (ids.length === 0) {
            return 1;
        }
        return Math.max(...ids) + 1;
    }

    addTask(name, category, priority, description, startDate, dueDate) {
        const newTask = {
            id: this.currentId,
            name,
            category,
            priority,
            description,
            startDate,
            dueDate,
            status: "POR HACER",
            completed: false
        };

        this.tasks.push(newTask);
        this.currentId++;
        this.saveTasks();
        return newTask;
    }

    getTaskById(taskId) {
        return this.tasks.find(task => task.id === taskId);
    }

    updateTask(taskId, changes) {
        const task = this.getTaskById(taskId);
        if (!task) {
            console.warn(`No existe una tarea con el ID ${taskId}.`);
            return false;
        }
        Object.assign(task, changes);
        this.saveTasks();
        return true;
    }

    updateTaskStatus(taskId, completed) {
        const task = this.getTaskById(taskId);
        if (!task) {
            console.warn(`No existe una tarea con el ID ${taskId}.`);
            return false;
        }
        task.completed = completed;
        task.status = completed ? "FINALIZADO" : "POR HACER";
        this.saveTasks();
        return true;
    }

    deleteTask(taskId) {
        const newTasks = [];
        for (const task of this.tasks) {
            if (task.id !== taskId) {
                newTasks.push(task);
            }
        }
        const taskWasDeleted = newTasks.length !== this.tasks.length;
        this.tasks = newTasks;
        if (taskWasDeleted) {
            this.saveTasks();
        }
        return taskWasDeleted;
    }
}