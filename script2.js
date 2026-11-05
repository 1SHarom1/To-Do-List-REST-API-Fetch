const taskInput = document.getElementById('taskInput');
const addTaskButton = document.getElementById('addTaskButton');
const dinamicList = document.getElementById('dinamicList');
const deleteAllCompletedTasksButton = document.getElementById('deleteAllCompletedTasksButton');
const messageElement = document.getElementById('message');

const API_URL = 'https://6ae9c4773d3dd3d37be5a409.mockapi.io/users';

let all_tasks = 0;
let completed_tasks = 0;
let remaining_tasks = 0;

function showMessage(text) { // Функція для відображення повідомлення
    messageElement.textContent = text;
    
}

function clearMessage() { // Функція для очищення повідомлення
    messageElement.textContent = '';
}

async function loadTasks() { // Функція для завантаження завдань з API
  try {
    showMessage('Завантаження...');
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error('Помилка: ' + response.status);
    }

    const tasks = await response.json();

    tasks.forEach(function (task) {
        createTaskElement(task);

        if (task.completed) {
            completed_tasks++;
        }
        else {
            remaining_tasks++;
        }
        all_tasks++;
    });
    updateTaskCounts();

    clearMessage();
  } catch (error) {
    showMessage('Помилка при завантаженні завдань: ' + error.message);
  }
}

loadTasks();

function updateTaskCounts() { // Функція для оновлення лічильників завдань
    document.getElementById('allTasks').textContent = all_tasks;
    document.getElementById('completedTasks').textContent = completed_tasks;
    document.getElementById('remainingTasks').textContent = remaining_tasks;
}

async function addTask() { // Функція для додавання нового завдання
  const taskText = taskInput.value.trim();
  if (taskText === '') {
    return;
  }
  addTaskButton.disabled = true;
  try {
    showMessage('Завантаження...');
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: taskText, completed: false })
    });

    if (!response.ok) {
      throw new Error('Помилка: ' + response.status);
    }

    const newTask = await response.json();

    createTaskElement(newTask);

    taskInput.value = '';
    all_tasks++;
    remaining_tasks++;
    updateTaskCounts();

    clearMessage();
  } catch (error) {
    showMessage('Помилка при додаванні завдання: ' + error.message);
  }
  addTaskButton.disabled = false;
}

function createTaskElement(task) { // Функція для створення елемента завдання
    const li = document.createElement('li');
    li.textContent = task.name;
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.className = "checkbox"
    li.appendChild(checkbox);
    
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Видалити';
    deleteButton.className = "deleteButton"
    li.appendChild(deleteButton);
    li.dataset.id = task.id;

   checkbox.addEventListener('change', async function () { // Функція для обробки зміни стану чекбокса
    checkbox.disabled = true;
  try {
    showMessage('Оновлення...');
    const response = await fetch(API_URL + '/' + task.id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: checkbox.checked })
    });      
    
    if (!response.ok) {
      throw new Error('Помилка: ' + response.status);
    }

    if (checkbox.checked) {
        completed_tasks++;
        remaining_tasks--;
    } else {
        completed_tasks--;
        remaining_tasks++;
    }
    updateTaskCounts();

    clearMessage();
  } catch (error) {
    showMessage('Помилка при оновленні завдання: ' + error.message);
  }
  checkbox.disabled = false; 
});

deleteButton.addEventListener('click', async function () { // Функція для обробки видалення завдання
    deleteButton.disabled = true; 
  try {
    showMessage('Видалення...');
    const response = await fetch(API_URL + '/' + task.id, { method: 'DELETE' });

    if (!response.ok) {
      throw new Error('Помилка: ' + response.status);
    }

    if (checkbox.checked) {
        completed_tasks--;
    } else {
        remaining_tasks--;
    }
    all_tasks--;
    updateTaskCounts();
    li.remove();

    clearMessage();
  } catch (error) {
    showMessage('Помилка при видаленні завдання: ' + error.message);
  }
  deleteButton.disabled = false;
});
    dinamicList.appendChild(li);
}    

addTaskButton.addEventListener('click', addTask);

taskInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        addTask();
    }
});

deleteAllCompletedTasksButton.addEventListener('click', async function () { // Функція для видалення всіх завершених завдань
    const completedTasks = dinamicList.querySelectorAll('input[type="checkbox"]:checked'); 
    deleteAllCompletedTasksButton.disabled = true;
    for (const task of completedTasks) {
        const li = task.parentElement;
        try {
            showMessage('Видалення...');
            const response = await fetch(API_URL + '/' + li.dataset.id, { method: 'DELETE' });
            if (!response.ok) {
                throw new Error('Помилка: ' + response.status);
            }
            if (task.checked) {
                completed_tasks--;
            } else {
                remaining_tasks--;
            }
            all_tasks--;
            updateTaskCounts();
            li.remove();

            clearMessage();
        } catch (error) {
            showMessage('Помилка при видаленні завдання: ' + error.message);
        }
    }
    deleteAllCompletedTasksButton.disabled = false;
});
