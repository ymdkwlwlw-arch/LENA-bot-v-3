module.exports.config = {
  name: "لاست",
  version: "2.1.0",
  hasPermssion: 3,
  credits: "AI",
  description: "عرض قائمة مجموعات البوت وإدارتها بإطار أنيق (خاص بالمطور)",
  commandCategory: "المطور",
  usages: "لاست",
  cooldowns: 5,
  prefix: true
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID } = event;

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
    return api.sendMessage("عذراً، هذا الأمر مخصص للمطور فقط.", threadID, messageID);
  }

  try {
    const inbox = await api.getThreadList(100, null, ["INBOX"]);
    const listGroup = inbox.filter(group => group.isGroup && group.isThread);

    if (listGroup.length === 0) {
      return api.sendMessage("البوت ليس في أي مجموعة حالياً.", threadID, messageID);
    }

    let msg = "";
    let groupDataList = [];

    for (let i = 0; i < listGroup.length; i++) {
      const group = listGroup[i];
      groupDataList.push({
        threadID: group.threadID,
        name: group.name || "مجموعة بدون اسم"
      });
      msg += `│ ${i + 1}. 🏠 ${group.name || "مجموعة بدون اسم"}\n│ 🆔 الآي دي: ${group.threadID}\n├───────────────\n`;
    }

    const menuMsg = 
      `╭─❖ [ قائمة مجموعات البوت ] ❖─╮\n\n` +
      msg +
      `\n📌 [ الرد على هذه الرسالة برقم المجموعة + (مغادرة) ]\n` +
      `📝 مثال: 1 مغادرة\n` +
      `╰───────────────╯`;

    return api.sendMessage(menuMsg, threadID, (err, info) => {
      if (!err) {
        global.client.handleReply.push({
          name: module.exports.config.name,
          messageID: info.messageID,
          author: senderID,
          groups: groupDataList
        });
      }
    }, messageID);

  } catch (e) {
    return api.sendMessage(`حدث خطأ أثناء جلب المجموعات: ${e.message}`, threadID, messageID);
  }
};

module.exports.handleReply = async function ({ event, api, handleReply }) {
  const { groups, author, messageID } = handleReply;
  const { senderID, threadID, body } = event;

  if (senderID !== author) return;

  const args = body.trim().split(" ");
  const choice = parseInt(args[0]);
  const action = args[1] ? args[1].toLowerCase() : "";

  if (isNaN(choice) || choice <= 0 || choice > groups.length) {
    return api.sendMessage("يرجى الرد برقم صحيح متبوعاً بكلمة مغادرة. مثال: 2 مغادرة", threadID, event.messageID);
  }

  const targetGroup = groups[choice - 1];

  if (action === "مغادرة" || action === "out" || action === "خروج") {
    try {
      await api.removeUserFromGroup(api.getCurrentUserID(), targetGroup.threadID);
      try { api.unsendMessage(messageID); } catch(e) {}
      return api.sendMessage(`تم مغادرة مجموعة (${targetGroup.name}) بنجاح.`, threadID, event.messageID);
    } catch (e) {
      return api.sendMessage(`فشل مغادرة المجموعة: ${e.message}`, threadID, event.messageID);
    }
  } else {
    return api.sendMessage("يرجى كتابة كلمة (مغادرة) بجانب رقم المجموعة. مثال: 1 مغادرة", threadID, event.messageID);
  }
};
