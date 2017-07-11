const MeshbluConfig = require('meshblu-config')
const MeshbluHttp = require('meshblu-http')
const Connector = require('./src/Connector')
const OctoDash  = require('OctoDash')
const packageJSON = require('./package.json')
const _ = require('lodash')

const CLI_OPTIONS = [
  {
    names: ['web-socket-url'],
    type: 'string',
    required: true,
    env: 'WEB_SOCKET_URL',
    help: "The URL to the websocket",
    helpArg: 'URL',
    default: 'http://localhost:52052',
  }
]
class Command {
  constructor({argv, cliOptions = CLI_OPTIONS} = {}) {
    this.octoDash = new OctoDash({
      argv,
      cliOptions,
      name: packageJSON.name,
      version: packageJSON.version,
    })
    const { webSocketUrl } = this.octoDash.parseOptions()
    const meshbluConfig = new MeshbluConfig()
    const meshbluHttp = new MeshbluHttp(meshbluConfig.toJSON())
    this.connector = new Connector({ meshbluHttp, webSocketUrl })
  }

  static panic(error) {
    console.error(error.stack) // eslint-disable-line no-console
    process.exit(1)
  }

  panicIfError(error) {
    if (!error) return
    this.panic(error)
  }

  run() {
    this.connector.run((error) => {
      if (error) this.panic(error)
    })
  }
}

if (require.main === module) {
  const command = new Command({ argv: process.argv })
  command.run()
}

module.exports = Command
