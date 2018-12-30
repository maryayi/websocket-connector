import Connection from './Connection.js'
let connection = new Connection({
  URL: 'ws://localhost:8085',
  authorization: window.localStorage.getItem('token')
})
