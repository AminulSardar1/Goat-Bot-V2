const axios = require('axios');
const { getStreamFromURL } = global.utils;

module.exports = {
	config: {
		name: "avatar",
		author: "Aminul Sardar",
		version: "1.6",
		cooldowns: 5,
		role: 0,
		description: {
			en: "Create an anime avatar with a signature"
		},
		category: "image",
		guide: {
			en: "   {p}{n} <character id or name> | <background text> | <signature> | <background color name or hex color>\n   {p}{n} help: view command usage"
		}
	},

	langs: {
		en: {
			initImage: "Initializing image, please wait...",
			invalidCharacter: "Currently there are only %1 characters in the system, please enter an id less than that",
			notFoundCharacter: "No character named %1 was found",
			errorGetCharacter: "An error occurred while fetching character data:\n%1: %2",
			success: "✅ Your avatar\nCharacter: %1\nID: %2\nBackground text: %3\nSignature: %4\nColor: %5",
			defaultColor: "default",
			error: "An error occurred\n%1: %2"
		}
	},

	onStart: async function ({ args, message, getLang }) {
		const content = args.join(" ").split("|").map(item => item.trim());
		let characterId, characterName;
		const backgroundText = content[1];
		const signature = content[2];
		const colorBg = content[3];
		if (!args[0])
			return message.SyntaxError();
		message.reply(getLang("initImage"));
		try {
			const dataCharacter = (await axios.get("https://goatbotserver.onrender.com/taoanhdep/listavataranime?apikey=ntkhang")).data.data;
			if (!isNaN(content[0])) {
				characterId = parseInt(content[0]);
				const totalCharacter = dataCharacter.length - 1;
				if (characterId > totalCharacter)
					return message.reply(getLang("invalidCharacter", totalCharacter));
				characterName = dataCharacter[characterId].name;
			} else {
				const foundCharacter = dataCharacter.find(item => item.name.toLowerCase() == content[0].toLowerCase());
				if (foundCharacter) {
					characterId = foundCharacter.stt;
					characterName = content[0];
				} else
					return message.reply(getLang("notFoundCharacter", content[0]));
			}
		} catch (error) {
			const err = error.response.data;
			return message.reply(getLang("errorGetCharacter", err.error, err.message));
		}

		const endpoint = `https://goatbotserver.onrender.com/taoanhdep/avataranime`;
		const params = {
			id: characterId,
			chu_Nen: backgroundText,
			chu_Ky: signature,
			apikey: "ntkhangGoatBot"
		};
		if (colorBg)
			params.colorBg = colorBg;

		try {
			const avatarImage = await getStreamFromURL(endpoint, "avatar.png", { params });
			message.reply({
				body: getLang("success", characterName, characterId, backgroundText, signature, colorBg || getLang("defaultColor")),
				attachment: avatarImage
			});
		} catch (error) {
			error.response.data.on("data", function (e) {
				const err = JSON.parse(e);
				message.reply(getLang("error", err.error, err.message));
			});
		}
	}
};
