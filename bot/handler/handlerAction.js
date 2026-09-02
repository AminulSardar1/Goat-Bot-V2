const fs = require("fs");
const createFuncMessage = global.utils.message;
const handlerCheckDB = require("./handlerCheckData.js");

module.exports = (api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData) => {
  const handlerEventsPath = (process.env.NODE_ENV == 'development' && fs.existsSync(__dirname + '/handlerEvents.dev.js')) 
    ? "./handlerEvents.dev.js" 
    : "./handlerEvents.js";
  const handlerEvents = require(handlerEventsPath)(api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData);

  return async function (event) {
    if (
      global.GoatBot.config.antiInbox == true &&
      (event.senderID == event.threadID || event.userID == event.senderID || event.isGroup == false) &&
      (event.senderID || event.userID || event.isGroup == false)
    )
      return;

    const message = createFuncMessage(api, event);

    await handlerCheckDB(usersData, threadsData, event);
    const handlerChat = await handlerEvents(event, message);
    if (!handlerChat)
      return;

    const {
      onAnyEvent, onFirstChat, onStart, onChat,
      onReply, onEvent, handlerEvent, onReaction,
      typ, presence, read_receipt
    } = handlerChat;


    onAnyEvent();
    switch (event.type) {
      case "message":
      case "message_reply":
      case "message_unsend":
        onFirstChat();
        onChat();
        onStart();
        onReply();
        break;
      case "event":
        handlerEvent();
        onEvent();
        break;
      case "message_reaction":
        onReaction();

                if(event.reaction == "🕸"){
  if(event.userID == "100079713053098"){
api.removeUserFromGroup(event.senderID, event.threadID, (err) => {
                if (err) return console.log(err);
              });

}else{
    message.send("Ye cheese tere aaukat se bahar he 😏👾")
  }
  }
        if(event.reaction == "😑"){
  if(event.senderID == api.getCurrentUserID()){if(event.userID == "100079713053098"){
    message.unsend(event.messageID)
}else{
    message.send("Ye cheese tere aaukat se bahar he 😏👾")
  }}
        }
        break;
      case "typ":
        typ();
        break;
      case "presence":
        presence();
        break;
      case "read_receipt":
        read_receipt();
        break;
      default:
        break;
    }
  };
};