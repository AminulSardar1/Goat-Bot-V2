const fs = require('fs-extra')
const { loginWithAccountTxt, validateAccountTxt } = require('./aminulLogin.js')
const { log, logColor, convertTime, colors, randomString } = global.utils

async function startBotWithAminul() {
  try {
    console.log(colors.hex('#f5ab00')('\u2500'.repeat(50)))
    console.log(colors.hex('#f5ab00')('    AMINUL-NEW-FCA LOGIN SYSTEM'))
    console.log(colors.hex('#f5ab00')('\u2500'.repeat(50)))

    const projectVersion = require('../../package.json').version
    const { dirAccount } = global.client
    const { config } = global.GoatBot

    console.log('[ AMINUL-FCA ]', 'Validating account.txt...')
    const accountInfo = validateAccountTxt(dirAccount)

    if (!accountInfo.valid) {
      log.err('LOGIN FACEBOOK', 'Invalid account.txt: ' + accountInfo.error)
      log.info(
        'LOGIN FACEBOOK',
        'Please ensure account.txt contains valid Facebook cookies in JSON format'
      )
      process.exit()
    }

    console.log('[ AMINUL-FCA ]', '\u2713 Account.txt is valid')
    console.log('[ AMINUL-FCA ]', '\u2713 User ID: ' + accountInfo.userId)
    console.log(
      '[ AMINUL-FCA ]',
      '\u2713 Cookie count: ' + accountInfo.cookieCount
    )

    // Reset GoatBot runtime containers
    global.GoatBot.commands = new Map()
    global.GoatBot.eventCommands = new Map()
    global.GoatBot.aliases = new Map()
    global.GoatBot.onChat = []
    global.GoatBot.onEvent = []
    global.GoatBot.onReply = new Map()
    global.GoatBot.onReaction = new Map()

    console.log('[ AMINUL-FCA ]', 'Starting login process...')

    const api = await loginWithAccountTxt(dirAccount, config.optionsFca)

    global.GoatBot.fcaApi = api
    global.GoatBot.botID = api.getCurrentUserID()
    global.botID = api.getCurrentUserID()

    logColor(
      '#f5ab00',
      '\u2500'.repeat(30) + ' BOT INFO ' + '\u2500'.repeat(30)
    )
    log.info('NODE VERSION', process.version)
    log.info('PROJECT VERSION', projectVersion)
    log.info('BOT ID', global.botID)
    log.info('LOGIN METHOD', 'aminul-new-fca')
    log.info('LOGIN STATUS', '\u2713 SUCCESSFUL')

    await loadBotData(api)
    await setupMessageListener(api)
    await setupUptimeServer()
    setupAutoRestart()

    console.log('[ AMINUL-FCA ]', '\u2713 Bot successfully started!')
    logColor('#f5ab00', '\u2500'.repeat(70))

    return api
  } catch (error) {
    log.err('LOGIN FACEBOOK', 'Login failed:', error.message)
    console.error('[ AMINUL-FCA ]', 'Error details:', error)

    if (global.GoatBot.config.dashBoard?.enable === true) {
      try {
        await require('../../dashboard/app.js')(null)
        log.info('DASHBOARD', 'Dashboard opened successfully')
      } catch (dashError) {
        log.err('DASHBOARD', 'Dashboard error:', dashError)
      }
      return
    }

    process.exit(1)
  }
}

function createLine(text, fullWidth = false) {
  const maxWidth =
    process.stdout.columns > 50 ? 50 : process.stdout.columns

  if (!text) {
    return Array(fullWidth ? process.stdout.columns : maxWidth)
      .fill('\u2500')
      .join('')
  }

  const width = fullWidth ? process.stdout.columns : maxWidth
  const textLength = text.length
  const left = Math.floor((width - textLength - 2) / 2)

  return (
    '\u2500'.repeat(left) +
    (' ' + text + ' ') +
    '\u2500'.repeat(width - textLength - 2 - left)
  )
}

