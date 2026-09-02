const { findUid } = global.utils;
const moment = require("moment-timezone");

module.exports = {
	config: {
		name: "ban",
		version: "1.4",
		author: "Aminul Sardar",
		countDown: 5,
		role: 1,
		description: {
			en: "Ban or unban users from the group chat"
		},
		category: "box chat",
		guide: {
			en: "   {pn} [@tag|uid|fb link|reply] [<reason>|leave blank]: Ban a user\n   {pn} check: Check and remove banned users\n   {pn} unban [@tag|uid|fb link|reply]: Unban a user\n   {pn} list: View the list of banned users"
		}
	},

	langs: {
		en: {
			notFoundTarget: "⚠️ | Please tag the person to ban or enter UID, FB link, or reply to their message",
			notFoundTargetUnban: "⚠️ | Please tag the person to unban or enter UID, FB link, or reply to their message",
			userNotBanned: "⚠️ | The person with ID %1 is not banned from this chat",
			unbannedSuccess: "✅ | Unbanned %1 from this chat!",
			cantSelfBan: "⚠️ | You can't ban yourself!",
			cantBanAdmin: "❌ | You can't ban an admin!",
			existedBan: "❌ | This user is already banned!",
			noReason: "No reason",
			bannedSuccess: "✅ | Banned %1 from this chat!",
			needAdmin: "⚠️ | Bot needs admin permission to kick banned users",
			noName: "Facebook user",
			noData: "📑 | No users are banned in this chat",
			listBanned: "📑 | List of banned users (page %1/%2)",
			content: "%1/ %2 (%3)\nReason: %4\nBanned on: %5\n\n",
			needAdminToKick: "⚠️ | %1 (%2) is banned but the bot lacks admin rights. Grant admin to allow automatic kick.",
			bannedKick: "⚠️ | %1 was already banned!\nUID: %2\nReason: %3\nTime: %4\n\nBot automatically kicked this user"
		}
	},

	onStart: async function ({ message, event, args, threadsData, getLang, usersData, api }) {
		const { members, adminIDs } = await threadsData.get(event.threadID);
		const { senderID } = event;
		let target, reason;
		const dataBanned = await threadsData.get(event.threadID, "data.banned_ban", []);

		if (args[0] === "unban") {
			if (!isNaN(args[1])) target = args[1];
			else if (args[1]?.startsWith("https")) target = await findUid(args[1]);
			else if (Object.keys(event.mentions || {}).length) target = Object.keys(event.mentions)[0];
			else if (event.messageReply?.senderID) target = event.messageReply.senderID;
			else return api.sendMessage(getLang("notFoundTargetUnban"), event.threadID, event.messageID);

			const index = dataBanned.findIndex(i => i.id == target);
			if (index == -1) return api.sendMessage(getLang("userNotBanned", target), event.threadID, event.messageID);
			dataBanned.splice(index, 1);
			await threadsData.set(event.threadID, dataBanned, "data.banned_ban");
			const userName = members[target]?.name || await usersData.getName(target) || getLang("noName");
			return api.sendMessage(getLang("unbannedSuccess", userName), event.threadID, event.messageID);
		}

		if (args[0] === "check") {
			if (!dataBanned.length) return;
			for (const user of dataBanned) {
				if (event.participantIDs.includes(user.id)) api.removeUserFromGroup(user.id, event.threadID);
			}
		}

		if (event.messageReply?.senderID) {
			target = event.messageReply.senderID;
			reason = args.join(" ");
		} else if (Object.keys(event.mentions || {}).length) {
			target = Object.keys(event.mentions)[0];
			reason = args.join(" ").replace(event.mentions[target], "");
		} else if (!isNaN(args[0])) {
			target = args[0];
			reason = args.slice(1).join(" ");
		} else if (args[0]?.startsWith("https")) {
			target = await findUid(args[0]);
			reason = args.slice(1).join(" ");
		} else if (args[0] === "list") {
			if (!dataBanned.length) return message.reply(getLang("noData"));
			const limit = 20;
			const page = parseInt(args[1] || 1);
			const start = (page - 1) * limit;
			const end = page * limit;
			const data = dataBanned.slice(start, end);
			let msg = "";
			let count = 0;
			for (const user of data) {
				count++;
				const name = members[user.id]?.name || await usersData.getName(user.id) || getLang("noName");
				msg += getLang("content", start + count, name, user.id, user.reason, user.time);
			}
			return message.reply(getLang("listBanned", page, Math.ceil(dataBanned.length / limit)) + "\n\n" + msg);
		}

		if (!target) return message.reply(getLang("notFoundTarget"));
		if (target == senderID) return message.reply(getLang("cantSelfBan"));
		if (adminIDs.includes(target)) return message.reply(getLang("cantBanAdmin"));

		const banned = dataBanned.find(i => i.id == target);
		if (banned) return message.reply(getLang("existedBan"));

		const name = members[target]?.name || await usersData.getName(target) || getLang("noName");
		const time = moment().tz(global.GoatBot.config.timeZone).format("HH:mm:ss DD/MM/YYYY");
		const data = { id: target, time, reason: reason || getLang("noReason") };

		dataBanned.push(data);
		await threadsData.set(event.threadID, dataBanned, "data.banned_ban");
		message.reply(getLang("bannedSuccess", name), () => {
			if (members.some(i => i.userID == target)) {
				if (adminIDs.includes(api.getCurrentUserID())) {
					if (event.participantIDs.includes(target)) api.removeUserFromGroup(target, event.threadID);
				} else {
					message.send(getLang("needAdmin"), (err, info) => {
						global.GoatBot.onEvent.push({
							messageID: info.messageID,
							onStart: ({ event }) => {
								if (event.logMessageType === "log:thread-admins" && event.logMessageData.ADMIN_EVENT == "add_admin") {
									if (event.logMessageData.TARGET_ID == api.getCurrentUserID()) {
										api.removeUserFromGroup(target, event.threadID);
										global.GoatBot.onEvent = global.GoatBot.onEvent.filter(i => i.messageID != info.messageID);
									}
								}
							}
						});
					});
				}
			}
		});
	},

	onEvent: async function ({ event, api, threadsData, getLang, message }) {
		if (event.logMessageType == "log:subscribe") {
			const dataBanned = await threadsData.get(event.threadID, "data.banned_ban", []);
			const usersAdded = event.logMessageData.addedParticipants;
			for (const user of usersAdded) {
				const { userFbId, fullName } = user;
				const banned = dataBanned.find(i => i.id == userFbId);
				if (banned) {
					const reason = banned.reason || getLang("noReason");
					const time = banned.time;
					api.removeUserFromGroup(userFbId, event.threadID, err => {
						if (err) return message.send(getLang("needAdminToKick", fullName, userFbId), (err, info) => {
							global.GoatBot.onEvent.push({
								messageID: info.messageID,
								onStart: ({ event }) => {
									if (event.logMessageType === "log:thread-admins" && event.logMessageData.ADMIN_EVENT == "add_admin") {
										if (event.logMessageData.TARGET_ID == api.getCurrentUserID()) {
											api.removeUserFromGroup(userFbId, event.threadID);
											global.GoatBot.onEvent = global.GoatBot.onEvent.filter(i => i.messageID != info.messageID);
										}
									}
								}
							});
						});
						else message.send(getLang("bannedKick", fullName, userFbId, reason, time));
					});
				}
			}
		}
	}
};
