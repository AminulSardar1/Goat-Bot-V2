const fs = require("fs-extra");
const { utils } = global;

module.exports = {
	config: {
		name: "prefix",
		version: "1.5",
		author: "NTKhang(aminul)",
		countDown: 5,
		role: 0,
		description: "Change bot's command prefix in your chat or globally (admin only)",
		category: "config",
		guide: {
			vi: `
   {pn} <new prefix> : Thay đổi prefix mới trong box chat của bạn
   Ví dụ: {pn} #

   {pn} <new prefix> -g : Thay đổi prefix mới trong hệ thống bot (chỉ admin)
   Ví dụ: {pn} # -g

   {pn} reset : Reset prefix về mặc định
`,
			en: `
   {pn} <new prefix> : Change new prefix in your box chat
   Example: {pn} #

   {pn} <new prefix> -g : Change new prefix in system bot (admin only)
   Example: {pn} # -g

   {pn} reset : Reset prefix to default
`
		}
	},

	langs: {
		vi: {
			reset: "Đã reset prefix về mặc định: %1",
			onlyAdmin: "Chỉ admin mới có thể thay đổi prefix hệ thống bot",
			confirmGlobal: "Vui lòng thả cảm xúc vào tin nhắn này để xác nhận thay đổi prefix toàn hệ thống bot",
			confirmThisThread: "Vui lòng thả cảm xúc vào tin nhắn này để xác nhận thay đổi prefix trong nhóm chat của bạn",
			successGlobal: "Đã thay đổi prefix hệ thống bot thành: %1",
			successThisThread: "Đã thay đổi prefix trong nhóm chat của bạn thành: %1",
			myPrefix: `
➽────────────────❥
🌟 Thông tin Prefix Bot 🌟

💫 🌐 Prefix hệ thống: %1
🛸 Prefix nhóm của bạn: %2
🔧 Sử dụng: Gõ "%2help" để xem tất cả lệnh
👑 Bot by: @Aminusardar
🔗 Facebook: https://www.facebook.com/100071880593545
🎯 Chúc bạn sử dụng bot vui vẻ! 💖
➽────────────────❥`
		},
		en: {
			reset: "Your prefix has been reset to default: %1",
			onlyAdmin: "Only admin can change prefix of system bot",
			confirmGlobal: "Please react to this message to confirm change prefix of system bot",
			confirmThisThread: "Please react to this message to confirm change prefix in your box chat",
			successGlobal: "Changed prefix of system bot to: %1",
			successThisThread: "Changed prefix in your box chat to: %1",
			myPrefix: `
➽────────────────❥
🌟 Bot Prefix Information 🌟

💫 🌐 System prefix: %1
🛸 Your box chat prefix: %2
🔧 Usage: Type "%2help" to see all commands
👑 Bot by: @Aminusardar
🔗 Facebook: facebook.com/100071880593545
🎯 Enjoy using the bot! 💖
➽────────────────❥`
		}
	},

	onStart: async function ({ message, role, args, commandName, event, threadsData, getLang }) {
		if (!args[0])
			return message.SyntaxError();

		// Reset thread prefix
		if (args[0] === 'reset') {
			await threadsData.set(event.threadID, null, "data.prefix");
			return message.reply(getLang("reset", global.GoatBot.config.prefix));
		}

		const newPrefix = args[0];
		const formSet = { commandName, author: event.senderID, newPrefix };

		// Global prefix
		if (args[1] === "-g") {
			if (role < 2) return message.reply(getLang("onlyAdmin"));
			formSet.setGlobal = true;
		} else formSet.setGlobal = false;

		// Ask for reaction confirmation
		return message.reply(args[1] === "-g" ? getLang("confirmGlobal") : getLang("confirmThisThread"), (err, info) => {
			formSet.messageID = info.messageID;
			global.GoatBot.onReaction.set(info.messageID, formSet);
		});
	},

	onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {
		const { author, newPrefix, setGlobal } = Reaction;
		if (event.userID !== author) return;

		if (setGlobal) {
			global.GoatBot.config.prefix = newPrefix;
			fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
			return message.reply(getLang("successGlobal", newPrefix));
		} else {
			await threadsData.set(event.threadID, newPrefix, "data.prefix");
			return message.reply(getLang("successThisThread", newPrefix));
		}
	},

	onChat: async function ({ event, message, getLang }) {
		if (event.body && event.body.toLowerCase() === "prefix") {
			const systemPrefix = global.GoatBot.config.prefix;
			const threadPrefix = utils.getPrefix(event.threadID);
			return message.reply(getLang("myPrefix", systemPrefix, threadPrefix));
		}
	}
};
