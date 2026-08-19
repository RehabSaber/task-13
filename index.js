let tasks = JSON.parse(localStorage.getItem('kanban_tasks') || '[]');
function saveTasksToStorage() {
    localStorage.setItem('kanban_tasks', JSON.stringify(tasks));
}
let modal = document.getElementById('task-modal');
let openModalBtn = document.getElementById('open-modal-btn');
let closeModalBtn = document.getElementById('close-modal-btn');
let cancelModalBtn = document.getElementById('cancel-modal-btn');
let taskForm = document.getElementById('task-form');
let taskIdInput = document.getElementById('task-id');
let taskTitleInput = document.getElementById('task-title');
let taskPriorityInput = document.getElementById('task-priority');
let taskDateInput = document.getElementById('task-date');
let taskDescInput = document.getElementById('task-desc');
let charCount = document.getElementById('char-count');
let modalTitle = document.getElementById('modal-title');
let submitBtn = document.getElementById('submit-btn');
taskDescInput.addEventListener('input', () => {
    charCount.textContent = `${taskDescInput.value.length}/500`;
});
function openModal(isEdit = false) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (!isEdit) {
        taskForm.reset();
        taskIdInput.value = '';
        charCount.textContent = '0/500';
        modalTitle.textContent = 'Create New Task';
        submitBtn.textContent = '+ Add Task';
    }
}
function closeModal() {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}
openModalBtn.addEventListener('click', () => openModal(false));
closeModalBtn.addEventListener('click', closeModal);
cancelModalBtn.addEventListener('click', closeModal);
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let id = taskIdInput.value;
    let title = taskTitleInput.value.trim();
    let priority = taskPriorityInput.value;
    let dueDate = taskDateInput.value;
    let description = taskDescInput.value.trim();
    if (id) {
        let task = tasks.find((t) => t.id === id);
        if (task) {
            Object.assign(task, { title, priority, dueDate, description });
            showToast('Task updated successfully!');
        }
    }
    else {
        tasks.push({
            id: Date.now().toString(),
            title,
            priority,
            dueDate,
            description,
            status: 'todo'
        });
        showToast('Task added successfully!');
    }
    closeModal();
    renderBoard();
});
function renderBoard() {
    let todoList = document.getElementById('todo-list');
    let inProgressList = document.getElementById('in-progress-list');
    let completedList = document.getElementById('completed-list');
    todoList.innerHTML = '';
    inProgressList.innerHTML = '';
    completedList.innerHTML = '';
    let todoTasks = tasks.filter((t) => t.status === 'todo');
    let inProgressTasks = tasks.filter((t) => t.status === 'in-progress');
    let completedTasks = tasks.filter((t) => t.status === 'completed');
    document.getElementById('todo-count').textContent = `${todoTasks.length} tasks`;
    document.getElementById('in-progress-count').textContent = `${inProgressTasks.length} tasks`;
    document.getElementById('completed-count').textContent = `${completedTasks.length} tasks`;
    document.getElementById('todo-empty')?.classList.toggle('hidden', todoTasks.length > 0);
    document.getElementById('in-progress-empty')?.classList.toggle('hidden', inProgressTasks.length > 0);
    document.getElementById('completed-empty')?.classList.toggle('hidden', completedTasks.length > 0);
    todoTasks.forEach((t) => todoList.appendChild(createTaskCard(t)));
    inProgressTasks.forEach((t) => inProgressList.appendChild(createTaskCard(t)));
    completedTasks.forEach((t) => completedList.appendChild(createTaskCard(t)));
    saveTasksToStorage();
}
function createTaskCard(task) {
    let card = document.createElement('div');
    card.className = 'bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all';
    let priorityColors = {
        Low: 'bg-blue-100 text-blue-600',
        Medium: 'bg-amber-100 text-amber-600',
        High: 'bg-red-100 text-red-600'
    };
    card.innerHTML = `
    <div class="flex items-center justify-between mb-2">
      <span class="text-xs font-semibold text-gray-400">#${task.id.slice(-4)}</span>
      <div class="flex items-center gap-2">
        <button class="edit-btn text-gray-400 hover:text-indigo-600 text-sm"><i class="fa-solid fa-pen"></i></button>
        <button class="delete-btn text-gray-400 hover:text-red-500 text-sm"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>
    <h4 class="font-bold text-gray-800 mb-1">${task.title}</h4>
    <p class="text-xs text-gray-500 mb-3">${task.description || 'No description'}</p>
    
    <div class="flex items-center justify-between pt-2 border-t border-gray-50">
      <span class="text-[10px] font-bold px-2 py-1 rounded-md ${priorityColors[task.priority]}">${task.priority.toUpperCase()}</span>
      <div class="flex items-center gap-1">
        ${task.status !== 'todo' ? `<button class="move-todo-btn text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded">To Do</button>` : ''}
        ${task.status !== 'in-progress' ? `<button class="move-progress-btn text-xs px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded">Start</button>` : ''}
        ${task.status !== 'completed' ? `<button class="move-complete-btn text-xs px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded">Complete</button>` : ''}
      </div>
    </div>
  `;
    card.querySelector('.delete-btn')?.addEventListener('click', () => deleteTask(task.id));
    card.querySelector('.edit-btn')?.addEventListener('click', () => editTask(task.id));
    card.querySelector('.move-todo-btn')?.addEventListener('click', () => moveTask(task.id, 'todo'));
    card.querySelector('.move-progress-btn')?.addEventListener('click', () => moveTask(task.id, 'in-progress'));
    card.querySelector('.move-complete-btn')?.addEventListener('click', () => moveTask(task.id, 'completed'));
    return card;
}
function deleteTask(id) {
    tasks = tasks.filter((t) => t.id !== id);
    showToast('Task deleted successfully!');
    renderBoard();
}
function editTask(id) {
    let task = tasks.find((t) => t.id === id);
    if (task) {
        taskIdInput.value = task.id;
        taskTitleInput.value = task.title;
        taskPriorityInput.value = task.priority;
        taskDateInput.value = task.dueDate;
        taskDescInput.value = task.description;
        charCount.textContent = `${task.description.length}/500`;
        modalTitle.textContent = 'Edit Task';
        submitBtn.textContent = 'Save Changes';
        openModal(true);
    }
}
function moveTask(id, newStatus) {
    let task = tasks.find((t) => t.id === id);
    if (task) {
        task.status = newStatus;
        renderBoard();
    }
}
function showToast(message) {
    let toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 2500);
    }
}
renderBoard();
export {};
