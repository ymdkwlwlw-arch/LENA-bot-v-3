const axios = require("axios");
const fs = require("fs");

module.exports.config = {
  name: "run",
  version: "2.0.0",
  hasPermssion: 3,
  credits: "Quất & AI",
  description: "تنفيذ الأكواد البرمجية مباشرة من الشات (خاص بالمطور)",
  commandCategory: "المطور",
  usages: "run [كود جافاسكريبت]",
  cooldowns: 2,
};

module.exports.run = async ({ api, event, args, Threads, Users, Currencies, models, permssion }) => {
  const { threadID, messageID, senderID } = event;
  const { sendMessage, editMessage, shareContact } = api;

  const send = (a) => {
    let output = typeof a == "object" && Object.keys(a).length != 0 ? JSON.stringify(a, null, 4) : ['number', 'boolean'].includes(typeof a) ? a.toString() : a;
    return api.sendMessage(`╭─❖ [ نتيجة التنفيذ ] ❖─╮\n\n${output}\n\n╰───────────────╯`, threadID, messageID);
  };

  const mocky = async (a) => {
    let content = typeof a == "object" ? JSON.stringify(a, null, 4) : a;
    try {
      const res = await axios.post("https://api.mocky.io/api/mock", {
        status: 200,
        content: content,
        content_type: 'application/json',
        charset: 'UTF-8',
        secret: 'LenaBot',
        expiration: 'never'
      });
      return api.sendMessage(`╭─❖ [ رابط النتيجة ] ❖─╮\n\n🔗 ${res.data.link}\n\n╰───────────────╯`, threadID, messageID);
    } catch (err) {
      return api.sendMessage(`❎ فشل رفع البيانات إلى رابط: ${err.message}`, threadID, messageID);
    }
  };

  try {
    const code = args.join(' ');
    if (!code) return api.sendMessage("╭─❖ [ تنبيه البرمجة ] ❖─╮\n\n⚠️ يرجى كتابة الكود البرمجي المراد تنفيذه.\n\n╰───────────────╯", threadID, messageID);

    const result = await eval(`(async () => { ${code} })()`);
    
    if (result !== undefined) {
      send(result);
    }
  } catch (e) {
    return api.sendMessage(
      `╭─❖ [ خطأ برمجي ] ❖─╮\n\n⚠️ حدث خطأ أثناء التنفيذ:\n${e.message}\n\n╰───────────────╯`,
      threadID,
      messageID
    );
  }
};
