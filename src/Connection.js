export default class Connection {
  constructor (options) {
    this.isOnline = false
    this.socket = null
    this.URL = options.URL
    this.authorization = options.authorization || null
    this.connectionInterval = options.connectionInterval || 4000
    this.keepAliveInterval = options.keepAliveInterval || 5000
    this.keepAliveTimeout = options.keepAliveTimeout || 30000
    this.keepAliveMessage = options.keepAliveMessage || 'keep-alive'
    this._previousConnectionInterval = null
    this._previousKeepAliveTimeout = null
    this._previousKeepAliveInterval = null
    this._connectionIntervalHandler = null
    this._keepAliveTimeoutHandler = null
    this._keepAliveIntervalHandler = null
    this.connect()
  }
  connect () {
    this.socket = new window.WebSocket(
      `${this.URL}?token=${this.authorization}`
    )
    this.socket.onopen = () => {
      console.log('open')
      this.isOnline = true
      this.sendKeepAlive()
    }
    this.socket.onclose = () => {
      console.log('close')
      this.isOnline = false
      if (navigator.onLine) {
        this._connectionIntervalHandler = setTimeout(() => {
          this.connect()
        }, this.getConnectionInterval())
      } else {
        window.addEventListener('online', () => {
          this.connect()
        })
        if (this._connectionIntervalHandler) {
          clearTimeout(this._connectionIntervalHandler)
          this._previousConnectionInterval = null
        }
      }
    }
    this.socket.onerror = () => {
      console.log('error')
      this.isOnline = false
    }
    this.socket.onmessage = message => {
      if (this._keepAliveIntervalHandler) {
        clearTimeout(this._keepAliveIntervalHandler)
        this._previousKeepAliveInterval = null
      }
      if (this._keepAliveTimeoutHandler) {
        clearTimeout(this._keepAliveTimeoutHandler)
        this._previousKeepAliveTimeout = null
      }
      this._keepAliveIntervalHandler = setTimeout(() => {
        this.sendKeepAlive()
      }, this.getKeepAliveInterval())
      if (message.data !== `${this.keepAliveMessage}/answer`) {
        let messageEvent = new window.CustomEvent('message', {
          bubbles: true,
          detail: JSON.parse(message.data)
        })
        document.body.dispatchEvent(messageEvent)
      }
    }
  }
  disconnect () {
    this.socket.close()
    if (this._connectionIntervalHandler) {
      clearTimeout(this._connectionIntervalHandler)
      this._previousConnectionInterval = null
    }
  }
  send (message) {
    if (this.socket) {
      this.socket.send(message)
    }
  }
  sendKeepAlive () {
    this.send(this.keepAliveMessage)
    this._keepAliveTimeoutHandler = setTimeout(() => {
      this.socket.close()
      this.isOnline = false
    }, this.getKeepAliveTimeout())
  }
  getConnectionInterval () {
    if (typeof this.connectionInterval === 'function') {
      this._previousConnectionInterval = this.connectionInterval(
        this._previousConnectionInterval
      )
      return this._previousConnectionInterval
    } else {
      return this.connectionInterval
    }
  }
  getKeepAliveInterval () {
    if (typeof this.keepAliveInterval === 'function') {
      this._previousKeepAliveInterval = this.keepAliveInterval(
        this._previousKeepAliveInterval
      )
      return this._previousKeepAliveInterval
    } else {
      return this.keepAliveInterval
    }
  }
  getKeepAliveTimeout () {
    if (typeof this.keepAliveTimeout === 'function') {
      this._previousKeepAliveTimeout = this.keepAliveTimeout(
        this._previousKeepAliveTimeout
      )
      return this._previousKeepAliveTimeout
    } else {
      return this.keepAliveTimeout
    }
  }
}
