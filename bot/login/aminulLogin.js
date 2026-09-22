const fs = require('fs-extra')
const login = require('aminul-new-fca')

async function loginWithAccountTxt(accountFilePath, options = {}) {
  try {
    if (!fs.existsSync(accountFilePath)) {
      throw new Error('Account file not found: ' + accountFilePath)
    }

    const rawContent = fs.readFileSync(accountFilePath, 'utf8').trim()
    let appState

    try {
      appState = JSON.parse(rawContent)

      if (!Array.isArray(appState)) {
        throw new Error('Invalid appState format: Expected an array')
      }

      const requiredCookies = ['c_user', 'xs', 'datr']
      const cookieNames = appState.map((c) => c.name || c.key)

      for (const cookieName of requiredCookies) {
        if (!cookieNames.includes(cookieName)) {
          throw new Error('Missing required cookie: ' + cookieName)
        }
      }

      appState = appState.map((cookie) => {
        if (cookie.name && !cookie.key) {
          return {
            ...cookie,
            key: cookie.name,
            domain: cookie.domain || '.facebook.com',
            path: cookie.path || '/',
            hostOnly: cookie.hostOnly || false,
            creation: cookie.creation || new Date().toISOString(),
            lastAccessed: cookie.lastAccessed || new Date().toISOString(),
          }
        }

        return cookie
      })
    } catch (parseError) {
      throw new Error('Failed to parse account.txt: ' + parseError.message)
    }

    const loginOptions = {
      forceLogin: true,
      listenEvents: true,
      updatePresence: true,
      selfListen: true,
      selfListenEvent: true,
      autoMarkDelivery: false,
      autoReconnect: true,
      online: true,
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      ...options,
    }

    console.log('[ AMINUL-LOGIN ]', 'Starting login with account.txt...')
    console.log(
      '[ AMINUL-LOGIN ]',
      'Found ' + appState.length + ' cookies in account.txt'
    )

    return new Promise((resolve, reject) => {
      login({ appState }, loginOptions, (err, api) => {
        if (err) {
          console.error('[ AMINUL-LOGIN ]', 'Login failed:', err)

          if (err.error === 'login-approval') {
            return reject(
              new Error(
                'Login approval required. Please check your Facebook account for security alerts.'
              )
            )
          }

          if (err.error === 'checkpoint-required') {
            return reject(
              new Error(
                'Facebook checkpoint required. Please log into Facebook manually to resolve security checks.'
              )
            )
          }

          if (err.toString().includes('appState')) {
            return reject(
              new Error(
                'Invalid or expired session. Please update your account.txt with fresh cookies.'
              )
            )
          }

          return reject(err)
        }

        console.log(
          '[ AMINUL-LOGIN ]',
          'Successfully logged in with aminul-new-fca!'
        )

        try {
          const newAppState = api.getAppState()
          fs.writeFileSync(
            accountFilePath,
            JSON.stringify(newAppState, null, 2)
          )

          console.log(
            '[ AMINUL-LOGIN ]',
            'Updated account.txt with fresh session data'
          )
        } catch (saveError) {
          console.warn(
            '[ AMINUL-LOGIN ]',
            'Warning: Could not save updated session:',
            saveError.message
          )
        }

        resolve(api)
      })
    })
  } catch (error) {
    console.error(
      '[ AMINUL-LOGIN ]',
      'Error during login process:',
      error.message
    )
    throw error
  }
}

function getUserIdFromAppState(appState) {
  try {
    const userCookie = appState.find(
      (c) => c.name === 'c_user' || c.key === 'c_user'
    )

    return userCookie ? userCookie.value : null
  } catch {
    return null
  }
}

function validateAccountTxt(accountFilePath) {
  try {
    if (!fs.existsSync(accountFilePath)) {
      return {
        valid: false,
        error: 'File does not exist',
      }
    }

    const rawContent = fs.readFileSync(accountFilePath, 'utf8').trim()
    const appState = JSON.parse(rawContent)

    if (!Array.isArray(appState)) {
      return {
        valid: false,
        error: 'Not a valid array format',
      }
    }

    const requiredCookies = ['c_user', 'xs', 'datr']
    const cookieNames = appState.map((c) => c.name || c.key)
    const missing = requiredCookies.filter(
      (name) => !cookieNames.includes(name)
    )

    if (missing.length > 0) {
      return {
        valid: false,
        error: 'Missing required cookies: ' + missing.join(', '),
      }
    }

    const userId = getUserIdFromAppState(appState)

    return {
      valid: true,
      userId,
      cookieCount: appState.length,
      hasValidSession: !!userId,
    }
  } catch (error) {
    return {
      valid: false,
      error: 'Parse error: ' + error.message,
    }
  }
}

module.exports = {
  loginWithAccountTxt,
  getUserIdFromAppState,
  validateAccountTxt,
}