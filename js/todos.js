document.addEventListener('DOMContentLoaded', (e) => {
  // check if exists
  if (!window.indexedDB) {
    console.log("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
    return
  }

  const form = document.getElementById('todo-form')
  const newTodoInput = document.querySelector('input.new-item')
  const todoListSpan = document.querySelector('.todo-container')

  // request to open database
  let db

  const request = indexedDB.open('todos_db', 1)
  
  request.onupgradeneeded = event => {
    const db = event.target.result
    const objectStore = db.createObjectStore('todos', {
      keyPath: 'id',
      autoIncrement: true
    })
    objectStore.createIndex('complete', 'complete')
  }

  request.onsuccess = event => {
    db = event.target.result
    console.log(`Successfully opened ${db.name}!`)
    getTodos()
  }

  const getStore = (storeName, mode = 'readwrite') => {
    const transaction = db.transaction([storeName], mode)
    const store = transaction.objectStore(storeName)
    return store
  }

  const getTodos = () => {
    const store = getStore('todos', 'readonly')
    const todosRequest = store.getAll()
    todosRequest.onsuccess = event => {
      renderTodoList(event.target.result)
    }
  }

  const renderTodoList = todos => {
    const todosHTML = todos.map(todo => {
      const completeClass = todo.complete ? 'line-through' : ''
      return `<li class="list-group-item todo-item">
        <span class="${completeClass}">${todo.text}</span>
        <input data-id="${todo.id}" type="text" class="edit" style="display: none;">
        <button data-id="${todo.id}" class="delete btn btn-danger">x</button>
        <button data-id="${todo.id}" data-complete="${todo.complete}" class="complete btn btn-primary">✓</button>
      </li>`
    }).join('')
    todoListSpan.innerHTML = todosHTML
  }

  form.addEventListener('submit', e => {
    e.preventDefault()
    const text = newTodoInput.value
    const newTodo = {
      text,
      complete: false,
    }
    const store = getStore('todos')
    store.add(newTodo)
  })

  const deleteTodo = id => {
    const parsedId = parseInt(id)
    const store = getStore('todos', 'readwrite')
    const deleteRequest = store.delete(parsedId)
    deleteRequest.onsuccess = () => getTodos()
  }

  const updateTodo = newTodo => {
    // fetch(`/api/todos/${newTodo.id}`, {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(newTodo)
    // })
    //   .then(getTodos)
    //   .catch(err => console.error(err))
  }

  todoListSpan.addEventListener('click', e => {
    const target = e.target
    const id = target.getAttribute('data-id')
    if (target.matches('.delete')) {
      deleteTodo(id)
    } else if (target.matches('.complete')) {
      const complete = JSON.parse(target.getAttribute('data-complete'))
      const newTodo = {
        id,
        complete: !complete
      }
      updateTodo(newTodo)
    } else if (target.matches('span')) {
      const input = target.nextElementSibling
      input.value = target.innerText
      input.style.display = 'block'
      target.style.display = "none"
    }
  })

  todoListSpan.addEventListener('keyup', e => {
    if (e.keyCode === 13) {
      const newTodo = {
        id: e.target.getAttribute('data-id'),
        text: e.target.value
      }      
      updateTodo(newTodo)
    }
  })

  todoListSpan.addEventListener('blur', e => {
    if (e.target.matches('input')) {
      const span = e.target.previousElementSibling
      e.target.value = span.innerText
      span.style.display = 'block'
      e.target.style.display = "none"
    }
  }, true)

});