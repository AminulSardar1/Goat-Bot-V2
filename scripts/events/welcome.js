const { getTime } = global.utils;
const moment = require("moment-timezone");

if (!global.temp.welcomeEvent) global.temp.welcomeEvent = {};

module.exports = {
  config: {
    name: "welcome",
    version: "1.8",
    author: "Aminul Sardar",
    category: "events"
  },

  langs: {
    en: {
      defaultWelcomeMessage: `Welcome {userName} 🎉

Total members: {membersCount}
Total admins: {adminsCount}

Time: {dateTime}`
    }
  },

  onStart: async ({ threadsData, message, event, api, getLang, usersData }) => {
    if (event.logMessageType !== "log:subscribe") return;

    const { threadID } = event;
    const dataAddedParticipants = event.logMessageData.addedParticipants;

    // If new member is bot, skip
    if (dataAddedParticipants.some(item => item.userFbId === api.getCurrentUserID())) return;

    // Init temp storage for this thread
    if (!global.temp.welcomeEvent[threadID]) {
      global.temp.welcomeEvent[threadID] = { joinTimeout: null, dataAddedParticipants: [] };
    }

    global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
    clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

    global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async () => {
      const threadData = await threadsData.get(threadID);
      if (threadData.settings.sendWelcomeMessage === false) return;

      const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
      const threadInfo = (await api.getThreadInfo(threadID)) || {};

      if (dataAddedParticipants.length === 0) return;

      const membersCount = threadInfo.participantIDs ? threadInfo.participantIDs.length : (threadData.members || []).length;
      const adminsCount = threadInfo.adminIDs ? threadInfo.adminIDs.length : (threadData.adminIDs || []).length;

      for (const user of dataAddedParticipants) {
        const userName = user.fullName;
        const userId = user.userFbId;
        const dateTime = moment().tz("Asia/Manila").format("MMMM Do YYYY, h:mm:ss a");

        let welcomeMessage =
          threadData.data.welcomeMessage || getLang("defaultWelcomeMessage");

        welcomeMessage = welcomeMessage
          .replace(/\{userName\}/g, userName)
          .replace(/\{membersCount\}/g, membersCount)
          .replace(/\{adminsCount\}/g, adminsCount)
          .replace(/\{dateTime\}/g, dateTime);

        const form = { body: welcomeMessage, mentions: [{ tag: userName, id: userId }] };
        message.send(form);
      }

      delete global.temp.welcomeEvent[threadID];
    }, 1500);
  }
};
