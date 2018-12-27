import Connection from './Connection.js'
let i = 1
let connection = new Connection({
  url: 'ws://localhost:8085',
  authorization: 'eyJhbGciOiJIUzI1NiIsImlhdCI6MTU0NTg5NzExOSwiZXhwIjoxNTQ1OTgzNTE5fQ.eyJpZCI6MSwicm9sZXMiOlsibWVtYmVyIl0sImVtYWlsIjoidXNlcjFAZXhhbXBsZS5jb20iLCJuYW1lIjoiVXNlcl8xIiwicmVmZXJlbmNlSWQiOjIsInNlc3Npb25JZCI6ImVkNWVhNGM2LTYxMTUtNDA5MS1hN2JiLTlhNzk4NmM1Y2JmZiJ9.ZaaHtHaNv_lRzL_viwcy0S5NP0hG9hKH-oiKIb3cF3w'
})