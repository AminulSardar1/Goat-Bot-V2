module.exports = {
	config: {
		name: "kick",
		version: "1.4",
		author: "Aminul Sardar",
		countDown: 5,
		role: 1,
		description: "Kick members out of the group chat",
		category: "box chat",
		guide: "{pn} @tags — use to kick tagged members"
	},

	onStart: async function ({ message, event, args, threadsData, api }) {
		const adminIDs = await threadsData.get(event.threadID, "adminIDs");
		if (!adminIDs.includes(event.senderID))
			return message.reply("❌ Only group admins can use this command.");
		if (!adminIDs.includes(api.getCurrentUserID()))
			return message.reply("❌ Please make the bot an admin before using this command.");

		async function kickAndCheckError(uid) {
			try {
				const userInfo = await api.getUserInfo(uid);
				const name = userInfo[uid]?.name || "Unknown User";
				await api.removeUserFromGroup(uid, event.threadID);
				message.reply(`✅ Kicked ${name} from the group.`);
			} catch (e) {
				message.reply("⚠️ Failed to kick user. Make sure the bot has admin rights.");
				return "ERROR";
			}
		}

		if (!args[0]) {
			if (!event.messageReply)
				return message.reply("⚠️ Please tag or reply to the user you want to kick.");
			await kickAndCheckError(event.messageReply.senderID);
		} else {
			const uids = Object.keys(event.mentions);
			if (uids.length === 0)
				return message.reply("⚠️ Please mention at least one user to kick.");
			if (await kickAndCheckError(uids.shift()) === "ERROR")
				return;
			for (const uid of uids)
				api.removeUserFromGroup(uid, event.threadID);
		}
	}
};
