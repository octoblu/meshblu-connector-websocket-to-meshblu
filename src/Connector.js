const debug = require('debug')('meshblu-connector-websocket-to-meshblu:Connector')
const bindAll = require('lodash/fp/bindAll')
const getOr = require('lodash/fp/getOr')
const WebSocket = require('ws')
const _ = require('lodash')

class Connector {
  constructor({ meshbluHttp, webSocketUrl }) {
    bindAll(Object.getOwnPropertyNames(Connector.prototype), this)

    if (!meshbluHttp) throw new Error('Missing required parameter: meshbluHttp')
    this.meshbluHttp = meshbluHttp

    if (!webSocketUrl) throw new Error('Missing required parameter: webSocketUrl')
    this.webSocketUrl = webSocketUrl
  }

  run(callback) {
    debug('run')
    this.meshbluHttp.whoami((error, device) => {
      if (error) return callback(error)
      const ws = new WebSocket(this.webSocketUrl)
      const waitAndConnectOnce = _.once(this._waitAndConnect)
      ws.on('message', this._onWebSocketMessage)
      ws.on('error', waitAndConnectOnce)
      ws.on('close', waitAndConnectOnce)

    })
  }
  _onWebSocketMessage(message) {
    try {
      message = JSON.parse(message)
      message.devices = ["*"]
      this.meshbluHttp.message(message, (error) =>{
        if (error) console.error(`Error broadcasting message: ${error.message}`)
      })
    }

    catch(error) {
      console.error( `Error receiving a message from the powermate: ${error.message}`)
      return
    }

  }

  _waitAndConnect(){
    if(this.timeoutHandle) {
      clearTimeout(this.timeoutHandle)
    }

    this.timeoutHandle = setTimeout(this.run, 1000)
  }

}

module.exports = Connector
