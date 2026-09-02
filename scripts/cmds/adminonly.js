const fs = require("fs-extra");
const { config } = global.GoatBot;
const { client } = global;

module.exports = {
	config: {
		name: "adminonly",
		aliases: ["adonly", "onlyad", "onlyadmin"],
		version: "1.5",
		author: "Aminul Sardar",
		countDown: 5,
		role: 2,
		description: {
			en: "Turn on/off only admin can use bot"
		},
		category: "owner",
		guide: {
			en: "   {pn} [on | off]: Turn on/off only admin can use bot\n   {pn} noti [on | off]: Turn on/off notification when non-admin user uses bot"
		}
	},

	langs: {
		en: {
			turnedOn: "Turned on the mode: only admins can use the bot",
			turnedOff: "Turned off the mode: everyone can use the bot",
			turnedOnNoti: "Turned on notification when non-admin user tries to use bot",
			turnedOffNoti: "Turned off notification when non-admin user tries to use bot"
		}
	},

	onStart: function ({ args, message, getLang }) {
		let isSetNoti = false;
		let value;
		let indexGetVal = 0;

		if (args[0] == "noti") {
			isSetNoti = true;
			indexGetVal = 1;
		}

		if (args[indexGetVal] == "on")
			value = true;
		else if (args[indexGetVal] == "off")
			value = false;
		else
			return message.SyntaxError();

		if (isSetNoti) {
			config.hideNotiMessage.adminOnly = !value;
			message.reply(getLang(value ? "turnedOnNoti" : "turnedOffNoti"));
		} else {
			config.adminOnly.enable = value;
			message.reply(getLang(value ? "turnedOn" : "turnedOff"));
		}

		fs.writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));
	}
};
