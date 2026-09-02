const axios = require("axios");

module.exports = {
  config: {
    name: "jan",
    version: "1.4.1",
    author: "Aminul Sardar",
    countDown: 0,
    role: 0,
    aliases: ["jaan", "janu", "bby"],
    shortDescription: "Jan AI চ্যাটবট",
    longDescription: "Jan AI বট যেটা শেখানো যেতে পারে এবং প্রশ্নের উত্তর দিতে পারে।",
    category: "jan",
    guide: `{pn} <message>
{pn} teach <প্রশ্ন> - <উত্তর>
{pn} count`
  },

  // ===== Fetch total Q&A count from server =====
  async fetchCount() {
    try {
      const res = await axios.get(`https://jan-api-by-aminul-sordar.vercel.app/count`);
      return res.data;
    } catch (e) {
      console.error("fetchCount error:", e.message);
      return { questions: 0, answers: 0 };
    }
  },

  // ===== Get answer from server =====
  async getAnswer(question) {
    try {
      const res = await axios.get(`https://jan-api-by-aminul-sordar.vercel.app/answer/${encodeURIComponent(question)}`);
      return res.data.answer || "❌ আমি এখনো এটা শিখিনি, দয়া করে আমাকে শেখান! 👀";
    } catch (e) {
      console.error("getAnswer error:", e.message);
      return "❌ সার্ভার থেকে উত্তর পাওয়া যায়নি, পরে আবার চেষ্টা করুন!";
    }
  },

  // ===== Teach multiple questions at once =====
  async teachMultiple(qaText) {
    try {
      const res = await axios.post(`https://jan-api-by-aminul-sordar.vercel.app/teach`, { text: qaText });
      return res.data.message;
    } catch (e) {
      console.error("teachMultiple error:", e.message);
      return "❌ শেখানো ব্যর্থ হয়েছে! সার্ভার সমস্যা হতে পারে।";
    }
  },

  // ===== Handle reply from user =====
  onReply: async function ({ api, event }) {
    const reply = event.body.trim();
    const responseMessage = await this.getAnswer(reply);

    await api.sendMessage(responseMessage, event.threadID, (err, info) => {
      if (!err) {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          type: "reply",
          messageID: info.messageID,
          author: event.senderID
        });
      }
    }, event.messageID);
  },

  // ===== Main command entry point =====
  onStart: async function ({ api, args, event }) {
    if (args.length < 1) {
      return api.sendMessage("❌ দয়া করে একটি প্রশ্ন করুন!", event.threadID, event.messageID);
    }

    const command = args[0].toLowerCase();

    // Handle count request
    if (command === "count") {
      const count = await this.fetchCount();
      return api.sendMessage(
        `📊 জ্ঞানভাণ্ডার:\n\n` +
        `📌 মোট প্রশ্ন: ${count.questions}\n` +
        `📌 মোট উত্তর: ${count.answers}\n\n` +
        `💡 আমাকে আরও শেখানোর মাধ্যমে আমাকে আরও স্মার্ট বানান!\n` +
        `🔍 কিছু প্রশ্ন করুন, আমি চেষ্টা করব উত্তর দেওয়ার!`,
        event.threadID, event.messageID
      );
    }

    // Handle teaching new Q&A
    if (command === "teach") {
      const input = args.slice(1).join(" ").trim();
      if (!input.includes(" - ")) {
        return api.sendMessage(
          "❌ সঠিক ফরম্যাট ব্যবহার করুন:\n/teach প্রশ্ন - উত্তর\n\nএকাধিক প্রশ্ন দিতে চাইলে '|' দিয়ে আলাদা করুন।",
          event.threadID, event.messageID
        );
      }

      const message = await this.teachMultiple(input);
      return api.sendMessage(message, event.threadID, event.messageID);
    }

    // Default: ask a question
    const input = args.join(" ").trim();
    const responseMessage = await this.getAnswer(input);

    await api.sendMessage(responseMessage, event.threadID, (err, info) => {
      if (!err) {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          type: "reply",
          messageID: info.messageID,
          author: event.senderID
        });
      }
    }, event.messageID);
  },

  // ===== Auto-detect chat with jan, bby, bot, etc. =====
  onChat: async function ({ api, event }) {
    try {
      const body = event.body ? event.body.toLowerCase().trim() : "";
      const prefixes = ["baby", "bby", "bot", "jan", "babu", "janu"];
      const startsWithPrefix = prefixes.find(prefix => body.startsWith(prefix));

      if (startsWithPrefix) {
        const question = body.replace(/^\S+\s*/, "").trim();

        if (question.length > 0) {
          const response = await this.getAnswer(body);
          return api.sendMessage(response, event.threadID, (err, info) => {
            if (!err) {
              global.GoatBot.onReply.set(info.messageID, {
                commandName: this.config.name,
                type: "reply",
                messageID: info.messageID,
                author: event.senderID
              });
            }
          }, event.messageID);
        }

        // If no question asked, reply randomly — and set up reply tracking
        const randomReplies = [
          "হ্যাঁ 😀, আমি এখানে আছি",
          "কেমন আছো?",
          "বলো জান কি করতে পারি তোমার জন্য",
          `তুমি বলেছো: "${body}"? কিউট!`,
          "I love you 💝",
          "ভালোবাসি তোমাকে 🤖",
          "Hi, I'm messenger Bot, I can help you.?🤖",
          "Use callad to contact admin!",
          "Hi, Don't disturb 🤖 🚘 Now I'm going to Feni, Bangladesh..bye",
          "Hi, 🤖 I can help you~~~~",
          "আমি এখন আমিনুল বসের সাথে বিজি আছি",
          "আমাকে আমাকে না ডেকে আমার বসকে ডাকো",
          "Hmmm sona 🖤 meye hoile kule aso ar sele hoile kule new 🫂😘",
          "Yah This Bot creator : PRINCE RID((A.R))",
          "হা বলো, শুনছি আমি 🤸‍♂️🫂",
          "Ato daktasen kn bujhlam na 😡",
          "jan bal falaba,🙂",
          "ask amr mon vlo nei dakben na🙂",
          "Hmm jan ummah😘😘",
          "jang hanga korba 🙂🖤",
          "iss ato dako keno lojja lage to 🫦🙈",
          "suna tomare amar valo lage,🙈😽"
        ];
        const reply = randomReplies[Math.floor(Math.random() * randomReplies.length)];
        return api.sendMessage(reply, event.threadID, (err, info) => {
          if (!err) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: this.config.name,
              type: "reply",
              messageID: info.messageID,
              author: event.senderID
            });
          }
        }, event.messageID);
      }
    } catch (e) {
      console.error("onChat error:", e.message);
    }
  }
};
