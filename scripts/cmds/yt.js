const axios = require("axios");
const fs = require("fs");
const path = require("path");
const https = require("https");

let pendingDownloads = {}; // Track results per thread

module.exports = {
  config: {
    name: "yt",
    aliases: ["youtube", "yts"],
    version: "6.6",
    author: "Aminul Sordar (Fixed by Gemini)",
    role: 0,
    category: "media",
    shortDescription: "Search & download YouTube videos interactively",
    longDescription: "Search YouTube, show top results, then reply with a number to download the video.",
    guide: {
      en: "{pn} [search term] - Search YouTube\nReply 1-5 to download the video",
      bn: "{pn} [সার্চ শব্দ] - ইউটিউব সার্চ\n1-5 নম্বর রিপ্লাই করলে ভিডিও ডাউনলোড হবে"
    }
  },

  onStart: async function({ api, event, args }) {
    const threadID = event.threadID;

    const query = args.join(" ").trim();
    if (!query) return api.sendMessage("❌ Please provide a search term!", threadID, event.messageID);

    try {
      const res = await axios.get(`https://aminul-youtube-api.vercel.app/search?query=${encodeURIComponent(query)}`);
      const data = res.data;

      if (!data || data.length === 0) {
        return api.sendMessage("😔 No videos found! Try another keyword.", threadID, event.messageID);
      }

      const videos = data.slice(0, 5); // Top 5 results
      pendingDownloads[threadID] = videos;

      // Build message with thumbnails
      let attachments = [];
      let msg = `🎬 **YouTube Search Results** 🎬\n🔎 **Query:** ${query}\n\n`;
      msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

      for (let i = 0; i < videos.length; i++) {
        const v = videos[i];
        msg += `✨ **${i + 1}. ${v.title}**\n`;
        msg += `👤 Channel: ${v.author?.name || "Unknown"}\n`;
        msg += `⏱ Duration: ${v.duration?.timestamp || "N/A"}\n`;
        msg += `👁 Views: ${v.views?.toLocaleString() || "N/A"}\n`;
        msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

        if (v.thumbnail) {
          const thumbPath = await downloadImage(v.thumbnail, `thumb_${threadID}_${i}.jpg`);
          attachments.push(fs.createReadStream(thumbPath));
        }
      }

      msg += `\n📥 Reply with **1-${videos.length}** to download your chosen video!\n⚡ Powered by Aminul API`;

      return api.sendMessage({ body: msg, attachment: attachments }, threadID);

    } catch (err) {
      console.error(err);
      api.sendMessage("⚠️ Failed to fetch YouTube videos. Try again later.", threadID, event.messageID);
    }
  },

  onChat: async function({ api, event }) {
    const threadID = event.threadID;
    const message = event.body.trim();

    if (pendingDownloads[threadID] && /^[1-5]$/.test(message)) {
      const index = parseInt(message) - 1;
      const video = pendingDownloads[threadID][index];
      if (!video) return api.sendMessage("❌ Invalid selection!", threadID, event.messageID);

      const title = video.title;
      const url = video.url;

      api.sendMessage(`⏳ Downloading **${title}**... Please wait!`, threadID);

      try {
        const downloadInfo = await axios.get(`https://aminul-rest-api-three.vercel.app/downloader/alldownloader?url=${encodeURIComponent(url)}`);
        const videoUrl = downloadInfo.data.data.high || downloadInfo.data.data.low;
        if (!videoUrl) return api.sendMessage("❌ Cannot download this video. It may be restricted.", threadID, event.messageID);

        const filePath = path.join(__dirname, `video_${threadID}.mp4`);

        await downloadFile(videoUrl, filePath);

        api.sendMessage({
          body: `✅ Successfully downloaded: **${title}**\n🎉 Enjoy your video!`,
          attachment: fs.createReadStream(filePath)
        }, threadID, () => fs.unlinkSync(filePath));

      } catch (err) {
        console.error(err);
        api.sendMessage("❌ Error occurred while downloading the video. Try again later.", threadID, event.messageID);
      }

      delete pendingDownloads[threadID];
    }
  }
};

// Helper: download thumbnail or video
async function downloadImage(url, filename) {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  const filePath = path.join(__dirname, filename);
  fs.writeFileSync(filePath, response.data);
  return filePath;
}

function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (res) => {
      res.pipe(file);
      file.on("finish", () => {
        file.close(resolve);
      });
    }).on("error", (err) => {
      fs.unlinkSync(filepath);
      reject(err);
    });
  });
}
