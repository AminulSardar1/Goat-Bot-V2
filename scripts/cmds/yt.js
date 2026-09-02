const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const https = require("https");

let pendingDownloads = {}; // Track results per thread

module.exports = {
  config: {
    name: "yt",
    aliases: ["youtube", "yts"],
    version: "6.6",
    author: "Aminul Sardar",
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
    const messageID = event.messageID;

    const query = args.join(" ").trim();
    if (!query) return api.sendMessage("❌ Please provide a search term!", threadID, messageID);

    try {
      // Fixed: Using correct search API endpoint
      const res = await axios.get(`https://aminul-youtube-api.vercel.app/search?query=${encodeURIComponent(query)}`);
      const data = res.data;

      if (!data || data.length === 0) {
        return api.sendMessage("😔 No videos found! Try another keyword.", threadID, messageID);
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

        // Download thumbnail if available
        if (v.thumbnail) {
          try {
            const thumbPath = await downloadImage(v.thumbnail, `thumb_${threadID}_${i}.jpg`);
            attachments.push(fs.createReadStream(thumbPath));
          } catch (thumbErr) {
            console.error("Thumbnail download error:", thumbErr);
          }
        }
      }

      msg += `\n📥 Reply with **1-${videos.length}** to download your chosen video!\n⚡ Powered by Aminul API`;

      return api.sendMessage({ 
        body: msg, 
        attachment: attachments.length > 0 ? attachments : null 
      }, threadID, messageID);

    } catch (err) {
      console.error("Search error:", err);
      api.sendMessage("⚠️ Failed to fetch YouTube videos. Try again later.", threadID, messageID);
    }
  },

  onChat: async function({ api, event }) {
    const threadID = event.threadID;
    const messageID = event.messageID;
    const message = event.body?.trim();

    if (!message || !pendingDownloads[threadID] || !/^[1-5]$/.test(message)) return;

    const index = parseInt(message) - 1;
    const video = pendingDownloads[threadID][index];
    
    if (!video) {
      return api.sendMessage("❌ Invalid selection!", threadID, messageID);
    }

    const title = video.title;
    const url = video.url;

    // Send initial loading message
    const loadingMsg = await api.sendMessage(`⏳ Downloading **${title}**... Please wait!`, threadID);

    try {
      // Fixed: Using correct downloader API endpoint
      const downloadInfo = await axios.get(`https://aminul-rest-api-three.vercel.app/downloader/alldownloader?url=${encodeURIComponent(url)}`);
      
      // Fixed: Correct data path from API response
      const videoData = downloadInfo.data?.data?.data;
      if (!videoData) {
        throw new Error("Invalid API response structure");
      }

      const videoUrl = videoData.high || videoData.low;
      if (!videoUrl) {
        return api.sendMessage("❌ Cannot download this video. It may be restricted.", threadID, messageID);
      }

      // Create cache directory if it doesn't exist
      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);

      const filePath = path.join(cacheDir, `yt_${threadID}_${Date.now()}.mp4`);

      await downloadFile(videoUrl, filePath);

      await api.sendMessage({
        body: `✅ **Download Successful!**\n\n🎬 **Title:** ${title}\n📥 Your video is ready!`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => {
        // Clean up file after sending
        fs.unlinkSync(filePath);
      });

      // Clean up thumbnails
      for (let i = 0; i < 5; i++) {
        const thumbPath = path.join(__dirname, `thumb_${threadID}_${i}.jpg`);
        if (fs.existsSync(thumbPath)) {
          fs.unlinkSync(thumbPath);
        }
      }

    } catch (err) {
      console.error("Download error:", err);
      api.sendMessage("❌ Error occurred while downloading the video. Try again later.", threadID, messageID);
    }

    // Clear pending downloads
    delete pendingDownloads[threadID];
  }
};

// Helper: download thumbnail
async function downloadImage(url, filename) {
  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'arraybuffer'
    });
    
    const filePath = path.join(__dirname, filename);
    await fs.writeFile(filePath, response.data);
    return filePath;
  } catch (error) {
    throw new Error(`Failed to download image: ${error.message}`);
  }
}

// Helper: download video file
function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      // Check for redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        return downloadFile(redirectUrl, filepath).then(resolve).catch(reject);
      }

      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
      
    }).on('error', (err) => {
      // Clean up failed download
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      reject(err);
    });
  });
        }
