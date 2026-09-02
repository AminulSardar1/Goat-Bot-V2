const axios = require("axios");

module.exports = {
  config: {
    name: "surah",
    aliases: ["surah"],
    version: "4.0",
    author: "Aminul Sardar",
    countDown: 5,
    role: 0,
    shortDescription: "Get Surah info + audio",
    longDescription: "Fetch Surah information with translation and recitation",
    category: "religion",
    guide: {
      en: "{pn} <surah_number>\nExample: {pn} 103"
    }
  },

  onStart: async function ({ message, args }) {
    try {
      const surahNumber = args[0];

      if (!surahNumber || isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) {
        return message.reply("📖 | Please provide a valid surah number (1-114).\nExample: .quran 103");
      }

      // ✅ Your Custom API
      const apiURL = `https://aminul-rest-api-three.vercel.app/quran/surah?number=${surahNumber}`;
      const res = await axios.get(apiURL);

      if (!res.data.status) {
        return message.reply("⚠️ | Failed to fetch Surah data.");
      }

      const data = res.data.data;

      const reply =
`📖 | ${data.surah.name} (${data.surah.arabicName})

🔢 Number: ${data.surah.number}
📜 Total Ayahs: ${data.surah.totalAyahs}
📌 Revelation: ${data.surah.revelationType}

🕌 First Ayah (Arabic):
${data.firstAyah.arabic}

🌍 First Ayah (English):
${data.firstAyah.english}

⚡ Powered by Aminul REST API`;

      await message.reply(reply);

      // ✅ Stream Audio
      const audioStream = await global.utils.getStreamFromURL(data.audio);

      await message.reply({
        attachment: audioStream
      });

    } catch (err) {
      console.error("Quran command error:", err);
      return message.reply("⚠️ | Server error. Try again later.");
    }
  }
};
