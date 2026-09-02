function checkShortCut(nickname, uid, userName) {
	/\{userName\}/gi.test(nickname) ? nickname = nickname.replace(/\{userName\}/gi, userName) : null;
	/\{userID\}/gi.test(uid) ? nickname = nickname.replace(/\{userID\}/gi, uid) : null;
	return nickname;
}

module.exports = {
	config: {
		name: "autosetname",
		version: "1.3",
		author: "Aminul Sardar",
		cooldowns: 5,
		role: 1,
		description: {
			en: "Automatically set nickname for new members joining the chat group"
		},
		category: "box chat",
		guide: {
			en: '   {pn} set <nickname>: set nickname format with shortcuts:\n'
				+ '   + {userName}: name of new member\n'
				+ '   + {userID}: member id\n'
				+ '   Example:\n'
				+ '    {pn} set {userName} 🚀\n\n'
				+ '   {pn} [on | off]: turn on/off the feature\n\n'
				+ '   {pn} [view | info]: show current configuration'
		}
	},

	langs: {
		en: {
			missingConfig: "Please enter the required configuration",
			configSuccess: "Configuration saved successfully",
			currentConfig: "Current autoSetName configuration:\n%1",
			notSetConfig: "Your group has not set the autoSetName configuration yet",
			syntaxError: "Syntax error, only \"{pn} on\" or \"{pn} off\" can be used",
			turnOnSuccess: "AutoSetName feature has been turned on",
			turnOffSuccess: "AutoSetName feature has been turned off",
			error: "An error occurred while setting the nickname, try turning off the invite link feature and try again later"
		}
	},

	onStart: async function ({ message, event, args, threadsData, getLang }) {
		switch (args[0]) {
			case "set":
			case "add":
			case "config": {
				if (args.length < 2)
					return message.reply(getLang("missingConfig"));
				const configAutoSetName = args.slice(1).join(" ");
				await threadsData.set(event.threadID, configAutoSetName, "data.autoSetName");
				return message.reply(getLang("configSuccess"));
			}
			case "view":
			case "info": {
				const configAutoSetName = await threadsData.get(event.threadID, "data.autoSetName");
				return message.reply(configAutoSetName ? getLang("currentConfig", configAutoSetName) : getLang("notSetConfig"));
			}
			default: {
				const enableOrDisable = args[0];
				if (enableOrDisable !== "on" && enableOrDisable !== "off")
					return message.reply(getLang("syntaxError"));
				await threadsData.set(event.threadID, enableOrDisable === "on", "settings.enableAutoSetName");
				return message.reply(enableOrDisable == "on" ? getLang("turnOnSuccess") : getLang("turnOffSuccess"));
			}
		}
	},

	onEvent: async ({ message, event, api, threadsData, getLang }) => {
		if (event.logMessageType !== "log:subscribe")
			return;
		if (!await threadsData.get(event.threadID, "settings.enableAutoSetName"))
			return;
		const configAutoSetName = await threadsData.get(event.threadID, "data.autoSetName");
		return async function () {
			const addedParticipants = [...event.logMessageData.addedParticipants];
			for (const user of addedParticipants) {
				const { userFbId: uid, fullName: userName } = user;
				try {
					await api.changeNickname(checkShortCut(configAutoSetName, uid, userName), event.threadID, uid);
				} catch {
					return message.reply(getLang("error"));
				}
			}
		};
	}
};
