const axios = require("axios");
const moment = require("moment-timezone");

module.exports.config = {
  name: "prefix",
  version: "2.1.0",
  hasPermission: 0,
  credits: "DongDev & AI",
  description: "عرض بادئة البوت (Prefix) الخاصة بالنظام والمجموعة",
  commandCategory: "النظام",
  usages: "prefix",
  cooldowns: 0
};

module.exports.handleEvent = async function ({ api, event, client }) {
  const { threadID, body, messageID } = event;
  if (!body) return;

  const { PREFIX } = global.config;
  const timeNow = moment.tz("Asia/Riyadh").format("HH:mm:ss || DD/MM/YYYY");

  let threadSetting = global.data && global.data.threadData ? (global.data.threadData.get(threadID) || {}) : {};
  let prefix = threadSetting.PREFIX || PREFIX;

  const lowerBody = body.toLowerCase().trim();
  const triggers = ["prefix", "البادئة", "رمز", "الرمز", "الداله", "برفكس"];

  if (triggers.includes(lowerBody)) {
    const msgBody = 
      `╭─❖ [ نظام بادئة البوت ] ❖─╮\n` +
      `│\n` +
      `│ 📎 بادئة هذه المجموعة: [ ${prefix} ]\n` +
      `│ ⚙️ بادئة النظام العامة: [ ${PREFIX} ]\n` +
      `│ 🕒 الوقت: ${timeNow}\n` +
      `│\n` +
      `╰───────────────╯\n` +
      `📌 [ استخدم البادئة قبل أي أمر، مثال: ${prefix}مساعدة ]`;

    return api.sendMessage(msgBody, threadID, messageID);
  }
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;
  const { PREFIX } = global.config;
  
  let threadSetting = global.data && global.data.threadData ? (global.data.threadData.get(threadID) || {}) : {};
  let prefix = threadSetting.PREFIX || PREFIX;

  const msgBody = 
    `╭─❖ [ نظام بادئة البوت ] ❖─╮\n` +
    `│\n` +
    `│ 📎 بادئة هذه المجموعة: [ ${prefix} ]\n` +
    `│ ⚙️ بادئة النظام العامة: [ ${PREFIX} ]\n` +
    `│\n` +
    `╰───────────────╯\n` +
    `📌 [ اكتب البادئة قبل أي أمر لتنفيذه ]`;

  return api.sendMessage(msgBody, threadID, messageID);
};
