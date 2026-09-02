const { getStreamsFromAttachment, log } = global.utils;
const mediaTypes = ["photo", "png", "animated_image", "video", "audio"];

module.exports = {
	config: {
		name: "callad",
		version: "1.7",
		author: "Aminul Sardar",
		countDown: 5,
		role: 0,
		description: {
			en: "Send a report, feedback, or bug message to the bot admin."
		},
		category: "contacts admin",
		guide: {
			en: "   {pn} <message>"
		}
	},

	langs: {
		en: {
			missingMessage: "Please enter the message you want to send to the admin.",
			sendByGroup: "\n- Sent from group: %1\n- Thread ID: %2",
			sendByUser: "\n- Sent from user",
			content: "\n\nContent:\n─────────────────\n%1\n─────────────────\nReply to this message to send a message to the user.",
			success: "Your message has been sent to %1 admin(s) successfully!\n%2",
			failed: "An error occurred while sending your message to %1 admin(s).\n%2\nCheck console for more details.",
			reply: "📍 Reply from admin %1:\n─────────────────\n%2\n─────────────────\nReply to this message to continue messaging the admin.",
			replySuccess: "Your reply has been sent to the admin successfully!",
			feedback: "📝 Feedback from user %1:\n- User ID: %2%3\n\nContent:\n─────────────────\n%4\n─────────────────\nReply to this message to send a message back to the user.",
			replyUserSuccess: "Your reply has been sent to the user successfully!",
			noAdmin: "The bot currently has no admin configured."
		}
	},

	onStart: async function ({ args, message, event, usersData, threadsData, api, commandName, getLang }) {
		const { config } = global.GoatBot;

		if (!args[0]) return message.reply(getLang("missingMessage"));
		if (config.adminBot.length === 0) return message.reply(getLang("noAdmin"));

		const { senderID, threadID, isGroup } = event;
		const senderName = await usersData.getName(senderID);

		const msg = "==📨️ CALL ADMIN 📨️=="
			+ `\n- User Name: ${senderName}`
			+ `\n- User ID: ${senderID}`
			+ (isGroup ? getLang("sendByGroup", (await threadsData.get(threadID)).threadName, threadID) : getLang("sendByUser"));

		const formMessage = {
			body: msg + getLang("content", args.join(" ")),
			mentions: [{ id: senderID, tag: senderName }],
			attachment: await getStreamsFromAttachment(
				[...event.attachments, ...(event.messageReply?.attachments || [])]
					.filter(item => mediaTypes.includes(item.type))
			)
		};

		const successIDs = [];
		const failedIDs = [];
		const adminNames = await Promise.all(config.adminBot.map(async id => ({
			id,
			name: await usersData.getName(id)
		})));

		for (const uid of config.adminBot) {
			try {
				const messageSend = await api.sendMessage(formMessage, uid);
				successIDs.push(uid);
				global.GoatBot.onReply.set(messageSend.messageID, {
					commandName,
					messageID: messageSend.messageID,
					threadID,
					messageIDSender: event.messageID,
					type: "userCallAdmin"
				});
			} catch (err) {
				failedIDs.push({ adminID: uid, error: err });
			}
		}

		let msg2 = "";
		if (successIDs.length > 0)
			msg2 += getLang(
				"success",
				successIDs.length,
				adminNames.filter(item => successIDs.includes(item.id))
					.map(item => ` <@${item.id}> (${item.name})`).join("\n")
			);
		if (failedIDs.length > 0) {
			msg2 += getLang(
				"failed",
				failedIDs.length,
				failedIDs.map(item => ` <@${item.adminID}> (${adminNames.find(i => i.id === item.adminID)?.name || item.adminID})`).join("\n")
			);
			log.err("CALL ADMIN", failedIDs);
		}

		return message.reply({
			body: msg2,
			mentions: adminNames.map(item => ({ id: item.id, tag: item.name }))
		});
	},

	onReply: async ({ args, event, api, message, Reply, usersData, commandName, getLang }) => {
		const { type, threadID, messageIDSender } = Reply;
		const senderName = await usersData.getName(event.senderID);
		const { isGroup } = event;

		switch (type) {
			case "userCallAdmin": {
				const formMessage = {
					body: getLang("reply", senderName, args.join(" ")),
					mentions: [{ id: event.senderID, tag: senderName }],
					attachment: await getStreamsFromAttachment(
						event.attachments.filter(item => mediaTypes.includes(item.type))
					)
				};

				api.sendMessage(formMessage, threadID, (err, info) => {
					if (err) return message.err(err);
					message.reply(getLang("replyUserSuccess"));
					global.GoatBot.onReply.set(info.messageID, {
						commandName,
						messageID: info.messageID,
						messageIDSender: event.messageID,
						threadID: event.threadID,
						type: "adminReply"
					});
				}, messageIDSender);
				break;
			}

			case "adminReply": {
				let sendByGroup = "";
				if (isGroup) {
					const threadInfo = await api.getThreadInfo(event.threadID);
					const threadName = threadInfo?.threadName || "Group";
					sendByGroup = getLang("sendByGroup", threadName, event.threadID);
				}
				const formMessage = {
					body: getLang("feedback", senderName, event.senderID, sendByGroup, args.join(" ")),
					mentions: [{ id: event.senderID, tag: senderName }],
					attachment: await getStreamsFromAttachment(
						event.attachments.filter(item => mediaTypes.includes(item.type))
					)
				};

				api.sendMessage(formMessage, threadID, (err, info) => {
					if (err) return message.err(err);
					message.reply(getLang("replySuccess"));
					global.GoatBot.onReply.set(info.messageID, {
						commandName,
						messageID: info.messageID,
						messageIDSender: event.messageID,
						threadID: event.threadID,
						type: "userCallAdmin"
					});
				}, messageIDSender);
				break;
			}

			default:
				break;
		}
	}
};
