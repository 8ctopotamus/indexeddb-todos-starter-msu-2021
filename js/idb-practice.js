// https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB

if (!window.indexedDB) {
  console.log('Your browser does not support indexedDB!')
}

const customerData = [
  { ssn: "444-44-4444", name: "Bill", age: 35, email: "bill@company.com" },
  { ssn: "555-55-5555", name: "Donna", age: 32, email: "donna@home.org" },
  { ssn: "344-44-4444", name: "Bill", age: 31, email: "billl@company.com" },
];

let db

const request = window.indexedDB.open('CustomerDB', 2)

request.onerror = event => {
  console.log(event.target.errorCode)
}

request.onupgradeneeded = event => {
  const db = event.target.result
  const objectStore = db.createObjectStore('customers', { keyPath: 'id', autoIncrement: true })
  objectStore.createIndex('name', 'name')
}

request.onsuccess = event => {
  db = event.target.result
  console.log(`Succesfully opened ${db.name}`)

  const transaction = db.transaction('customers', 'readwrite')
  const objectStore = transaction.objectStore('customers')

  // create
  customerData.forEach(customer => {
    const addRequest = objectStore.add(customer)
    addRequest.onsuccess = event => console.log(customer.name + ' was added!')
  })

  // read
  const getAllRequest = objectStore.getAll()
  getAllRequest.onsuccess = event => console.log(event.target.result)

  const getRequest = objectStore.get(1)
  getRequest.onsuccess = event => console.log(event.target.result)

  const nameIndex = objectStore.index('name')
  const indexRequest = nameIndex.getAll('Bill')
  indexRequest.onsuccess = event => console.log(event.target.result)

  // update
  objectStore.put({ 
    id: 3,
    ssn: "000-00-0000", 
    name: "Bill", 
    age: 100, 
    email: "zzz@z.com" 
  })

  objectStore.openCursor().onsuccess = event => {
    const cursor = event.target.result
    if (cursor) {
      const customer = cursor.value
      customer.age = customer.age + 1
      cursor.update(customer)
      cursor.continue()
    } else {
      console.log('End of data!')
    }
  }

  objectStore.delete(1)

}