class TaskManager {
    constructor() {
        // Carregar tarefas do localStorage ou iniciar com um array vazio
        const storedTasks = localStorage.getItem('tasks');
        this.tasks = storedTasks ? JSON.parse(storedTasks) : [
            {
                id: 1,
                title: "Exemplo de tarefa",
                description: "Esta é uma tarefa de exemplo para demonstração",
                priority: "medium",
                date: "2025-04-02",
                category: "work",
                completed: false,
                createdAt: new Date().toISOString()
            }
        ];

        this.currentFilter = 'all';
        this.editingTask = null;
        this.init();
    }

    // Método para salvar tarefas no localStorage
    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    // Método para adicionar uma nova tarefa
    addTask(task) {
        this.tasks.push(task);
        this.saveTasks(); // Atualiza o localStorage
    }

    // Método para remover uma tarefa
    removeTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.saveTasks(); // Atualiza o localStorage
    }

    // Método para marcar uma tarefa como concluída
    toggleTaskCompletion(taskId) {
        this.tasks = this.tasks.map(task => 
            task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        this.saveTasks(); // Atualiza o localStorage
    }

    // Método para editar uma tarefa
    editTask(updatedTask) {
        this.tasks = this.tasks.map(task => 
            task.id === updatedTask.id ? updatedTask : task
        );
        this.saveTasks(); // Atualiza o localStorage
    }
    
    init() {
        // Adicionar estilos CSS para o indicador de conclusão
        const style = document.createElement('style');
        style.textContent = `
            .completed-indicator {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                border: 2px solid var(--primary, #5e60ce);
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 15px;
                cursor: pointer;
                flex-shrink: 0;
                transition: all 0.2s ease;
                background-color: #fff;
            }
            
            .completed-indicator:hover {
                background-color: rgba(94, 96, 206, 0.1);
            }
            
            .task-item.completed .completed-indicator {
                background-color: var(--primary, #5e60ce);
                color: white;
            }
            
            .task-item.completed .task-title {
                text-decoration: line-through;
                color: #888;
            }
            
            .task-item.completed .task-details {
                opacity: 0.7;
            }
            
            .task-item {
                display: flex;
                align-items: center;
                padding: 15px;
                border-radius: 8px;
                background-color: #fff;
                margin-bottom: 12px;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            }
            
            .task-item:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            }
            
            .task-content {
                flex: 1;
            }
            
            .task-title {
                font-size: 16px;
                font-weight: 600;
                margin-bottom: 5px;
            }
            
            .task-details {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                font-size: 14px;
                color: #666;
            }
            
            .task-details span {
                display: flex;
                align-items: center;
            }
            
            .task-details i {
                margin-right: 5px;
            }
            
            .task-priority {
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 600;
            }
            
            .priority-high {
                background-color: rgba(230, 57, 70, 0.1);
                color: #e63946;
            }
            
            .priority-medium {
                background-color: rgba(244, 162, 97, 0.1);
                color: #f4a261;
            }
            
            .priority-low {
                background-color: rgba(42, 157, 143, 0.1);
                color: #2a9d8f;
            }
            
            .task-actions {
                display: flex;
                gap: 5px;
            }
            
            .action-btn {
                background: none;
                border: none;
                width: 32px;
                height: 32px;
                border-radius: 4px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background-color 0.2s ease;
            }
            
            .action-btn:hover {
                background-color: #f1f1f1;
            }
            
            .empty-tasks {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 40px 0;
                color: #888;
                text-align: center;
            }
        `;
        document.head.appendChild(style);
        
        // Inicializar formulário
        document.getElementById('task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.editingTask) {
                this.updateTask();
            } else {
                this.addTask();
            }
        });

        // Adicionar eventos para salvar automaticamente enquanto edita nos campos do formulário
        this.setupAutoSaveListeners();
        
        // Inicializar filtros
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelector('.filter-btn.active').classList.remove('active');
                btn.classList.add('active');
                this.currentFilter = btn.dataset.filter;
                this.renderTasks();
            });
        });
        
        // Adicionar botão de cancelar edição
        const cancelBtn = document.createElement('button');
        cancelBtn.id = 'cancel-edit-btn';
        cancelBtn.className = 'btn btn-secondary';
        cancelBtn.textContent = 'Cancelar';
        cancelBtn.style.display = 'none';
        cancelBtn.type = 'button';
        
        const submitBtn = document.querySelector('#task-form button[type="submit"]');
        submitBtn.parentNode.insertBefore(cancelBtn, submitBtn.nextSibling);
        
        cancelBtn.addEventListener('click', () => {
            this.cancelEdit();
        });
        
        // Criar div de confirmação de exclusão
        const deleteConfirmDiv = document.createElement('div');
        deleteConfirmDiv.id = 'delete-confirm';
        deleteConfirmDiv.className = 'delete-confirmation';
        deleteConfirmDiv.innerHTML = `
            <div class="delete-confirmation-content">
                <p>Excluir tarefa</p>
                <div class="delete-confirmation-buttons">
                    <button id="confirm-delete" class="btn btn-danger">Sim</button>
                    <button id="cancel-delete" class="btn btn-secondary">Não</button>
                </div>
            </div>
        `;
        deleteConfirmDiv.style.display = 'none';
        document.body.appendChild(deleteConfirmDiv);
        
        // Adicionar estilo para a div de confirmação
        const confirmStyle = document.createElement('style');
        confirmStyle.textContent = `
        .delete-confirmation {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(39, 40, 94, 0.75);
            backdrop-filter: blur(3px);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .delete-confirmation-content {
            background-color: #f8f8f8;
            padding: 24px 32px;
            border-radius: 12px;
            border-left: 4px solid #5e60ce;
            text-align: center;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
            max-width: 400px;
            width: 90%;
            animation: slideUp 0.3s ease;
            transform: translateY(0);
        }

        @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }

        .delete-confirmation-content p {
            font-size: 18px;
            margin-bottom: 20px;
            color: #333;
            font-weight: 500;
        }

        .delete-confirmation-buttons {
            display: flex;
            justify-content: center;
            gap: 16px;
        }

        .delete-confirmation-buttons button {
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: 600;
            border: none;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .delete-confirmation-buttons button:first-child {
            background-color: #e63946;
            color: white;
        }

        .delete-confirmation-buttons button:first-child:hover {
            background-color: #d62b3a;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(230, 57, 70, 0.3);
        }

        .delete-confirmation-buttons button:last-child {
            background-color: #f1f1f1;
            color: #333;
            border: 1px solid #ddd;
        }

        .delete-confirmation-buttons button:last-child:hover {
            background-color: #e9e9e9;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        `;
        document.head.appendChild(confirmStyle);
        
        // Renderizar tarefas iniciais
        this.renderTasks();
        this.updateStats();
    }

    // Novo método para configurar salvamento automático enquanto edita
    setupAutoSaveListeners() {
        if (this.editingTask) {
            const titleInput = document.getElementById('task-title');
            const descriptionInput = document.getElementById('task-description');
            const prioritySelect = document.getElementById('task-priority');
            const dateInput = document.getElementById('task-date');
            const categorySelect = document.getElementById('task-category');

            // Aplicar evento de input para cada campo
            titleInput.addEventListener('input', () => this.autoSaveEditingTask());
            descriptionInput.addEventListener('input', () => this.autoSaveEditingTask());
            prioritySelect.addEventListener('change', () => this.autoSaveEditingTask());
            dateInput.addEventListener('change', () => this.autoSaveEditingTask());
            categorySelect.addEventListener('change', () => this.autoSaveEditingTask());
        }
    }

    // Novo método para salvar automaticamente enquanto edita
    autoSaveEditingTask() {
        if (!this.editingTask) return;
        
        const title = document.getElementById('task-title').value.trim();
        if (!title) return; // Não salva se o título estiver vazio
        
        const priority = document.getElementById('task-priority').value;
        const date = document.getElementById('task-date').value;
        const category = document.getElementById('task-category').value;
        const description = document.getElementById('task-description').value.trim();
        
        // Atualizar tarefa com novos valores
        this.editingTask.title = title;
        this.editingTask.description = description;
        this.editingTask.priority = priority;
        this.editingTask.date = date;
        this.editingTask.category = category;
        
        this.saveTasks(); // Atualiza o localStorage imediatamente
    }
    
    addTask() {
        const title = document.getElementById('task-title').value.trim();
        const priority = document.getElementById('task-priority').value;
        const date = document.getElementById('task-date').value;
        const category = document.getElementById('task-category').value;
        const description = document.getElementById('task-description').value.trim();
        
        if (!title) return;
        
        const task = {
            id: Date.now(),
            title,
            description,
            priority,
            date,
            category,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.tasks.unshift(task);
        this.saveTasks(); // Atualiza o localStorage
        this.updateStats();
        this.renderTasks();
        
        // Limpar formulário
        document.getElementById('task-form').reset();
    }
    
    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;
        
        // Definir tarefa que está sendo editada
        this.editingTask = task;
        
        // Preencher formulário com dados da tarefa
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-description').value = task.description || '';
        document.getElementById('task-priority').value = task.priority;
        document.getElementById('task-date').value = task.date;
        document.getElementById('task-category').value = task.category;
        
        // Mudar texto do botão e mostrar botão de cancelar
        const submitBtn = document.querySelector('#task-form button[type="submit"]');
        submitBtn.textContent = 'Atualizar Tarefa';
        document.getElementById('cancel-edit-btn').style.display = 'inline-block';
        
        // Configurar listeners para auto-save
        this.setupAutoSaveListeners();
        
        // Scroll para o formulário
        document.getElementById('task-form').scrollIntoView({ behavior: 'smooth' });
    }
    
    updateTask() {
        if (!this.editingTask) return;
        
        const title = document.getElementById('task-title').value.trim();
        const priority = document.getElementById('task-priority').value;
        const date = document.getElementById('task-date').value;
        const category = document.getElementById('task-category').value;
        const description = document.getElementById('task-description').value.trim();
        
        if (!title) return;
        
        // Atualizar tarefa com novos valores
        this.editingTask.title = title;
        this.editingTask.description = description;
        this.editingTask.priority = priority;
        this.editingTask.date = date;
        this.editingTask.category = category;
        
        this.saveTasks(); // Atualiza o localStorage
        
        // Renderizar tarefas
        this.renderTasks();
        
        // Limpar formulário e cancelar edição
        this.cancelEdit();
    }
    
    cancelEdit() {
        this.editingTask = null;
        document.getElementById('task-form').reset();
        
        // Restaurar texto do botão e esconder botão de cancelar
        const submitBtn = document.querySelector('#task-form button[type="submit"]');
        submitBtn.textContent = 'Adicionar Tarefa';
        document.getElementById('cancel-edit-btn').style.display = 'none';
    }
    
    toggleTaskStatus(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks(); // Atualiza o localStorage
            this.updateStats();
            this.renderTasks();
        }
    }
    
    showDeleteConfirmation(id) {
        const deleteConfirm = document.getElementById('delete-confirm');
        deleteConfirm.style.display = 'flex';
        
        const confirmBtn = document.getElementById('confirm-delete');
        const cancelBtn = document.getElementById('cancel-delete');
        
        // Remover eventos antigos para evitar múltiplos listeners
        const newConfirmBtn = confirmBtn.cloneNode(true);
        const newCancelBtn = cancelBtn.cloneNode(true);
        
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        
        // Adicionar novos eventos
        newConfirmBtn.addEventListener('click', () => {
            this.deleteTask(id);
            deleteConfirm.style.display = 'none';
        });
        
        newCancelBtn.addEventListener('click', () => {
            deleteConfirm.style.display = 'none';
        });
    }
    
    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks(); // Atualiza o localStorage
        this.updateStats();
        this.renderTasks();
    }
    
    updateStats() {
        document.getElementById('pending-count').textContent = this.tasks.filter(t => !t.completed).length;
        document.getElementById('completed-count').textContent = this.tasks.filter(t => t.completed).length;
    }
    
    getFilteredTasks() {
        const today = new Date().toISOString().split('T')[0];
        
        switch(this.currentFilter) {
            case 'pending':
                return this.tasks.filter(t => !t.completed);
            case 'completed':
                return this.tasks.filter(t => t.completed);
            case 'high':
                return this.tasks.filter(t => t.priority === 'high');
            case 'today':
                return this.tasks.filter(t => t.date === today);
            case 'all':
                // Separar tarefas em pendentes e concluídas
                const pendingTasks = this.tasks.filter(t => !t.completed);
                const completedTasks = this.tasks.filter(t => t.completed);
                
                // Ordenar tarefas pendentes por data de criação (mais recentes primeiro)
                pendingTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                
                // Ordenar tarefas concluídas por data de criação (mais recentes primeiro)
                completedTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                
                // Retornar primeiro as pendentes, depois as concluídas
                return [...pendingTasks, ...completedTasks];
            default:
                // Para qualquer filtro desconhecido, aplicamos a mesma lógica do 'all'
                const pending = this.tasks.filter(t => !t.completed);
                const completed = this.tasks.filter(t => t.completed);
                
                pending.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                completed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                
                return [...pending, ...completed];
        }
    }
    
    formatDate(dateString) {
        if (!dateString) return 'Sem data';
        
        // Dividir a data em ano, mês e dia
        const [year, month, day] = dateString.split('-');
        
        // Criar um objeto de data com os valores corretos (mês em JavaScript é 0-11)
        const date = new Date(year, month - 1, day);
        
        // Formatar para pt-BR
        return date.toLocaleDateString('pt-BR');
    }
    
    renderTasks() {
        const tasksList = document.getElementById('tasks-list');
        const filteredTasks = this.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            tasksList.innerHTML = `
                <div class="empty-tasks">
                    <i class="fas fa-clipboard-list" style="font-size: 48px; margin-bottom: 10px;"></i>
                    <p>Nenhuma tarefa encontrada</p>
                </div>
            `;
            return;
        }
        
        tasksList.innerHTML = '';
        
        filteredTasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskElement.dataset.id = task.id;
            
            taskElement.innerHTML = `
                <div class="completed-indicator">
                    ${task.completed ? '<i class="fas fa-check"></i>' : ''}
                </div>
                
                <div class="task-content">
                    <div class="task-title">${task.title}</div>
                    <div class="task-details">
                        ${task.description ? `<span><i class="fas fa-align-left"></i> ${task.description}</span>` : ''}
                        <span><i class="fas fa-calendar"></i> ${this.formatDate(task.date)}</span>
                        <span><i class="fas fa-tag"></i> ${task.category}</span>
                        <span class="task-priority priority-${task.priority}">
                            ${task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                        </span>
                    </div>
                </div>
                
                <div class="task-actions">
                    <button class="action-btn edit-btn">
                        <i class="fas fa-edit" style="color: var(--primary);"></i>
                    </button>
                    <button class="action-btn delete-btn">
                        <i class="fas fa-trash-alt" style="color: var(--danger);"></i>
                    </button>
                </div>
            `;
            
            // Adicionar evento ao indicador de completude
            const completeIndicator = taskElement.querySelector('.completed-indicator');
            completeIndicator.addEventListener('click', () => {
                this.toggleTaskStatus(task.id);
            });
            
            // Adicionar evento ao botão de editar
            const editBtn = taskElement.querySelector('.edit-btn');
            editBtn.addEventListener('click', () => {
                this.editTask(parseInt(taskElement.dataset.id));
            });
            
            // Adicionar evento ao botão de excluir
            const deleteBtn = taskElement.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => {
                this.showDeleteConfirmation(parseInt(taskElement.dataset.id));
            });
            
            tasksList.appendChild(taskElement);
        });
    }
}

// Inicializar o gerenciador de tarefas quando o documento estiver pronto
let taskManager;
document.addEventListener('DOMContentLoaded', () => {
    taskManager = new TaskManager();
    
    // Tornar o taskManager disponível no escopo global (melhor prática é evitar isso, 
    // mas facilita para fins de demonstração)
    window.taskManager = taskManager;
});