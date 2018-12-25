export default class Connection {
  constructor(options) {
    this.isOnline = false
    this.socket = null
    this.url = options.url
    this.authorization = options.authorization || null
    this._timeoutHandler = null
    this._echoTimeoutHandler = null
    this._errorHandlerTimeout = null
    this.connectionTimeout = options.connectionTimeout || 2000
    this.echoTimeout = options.echoTimeout || 5000
    this._DynamicTimeout = this.connectionTimeout
    this.connect()
  }
  connect() {
    this.socket = new WebSocket(this.url)
    this.socket.onopen = () => {
      console.log('open')
      this.isOnline = true
      this._DynamicTimeout = this.connectionTimeout
      this.sendEchoMessage()
    }
    this.socket.onclose = () => {
      console.log('close')
      this.isOnline = false
      if (navigator.onLine) {
        this._timeoutHandler = setTimeout(() => {
          this.connect()
        }, this._DynamicTimeout)
        this._DynamicTimeout *= 2
        if (this._DynamicTimeout >= 60000) {
          this._DynamicTimeout = 60000
        }
      } else {
        window.addEventListener('online', () => {
          this.connect()
        })
        if (this._timeoutHandler) {
          clearInterval(this._timeoutHandler)
        }
      }
    }
    this.socket.onerror = () => {
      console.log('error')
      this.isOnline = false
    }
    this.socket.onmessage = (message) => {
      if (this._echoTimeoutHandler) {
        clearInterval(this._echoTimeoutHandler)
      }
      if (this._errorHandlerTimeout) {
        clearInterval(this._errorHandlerTimeout)
      }
      this._echoTimeoutHandler = setTimeout(() => {
        this.sendEchoMessage()
      }, this.echoTimeout)
      console.log(message.data)
    }
  }
  disconnect() {
    this.socket.close()
    if (this._timeoutHandler) {
      clearInterval(this._timeoutHandler)
    }
  }
  send(message) {
    if (this.socket) {
      this.socket.send(message)
    }
  }
  sendEchoMessage() {
    this.send('echo')
    this._errorHandlerTimeout = setTimeout(() => {
      this.socket.close()
      this.isOnline = false
    }, this.echoTimeout)
  }
}