import WebsocketConnection from './WebsocketConnection.js'
let connection = new WebsocketConnection({
  URL: 'ws://localhost:8085',
  authorization: window.localStorage.getItem('token')
})
