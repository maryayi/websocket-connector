import { isEquivalent } from './helpers.js'

let instance = null
export default class WebsocketConnection {
  constructor (url, options) {
    if (instance instanceof WebsocketConnection) {
      return instance
    }
    this.isOnline = false
    this.socket = null
    this.__registry__ = []
    this.url = url
    this.authorization = options.authorization || null
    this.connectionInterval = options.connectionInterval || 10000
    this.keepAliveInterval = options.keepAliveInterval || 15000
    this.keepAliveTimeout = options.keepAliveTimeout || 30000
    this.keepAliveMessage = options.keepAliveMessage || 'keep-alive'
    this._previousConnectionInterval = null
    this._previousKeepAliveTimeout = null
    this._previousKeepAliveInterval = null
    this._connectionIntervalHandler = null
    this._keepAliveTimeoutHandler = null
    this._keepAliveIntervalHandler = null
    instance = this
  }

  connect () {
    let resolvedURL = this.authorization
      ? `${this.url}?token=${this.authorization}`
      : this.url
    this.socket = new window.WebSocket(resolvedURL)
    this.socket.onopen = () => {
      console.log('websocket open')
      this.isOnline = true
      this.sendKeepAlive()
    }
    this.socket.onclose = () => {
      console.log('websocket close')
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
      console.log('websocket error')
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
        let messageObject = JSON.parse(message.data)
        this.__registry__.forEach(item => {
          let filterNames = Object.keys(item.filters)
          for (let filter of filterNames) {
            if (
              !messageObject.hasOwnProperty(filter) ||
              !messageObject[filter].match(item.filters[filter])
            ) {
              return
            }
          }
          item.callback(messageObject)
        })
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
  registerCallback (filters, callback) {
    this.__registry__.push({
      filters: filters,
      callback: callback
    })
  }
  unregisterCallback (filters) {
    this.__registry__ = this.__registry__.filter(item => {
      return !isEquivalent(item.filters, filters)
    })
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
