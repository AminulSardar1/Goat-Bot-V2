module.exports = {
	config: {
		name: "unsend",
		aliases: ["unsent", "uns"],
		version: "1.0",
		author: "Aminul Sardar",
		countDown: 5,
		role: 0,
		description: "Unsend bot's message",
		category: "box chat",
		guide: "reply the message you want to unsend and call the command {pn}"
	},

	onStart: async function ({ message, event, api }) {
		if (!event.messageReply || event.messageReply.senderID != api.getCurrentUserID())
			return message.reply("Please reply the message you want to unsend");
		message.unsend(event.messageReply.messageID);
	}
};
