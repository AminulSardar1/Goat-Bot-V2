module.exports = {
  config: {
    name: "slot",
    version: "1.0",
    author: "Aminul Sardar",
    shortDescription: {
      en: "Slot game",
    },
    longDescription: {
      en: "A slot game with a 50% chance to win.",
    },
    category: "game",
  },
  langs: {
    en: {
      invalid_amount: "Please enter a valid bet amount.",
      not_enough_money: "You don't have enough money to place this bet.",
      spin_message: "Spinning the slot machine...",
      win_message: "You won %1$💸! 🎉",
      lose_message: "You lost %1$... 😔",
      jackpot_message: "Congratulations! You hit the jackpot and won %1$! 🤑",
    },
  },
  onStart: async function ({ args, message, event, envCommands, usersData, commandName, getLang }) {
    const { senderID } = event;
    const userData = await usersData.get(senderID);
    const amount = parseInt(args[0]);

    if (isNaN(amount) || amount <= 0) {
      return message.reply(getLang("invalid_amount"));
    }

    if (amount > userData.money) {
      return message.reply(getLang("not_enough_money"));
    }

    const win = Math.random() < 0.5; // 50% chance to win

    let winnings = 0;

    if (win) {
      winnings = amount;
    } else {
      winnings = -amount;
    }

    await usersData.set(senderID, {
      money: userData.money + winnings,
      data: userData.data,
    });

    const messageText = getSpinResultMessage(win, winnings, getLang);

    return message.reply(messageText);
  },
};

function getSpinResultMessage(win, winnings, getLang) {
  if (win) {
    if (winnings === 0) {
      return getLang("spin_message");
    } else if (winnings === 1) {
      return getLang("win_message", winnings) + " 🎉";
    } else {
      return getLang("jackpot_message", winnings);
    }
  } else {
    return getLang("lose_message", -winnings) + " 😔";
  }
}