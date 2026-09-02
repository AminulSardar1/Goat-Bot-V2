module.exports = {
	config: {
		name: "balance",
		aliases: ["bal"],
		version: "1.2",
		author: "Aminul Sardar",
		countDown: 5,
		role: 0,
		description: {
			en: "View your balance or the balance of the tagged user"
		},
		category: "economy",
		guide: {
			en: "   {pn}: view your balance\n   {pn} <@tag>: view the balance of the tagged user"
		}
	},

	langs: {
		en: {
			money: "You have %1$",
			moneyOf: "%1 has %2$"
		}
	},

	onStart: async function ({ message, usersData, event, getLang }) {
		if (Object.keys(event.mentions).length > 0) {
			const uids = Object.keys(event.mentions);
			let msg = "";
			for (const uid of uids) {
				const userMoney = await usersData.get(uid, "money");
				msg += getLang("moneyOf", event.mentions[uid].replace("@", ""), userMoney) + "\n";
			}
			return message.reply(msg);
		}
		const userData = await usersData.get(event.senderID);
		message.reply(getLang("money", userData.money));
	}
};
