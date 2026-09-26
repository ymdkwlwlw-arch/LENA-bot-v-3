module.exports.config = {
  name: "out",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "AI",
  description: "مغادرة البوت للمجموعة بدون إطارات",
  commandCategory: "المطور",
  usages: "غادري",
  cooldowns: 5,
  prefix: false
};

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, senderID, body, messageID } = event;
  if (!body) return;

  const text = body.toLowerCase().trim();
  const triggers = ["لينا غادري", "اخرجي", "غادري", "اطلعى", "اطلعي", "غادري المجموعة"];
  const isTriggerMatch = triggers.some(trigger => text === trigger || text.includes(trigger));

  if (!isTriggerMatch) return;

  let botAdmins = global.config && global.config.ADMINBOT ? global.config.ADMINBOT : [];
  try {
    const fs = require('fs-extra');
    if (fs.existsSync('./config.json')) {
      const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
      if (config.ADMINBOT) botAdmins = config.ADMINBOT;
      if (config.NDH) botAdmins = botAdmins.concat(config.NDH);
    }
  } catch (e) {}

  if (!botAdmins.includes(senderID)) {
    return api.sendMessage("افطر", threadID, messageID);
  }

  await api.sendMessage("احشكم", threadID, messageID);
  return api.removeUserFromGroup(api.getCurrentUserID(), threadID);
};

module.exports.run = async function () {};
