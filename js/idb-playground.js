;(() => {
  if (!window.indexedDB) {
    console.log("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
    return
  }

  const customerData = [
    { ssn: "444-44-4444", name: "Bill", age: 35, email: "bill@company.com" },
    { ssn: "555-55-5555", name: "Donna", age: 32, email: "donna@home.org" }
  ];

  let db

  const request = indexedDB.open('CustomerDB', 1)
  request.onerror = event => console.log(event)
  
  request.onupgradeneeded = event => {
    const db = event.target.result
    const objectStore = db.createObjectStore('customers', { 
      keyPath: 'id',
      autoIncrement: true 
    })
    objectStore.createIndex('name', 'name', { unique: false })
    objectStore.createIndex('ssn', 'ssn', { unique: true })
    objectStore.createIndex('email', 'email', { unique: true })
  }

  request.onsuccess = event => {
    console.log('IndexedDB open!')
    db = event.target.result
    const transaction = db.transaction(['customers'], 'readwrite')
    const custStore = transaction.objectStore('customers')
    
    // create
    // customerData.forEach(cust => {
    //   const request = custStore.add(cust)
    //   request.onsuccess = evt => console.log(`${cust.name} added!`)
    // })  

    // read
    // const getRequest = custStore.getAll()
    // getRequest.onsuccess = evt => console.log(evt.target.result)

    // const getOneRequest = custStore.get(2)
    // getOneRequest.onsuccess = evt => console.log(evt.target.result)

    // const ssnIndex = custStore.index('ssn')
    // const usingIndexRequest = ssnIndex.getAll('444-44-4444')
    // usingIndexRequest.onsuccess = evt => console.log('From index', evt.target.result)

    // update
    // custStore.put({
    //   ssn: '555-55-5555', 
    //   name: 'Donnna', 
    //   age: 30, 
    //   email: 'donnna@home.org', 
    //   id: 2
    // })

    // const afterUpdateRequest = custStore.get(2)
    // afterUpdateRequest.onsuccess = evt => console.log('After update', evt.target.result)

    // // update with a cursor
    // custStore.openCursor().onsuccess = evt => {
    //   let cursor = evt.target.result
    //   if (cursor) {
    //     const cust = cursor.value
    //     cust.age = cust.age + 1
    //     cursor.update(cust)
    //     cursor.continue()
    //   } else {
    //     console.log('No more entries')
    //   }
    // }

    // delete
    // const deleteRequest = custStore.delete(2)
    //   .onsuccess = evt => console.log('User deleted!')
  }
})()