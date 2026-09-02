module.exports = {
	config: {
		name: "onlyadminbox",
		aliases: ["onlyadbox", "adboxonly", "adminboxonly"],
		version: "1.4",
		author: "Aminul Sardar",
		countDown: 5,
		role: 1,
		description: "Turn on/off only admin box can use bot",
		category: "box chat",
		guide: "{pn} [on | off]: turn on/off the mode only admin of group can use bot\n{pn} noti [on | off]: turn on/off the notification when user is not admin of group use bot"
	},

	langs: {
		en: {
			noPermission: "❌ Only group admins or bot admins can use this command.",
			turnedOn: "Turned on the mode only admin of group can use bot",
			turnedOff: "Turned off the mode only admin of group can use bot",
			turnedOnNoti: "Turned on the notification when user is not admin of group use bot",
			turnedOffNoti: "Turned off the notification when user is not admin of group use bot",
			syntaxError: "Syntax error, only use {pn} on or {pn} off"
		}
	},

	onStart: async function ({ args, message, event, threadsData, getLang, api }) {
		const { adminBot } = global.GoatBot.config;
		const adminIDs = await threadsData.get(event.threadID, "adminIDs");
		if (!adminIDs.includes(event.senderID) && !adminBot.includes(event.senderID))
			return message.reply(getLang("noPermission"));

		let isSetNoti = false;
		let value;
		let keySetData = "data.onlyAdminBox";
		let indexGetVal = 0;

		if (args[0] == "noti") {
			isSetNoti = true;
			indexGetVal = 1;
			keySetData = "data.hideNotiMessageOnlyAdminBox";
		}

		if (args[indexGetVal] == "on")
			value = true;
		else if (args[indexGetVal] == "off")
			value = false;
		else
			return message.reply(getLang("syntaxError"));

		await threadsData.set(event.threadID, isSetNoti ? !value : value, keySetData);

		if (isSetNoti)
			return message.reply(value ? getLang("turnedOnNoti") : getLang("turnedOffNoti"));
		else
			return message.reply(value ? getLang("turnedOn") : getLang("turnedOff"));
	}
};
