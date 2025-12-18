const fs = require("fs-extra");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
	config: {
		name: "help",
		version: "2.6",
		author: "Aminul Sardar (Decorated from NTKhang)",
		countDown: 5,
		role: 0,
		description: {
			en: "View all commands and usage",
			vi: "Xem tất cả lệnh và cách dùng"
		},
		category: "info",
		guide: {
			en: "{pn} [page]\n{pn} <command name>",
			vi: "{pn} [trang]\n{pn} <tên lệnh>"
		}
	},

	langs: {
		en: {
			pageNotFound: "⚠️ Page %1 does not exist.",
			commandNotFound: "⚠️ Command \"%1\" not found.",
			helpList:
				"╔═════•| 💜 |•═════╗\n" +
				" GOAT-BOT 𝐏𝐑𝐎𝐉𝐄𝐂𝐓\n" +
				"╚═════•| 💜 |•═════╝\n\n" +
				"📜 𝐏𝐀𝐆𝐄 %1/%2 📜\n\n" +
				" ━❮🖤❯━━━❪🕊️❫━━━❮🩷❯━\n" +
				"%3" +
				" ━❮🖤❯━━━❪🕊️❫━━━❮🩷❯━\n\n" +
				"📌 How To Make Free This Bot:\n👉 Facebook.com/100071880593545\n\n" +
				"🅞𝐖𝐍𝐄𝐑 🅑𝐨𝐭 🙊😝\n👉 m.me/100071880593545\n\n" +
				"━❮🖤❯━━━❪🕊️❫━━━❮🩷❯━",

			commandInfo:
				"╔═════•| 📖 |•═════╗\n" +
				"   𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐃𝐄𝐓𝐀𝐈𝐋𝐒\n" +
				"╚═════•| 📖 |•═════╝\n\n" +
				"🔹 Name: %1\n" +
				"🔹 Description: %2\n" +
				"🔹 Role: %3\n" +
				"🔹 Version: %4\n" +
				"🔹 Author: %5\n\n" +
				"💡 Usage:\n%6\n\n" +
				"━❮🖤❯━━━❪🕊️❫━━━❮🩷❯━"
		},

		vi: {
			pageNotFound: "⚠️ Trang %1 không tồn tại.",
			commandNotFound: "⚠️ Lệnh \"%1\" không tồn tại.",
			helpList:
				"╔═════•| 💜 |•═════╗\n" +
				" GOAT-BOT 𝐏𝐑𝐎𝐉𝐄𝐂𝐓\n" +
				"╚═════•| 💜 |•═════╝\n\n" +
				"📜 𝐓𝐫𝐚𝐧𝐠 %1/%2 📜\n\n" +
				" ━❮🖤❯━━━❪🕊️❫━━━❮🩷❯━\n" +
				"%3" +
				" ━❮🖤❯━━━❪🕊️❫━━━❮🩷❯━\n\n" +
				"📌 Cách tạo bot free:\n👉 Facebook.com/100071880593545\n\n" +
				"🅞𝐖𝐍𝐄𝐑 🅑𝐨𝐭 🙊😝\n👉 m.me/100071880593545\n\n" +
				"━❮🖤❯━━━❪🕊️❫━━━❮🩷❯━",

			commandInfo:
				"╔═════•| 📖 |•═════╗\n" +
				"   𝐓𝐇𝐎̂𝐍𝐆 𝐓𝐈𝐍 𝐋𝐄̣̂𝐍𝐇\n" +
				"╚═════•| 📖 |•═════╝\n\n" +
				"🔹 Tên: %1\n" +
				"🔹 Mô tả: %2\n" +
				"🔹 Quyền: %3\n" +
				"🔹 Phiên bản: %4\n" +
				"🔹 Tác giả: %5\n\n" +
				"💡 Cách dùng:\n%6\n\n" +
				"━❮🖤❯━━━❪🕊️❫━━━❮🩷❯━"
		}
	},

	onStart: async function ({ message, args, event, threadsData, getLang, role }) {
		const { threadID } = event;
		const prefix = getPrefix(threadID);

		// ================= COMMAND DETAILS =================
		if (args[0] && isNaN(args[0])) {
			const cmdName = args[0].toLowerCase();
			const command =
				commands.get(cmdName) ||
				commands.get(aliases.get(cmdName));

			if (!command)
				return message.reply(getLang("commandNotFound", args[0]));

			const cfg = command.config;
			const usage = (cfg.guide?.en || cfg.guide || "")
				.replace(/\{pn\}/g, prefix + cfg.name);

			const roleText =
				cfg.role == 0 ? "0 (All users)" :
				cfg.role == 1 ? "1 (Group admin)" :
				"2 (Bot admin)";

			return message.reply(
				getLang(
					"commandInfo",
					cfg.name,
					cfg.description?.en || cfg.description || "No description",
					roleText,
					cfg.version || "1.0",
					cfg.author || "Unknown",
					usage || "No usage guide"
				)
			);
		}

		// ================= COMMAND LIST =================
		let arrayInfo = [];
		for (const [name, value] of commands) {
			if (value.config.role > role) continue;
			arrayInfo.push(name);
		}

		arrayInfo.sort();

		const page = parseInt(args[0]) || 1;
		const numberOfOnePage = 10;
		const totalPage = Math.ceil(arrayInfo.length / numberOfOnePage);

		if (page < 1 || page > totalPage)
			return message.reply(getLang("pageNotFound", page));

		const start = (page - 1) * numberOfOnePage;
		const end = start + numberOfOnePage;
		const listPage = arrayInfo.slice(start, end);

		let textList = "";
		listPage.forEach((cmd, index) => {
			textList += `│ ▪ ${start + index + 1} ➩ ${cmd}\n`;
		});

		return message.reply(
			getLang("helpList", page, totalPage, textList)
		);
	}
};
