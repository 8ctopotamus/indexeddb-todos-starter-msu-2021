document.addEventListener('DOMContentLoaded', (e) => {

  const form = document.getElementById('todo-form')
  const newTodoInput = document.querySelector('input.new-item')
  const todoListSpan = document.querySelector('.todo-container')

  if (!window.indexedDB) {
    console.log("Your browser does not support indexedDB")
    return
  }

  let db

  const request = window.indexedDB.open('todos_db', 1)

  request.onerror = event => {
    console.log(event.target.errorCode)
  }

  request.onupgradeneeded = event => {
    const db = event.target.result
    db.createObjectStore('todos', { keyPath: 'id', autoIncrement: true })
  }

  request.onsuccess = event => {
    db = event.target.result
    console.log(`Successfully opened ${db.name}`)
    getTodos()
  }

  const getStore = (objectStoreName, mode = 'readwrite') => {
    const transaction = db.transaction(objectStoreName, mode)
    const objectStore = transaction.objectStore(objectStoreName)
    return objectStore
  }

  const getTodos = () => {
    const objectStore = getStore('todos', 'readonly')
    const getAllRequest = objectStore.getAll()
    getAllRequest.onsuccess = event => renderTodoList(event.target.result)
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
      complete: false,
      text,
    }
    const objectStore = getStore('todos')
    const addRequest = objectStore.add(newTodo)
    addRequest.onsuccess = () => getTodos()
  })

  const deleteTodo = id => {
    const objectStore = getStore('todos')
    const deleteRequest = objectStore.delete( parseInt(id) )
    deleteRequest.onsuccess = () => getTodos()
  }

  const updateTodo = newTodo => {
    newTodo.id = parseInt(newTodo.id)
    const objectStore = getStore('todos')
    const putRequest = objectStore.put(newTodo)
    putRequest.onsuccess = () => getTodos()
  }

  todoListSpan.addEventListener('click', e => {
    const target = e.target
    const id = target.getAttribute('data-id')
    if (target.matches('.delete')) {
      deleteTodo(id)
    } else if (target.matches('.complete')) {
      const complete = JSON.parse(target.getAttribute('data-complete'))
      const text = e.target.parentElement.querySelector('span').innerText
      const newTodo = {
        id,
        text,
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
      const complete = e.target.parentElement.querySelector('.complete').getAttribute('data-complete')
      const newTodo = {
        id: e.target.getAttribute('data-id'),
        text: e.target.value,
        complete: JSON.parse(complete)
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