async function loadBotData(api) {
  try {
    const data = await require('./loadData.js')(api, createLine)

    if (data) {
      global.db = {
        ...global.db,
        threadModel: data.threadModel,
        userModel: data.userModel,
        dashBoardModel: data.dashBoardModel,
        globalModel: data.globalModel,
        threadsData: data.threadsData,
        usersData: data.usersData,
        dashBoardData: data.dashBoardData,
        globalData: data.globalData,
        sequelize: data.sequelize,
      }
    }

    log.info('DATABASE', '\u2713 Database loaded successfully')

    await require('./loadScripts.js')(
      api,
      data.threadModel,
      data.userModel,
      data.dashBoardModel,
      data.globalModel,
      data.threadsData,
      data.usersData,
      data.dashBoardData,
      data.globalData,
      createLine
    )

    log.info('SCRIPTS', '\u2713 Commands and events loaded successfully')
  } catch (error) {
    log.err('LOAD DATA', 'Error loading bot data:', error.message)
    throw error
  }
}

async function setupMessageListener(api) {
  try {
    const { callbackListenTime, storage5Message } = global.GoatBot

    const handleAction = require('../handler/handlerAction.js')(
      api,
      global.db.threadModel,
      global.db.userModel,
      global.db.dashBoardModel,
      global.db.globalModel,
      global.db.usersData,
      global.db.threadsData,
      global.db.dashBoardData,
      global.db.globalData
    )

    function handleMessage(error, event) {
      if (error) {
        return log.err('LISTEN', 'Listen error:', error)
      }

      if (!event || !event.type) {
        return
      }

      const config = global.GoatBot.config

      // White list filters
      if (config.whiteListMode?.enable || config.whiteListModeThread?.enable) {
        const isUserWhitelisted =
          config.whiteListMode?.whiteListIds?.includes(event.senderID)
        const isThreadWhitelisted =
          config.whiteListModeThread?.whiteListThreadIds?.includes(
            event.threadID
          )
        const isAdmin = config.adminBot?.includes(event.senderID)

        if (!isAdmin && config.whiteListMode?.enable && !isUserWhitelisted) {
          return
        }

        if (
          !isAdmin &&
          config.whiteListModeThread?.enable &&
          !isThreadWhitelisted
        ) {
          return
        }
      }

      // Small message deduplication
      if (event.messageID && event.type === 'message') {
        if (storage5Message.includes(event.messageID)) {
          Object.keys(callbackListenTime)
            .slice(0, -1)
            .forEach((key) => {
              callbackListenTime[key] = () => {}
            })
        } else {
          storage5Message.push(event.messageID)
        }

        if (storage5Message.length > 5) {
          storage5Message.shift()
        }
      }

      // Event logging
      const logEventsConfig = global.GoatBot.config.logEvents

      if (
        logEventsConfig.disableAll === false &&
        logEventsConfig[event.type] !== false
      ) {
        const originalParticipants = [...(event.participantIDs || [])]

        if (event.participantIDs) {
          event.participantIDs = 'Array(' + event.participantIDs.length + ')'
        }

        console.log(
          colors.green((event.type || '').toUpperCase() + ':'),
          JSON.stringify(event, null, 2)
        )

        if (event.participantIDs) {
          event.participantIDs = originalParticipants
        }
      }

      handleAction(event)
    }

    function createListenCallback(key) {
      const id = randomString(10) + (key || Date.now())

      callbackListenTime[id] = handleMessage

      return function (error, event) {
        callbackListenTime[id](error, event)
      }
    }

    global.GoatBot.Listening = api.listenMqtt(createListenCallback())
    global.GoatBot.callBackListen = handleMessage

    log.info('LISTENER', '\u2713 Message listener started successfully')

    const restartConfig = global.GoatBot.config.restartListenMqtt

    if (restartConfig.enable) {
      const interval = setInterval(async function () {
        if (!restartConfig.enable) {
          clearInterval(interval)
          return log.warn('LISTEN_MQTT', 'Restart listener disabled')
        }

        try {
          await stopListening()
          await new Promise((resolve) => setTimeout(resolve, 1000))

          global.GoatBot.Listening = api.listenMqtt(createListenCallback())
          log.info('LISTEN_MQTT', 'Message listener restarted')
        } catch (error) {
          log.err('LISTEN_MQTT', 'Restart error:', error)
        }
      }, restartConfig.timeRestart)

      global.intervalRestartListenMqtt = interval

      log.info(
        'LISTEN_MQTT',
        '\u2713 Auto-restart enabled (' +
          convertTime(restartConfig.timeRestart, true) +
          ')'
      )
    }
  } catch (error) {
    log.err(
      'LISTENER',
      'Error setting up message listener:',
      error.message
    )
    throw error
  }
}

