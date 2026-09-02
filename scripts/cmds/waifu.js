const axios = require('axios');

module.exports = {
  config: {
    name: "waifu",
    aliases: ["waifu, neko"],
    version: "1.0",
    author: "Aminul Sardar",
    countDown: 5,
    role: 0,
    shortDescription: "get random waifu",
    longDescription: "",
    category: "anime",
    guide: "{pn} {{<name>}}"
  },

  onStart: async function ({ message, args }) {
    const name = args.join(" ");
    if (!name)

      try {
        let res = await axios.get(`https://api.waifu.pics/sfw/waifu`)


        let res2 = res.data
        let img = res2.url

        const form = {
          body: `354097`

        };
        if (img)
          form.attachment = await global.utils.getStreamFromURL(img);
        message.reply(form);
      } catch (e) {
        message.reply(`🥺 Not Found`)
      }


    else {

      try {
        let res = await axios.get(`https://api.waifu.pics/sfw/${name}`)


        let res2 = res.data
        let img1 = res2.url

        const form = {
          body: `   「 𝔀𝓪𝓲𝓯𝓾  」   `

        };
        if (img1)
          form.attachment = await global.utils.getStreamFromURL(img1);
        message.reply(form);
      } catch (e) { message.reply(`🥺 No waifu 🥲 \n category: waifu, neko, shinobu, megumin, bully, cuddle, cry, kiss, lick, hug, awoo, pat, smug, bonk, yeet, blush, smile, wave, highfive, handhold, nom, bite, glomp, slap, kill, kick, happy, wink, poke, dance, cringe `) }

    }
  }
};