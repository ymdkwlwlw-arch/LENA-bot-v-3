module.exports.config = {
  name: "اشعار",
  version: "1.0.0",
  hasPermssion: 3,
  credits: "AI",
  description: "إرسال رسالة جماعية لجميع المجموعات (خاص بالمطور)",
  commandCategory: "المطور",
  usages: "اشعار [الرسالة]",
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

  const broadcastMessage = args.join(" ");
  if (!broadcastMessage) {
    return api.sendMessage("يرجى كتابة النص المراد إرساله كإشعار جماعي للمجموعات.", threadID, messageID);
  }

  try {
    const inbox = await api.getThreadList(1000, null, ["INBOX"]);
    const listGroup = inbox.filter(group => group.isGroup && group.isThread);

    if (listGroup.length === 0) {
      return api.sendMessage("البوت ليس في أي مجموعة حالياً.", threadID, messageID);
    }

    api.sendMessage(`جاري إرسال الإشعار إلى (${listGroup.length}) مجموعة...`, threadID, messageID);

    let successCount = 0;
    let failCount = 0;

    const finalMsg = 
      `╭─❖ [ إشعار من المطور ] ❖─╮\n\n` +
      `${broadcastMessage}\n\n` +
      `╰───────────────╯`;

    for (const group of listGroup) {
      try {
        await api.sendMessage(finalMsg, group.threadID);
        successCount++;
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        failCount++;
      }
    }

    return api.sendMessage(`تم إرسال الإشعار بنجاح إلى ${successCount} مجموعة (فشل الإرسال إلى ${failCount}).`, threadID, messageID);

  } catch (e) {
    return api.sendMessage(`حدث خطأ أثناء تنفيذ الإشعار الجماعي: ${e.message}`, threadID, messageID);
  }
};
