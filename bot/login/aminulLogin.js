const fs = require("fs-extra");
const path = require("path");
const login = require("sagor-fca");

async function loginWithAccountTxt(accountFilePath, options = {}) {
  try {
    if (!fs.existsSync(accountFilePath)) {
      throw new Error("Account file not found: " + accountFilePath);
    }
    const rawData = fs.readFileSync(accountFilePath, "utf8").trim();
    let appState;
    try {
      appState = JSON.parse(rawData);
      if (!Array.isArray(appState)) {
        throw new Error("Invalid appState format: Expected an array");
      }
      const requiredCookies = ["c_user", "xs", "datr"];
      const existingKeys = appState.map(cookie => cookie.key || cookie.name);
      for (const reqKey of requiredCookies) {
        if (!existingKeys.includes(reqKey)) {
          throw new Error("Missing required cookie: " + reqKey);
        }
      }
      appState = appState.map(cookie => {
        if (cookie.key && !cookie.name) {
          return {
            ...cookie,
            key: cookie.key,
            domain: cookie.domain || ".facebook.com",
            path: cookie.path || "/",
            hostOnly: cookie.hostOnly || false,
            creation: cookie.creation || new Date().toISOString(),
            lastAccessed: cookie.lastAccessed || new Date().toISOString()
          };
        }
        return cookie;
      });
    } catch (parseErr) {
      throw new Error("Failed to parse account.txt: " + parseErr.message);
    }

    const defaultOptions = {
      forceLogin: true,
      listenEvents: true,
      updatePresence: true,
      selfListen: true,
      selfListenEvent: true,
      autoMarkDelivery: false,
      autoReconnect: true,
      online: true,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      ...options
    };

    console.log("[ SAGOR-LOGIN ]", "Starting login with account.txt...");
    console.log("[ SAGOR-LOGIN ]", `Found ${appState.length} cookies in account.txt`);

    return new Promise((resolve, reject) => {
      login({ appState }, defaultOptions, (err, api) => {
        if (err) {
          console.error("[ SAGOR-LOGIN ]", "Error during login process:", err);
          if (err.error === "Error during login process:") {
            return reject(new Error("Invalid or expired session. Please update your account.txt with fresh cookies."));
          } else if (err.error === "checkpoint-required" || (err.error && err.error.includes && err.error.includes("checkpoint"))) {
            return reject(new Error("Facebook checkpoint required. Please log into Facebook manually to resolve security checks."));
          } else if (err.toString().includes("login-approval")) {
            return reject(new Error("Login approval required. Please check your Facebook account for security alerts."));
          }
          return reject(err);
        }

        console.log("[ SAGOR-LOGIN ]", "Successfully logged in with sagor-fca!");
        try {
          const freshAppState = api.getAppState();
          fs.writeFileSync(accountFilePath, JSON.stringify(freshAppState, null, 2));
          console.log("[ SAGOR-LOGIN ]", "Updated account.txt with fresh session data");
        } catch (saveErr) {
          console.warn("[ SAGOR-LOGIN ]", "Warning: Could not save updated session:", saveErr.message);
        }
        resolve(api);
      });
    });
  } catch (error) {
    console.error("[ SAGOR-LOGIN ]", "Login failed:", error.message);
    throw error;
  }
}

function getUserIdFromAppState(appState) {
  try {
    const cUserCookie = appState.find(cookie => cookie.key === "c_user" || cookie.name === "c_user");
    return cUserCookie ? cUserCookie.value : null;
  } catch (err) {
    return null;
  }
}

function validateAccountTxt(accountFilePath) {
  try {
    if (!fs.existsSync(accountFilePath)) {
      return { valid: false, error: "File does not exist" };
    }
    const rawData = fs.readFileSync(accountFilePath, "utf8").trim();
    const appState = JSON.parse(rawData);
    if (!Array.isArray(appState)) {
      return { valid: false, error: "Not a valid array format" };
    }
    const requiredCookies = ["c_user", "xs", "datr"];
    const existingKeys = appState.map(cookie => cookie.key || cookie.name);
    const missingKeys = requiredCookies.filter(key => !existingKeys.includes(key));
    if (missingKeys.length > 0) {
      return { valid: false, error: "Missing required cookies: " + missingKeys.join(", ") };
    }
    const userId = getUserIdFromAppState(appState);
    return {
      valid: true,
      userId,
      cookieCount: appState.length,
      hasValidSession: !!userId
    };
  } catch (err) {
    return { valid: false, error: "Parse error: " + err.message };
  }
}

module.exports = {
  loginWithAccountTxt,
  getUserIdFromAppState,
  validateAccountTxt
};
