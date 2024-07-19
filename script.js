const state = {
  currentFilter: "all",
  todos: [],
};

const url = "http://localhost:4730/todos";
const todoListElement = document.querySelector("#todo-list");
const newTodoDescriptionElement = document.querySelector(
  "#new-todo-description"
);
const addTodoBtn = document.querySelector("#add-todo");
// api
loadTodos();

async function loadTodos() {
  const response = await fetch(url);
  const data = await response.json();
  state.todos = data;

  updateLocalStorageData();

  render();
}
// api delete
async function deleteDoneTodos() {
  const doneTodos = state.todos.filter((todo) => todo.done);

  for (const doneTodo of doneTodos) {
    await fetch(url + "/" + doneTodo.id, {
      method: "DELETE",
    });
  }

  state.todos = state.todos.filter((todo) => !todo.done);

  updateLocalStorageData();

  render();
}

// localStorage laden
function getDataFromLocalStorage() {
  const todoData = JSON.parse(localStorage.getItem("todos"));
  if (todoData) {
    state.todos = todoData;
    render();
  }
}
// Speichern im localStorage

function updateLocalStorageData() {
  const todoDataToString = JSON.stringify(state.todos);

  localStorage.setItem("todos", todoDataToString);
}
// Todos Hinzufügen

function addNewTodo() {
  const newTodoDescription = newTodoDescriptionElement.value.trim();
  if (
    !newTodoDescription ||
    state.todos.some((todo) => todo.description === newTodoDescription)
  ) {
    alert("Todo bereits vorhanden");

    return;
  }

  const newTodoData = {
    description: newTodoDescription,
    done: false,
  };
  // api post
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newTodoData),
  })
    .then((res) => res.json())
    .then((newTodoFromApi) => {
      state.todos.push(newTodoFromApi);

      updateLocalStorageData();

      render();
    });

  newTodoDescriptionElement.value = "";
}

addTodoBtn.addEventListener("click", () => {
  if (newTodoDescriptionElement.value.trim() !== "") {
    addNewTodo();
  }
});

function generateListItem(todoData) {
  const liElement = document.createElement("li");

  const checkbox = document.createElement("input");

  checkbox.type = "checkbox";
  checkbox.checked = todoData.done;

  checkbox.addEventListener("change", async () => {
    todoData.done = !todoData.done;
    // api put
    await fetch(url + "/" + todoData.id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(todoData),
    });

    updateLocalStorageData();

    render();
  });

  const label = document.createElement("label");
  label.innerText = todoData.description;

  if (todoData.done) {
    label.style.textDecoration = "line-through";
  }

  liElement.appendChild(checkbox);
  liElement.appendChild(label);

  return liElement;
}
//Todo-Liste Rendern
function render() {
  todoListElement.innerHTML = "";
  const filteredTodos = state.todos.filter((todo) => {
    if (state.currentFilter === "all") return true;
    if (state.currentFilter === "open") return !todo.done;
    if (state.currentFilter === "done") return todo.done;
  });

  for (const todoData of filteredTodos) {
    const liElement = generateListItem(todoData);
    todoListElement.appendChild(liElement);
  }
}
//Filter
const filterButtons = document.querySelectorAll('input[name="filter"]');
filterButtons.forEach((button) => {
  button.addEventListener("change", () => {
    state.currentFilter = button.value;

    render();
  });
});
// remove
const removeDoneButton = document.querySelector("#remove-todo");
removeDoneButton.addEventListener("click", () => {
  deleteDoneTodos();
});

getDataFromLocalStorage();