async function setupUptimeServer() {
  try {
    const serverConfig = global.GoatBot.config.serverUptime

    if (
      !serverConfig.enable ||
      global.GoatBot.config.dashBoard?.enable ||
      global.serverUptimeRunning
    ) {
      return
    }

    const http = require('http')
    const express = require('express')
    const axios = require('axios')

    const app = express()
    const server = http.createServer(app)

    const { data: homePageHtml } = await axios.get(
      'https://raw.githubusercontent.com/ntkhang03/resources-goat-bot/master/homepage/home.html'
    )

    const port =
      global.GoatBot.config.dashBoard?.port || serverConfig.port || 3001

    app.get('/', (req, res) => res.send(homePageHtml))
    app.get('/uptime', global.responseUptimeCurrent)

    await server.listen(port)

    const url = process.env.REPL_OWNER
      ? 'https://' +
        process.env.REPL_SLUG +
        '.' +
        process.env.REPL_OWNER +
        '.repl.co'
      : process.env.API_SERVER_EXTERNAL === 'https://api.glitch.com'
      ? 'https://' + process.env.PROJECT_DOMAIN + '.glitch.me'
      : 'http://localhost:' + port

    log.info('UPTIME', '\u2713 Server running at ' + url)
    global.serverUptimeRunning = true

    if (serverConfig.socket?.enable) {
      require('./socketIO.js')(server)
    }
  } catch (error) {
    log.err('UPTIME', 'Error setting up uptime server:', error.message)
  }
}

function setupAutoRestart() {
  try {
    const config = global.GoatBot.config

    if (!config.autoReloginWhenChangeAccount) {
      return
    }

    const { dirAccount } = global.client
    let lastModified = fs.statSync(dirAccount).mtimeMs

    setTimeout(() => {
      fs.watch(dirAccount, async (eventType) => {
        if (
          eventType === 'change' &&
          lastModified !== fs.statSync(dirAccount).mtimeMs
        ) {
          clearInterval(global.intervalRestartListenMqtt)
          lastModified = fs.statSync(dirAccount).mtimeMs

          log.info(
            'AUTO RESTART',
            'Account file changed, restarting bot...'
          )

          await startBotWithAminul()
        }
      })
    }, 10000)

    log.info('AUTO RESTART', '\u2713 Account file watcher enabled')
  } catch (error) {
    log.err(
      'AUTO RESTART',
      'Error setting up auto-restart:',
      error.message
    )
  }
}

function stopListening(id) {
  const { callbackListenTime } = global.GoatBot

  const listenId = id || Object.keys(callbackListenTime).pop()

  return new Promise((resolve) => {
    const stopFn = global.GoatBot.fcaApi.stopListening

    if (typeof stopFn === 'function') {
      stopFn(() => {
        if (callbackListenTime[listenId]) {
          callbackListenTime[listenId] = () => {}
        }
        resolve()
      })
    } else {
      resolve()
    }
  })
}

global.GoatBot.reLoginBot = startBotWithAminul

module.exports = {
  startBotWithAminul,
  stopListening,
}