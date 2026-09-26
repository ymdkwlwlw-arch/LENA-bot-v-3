module.exports.config = {
    name: "اعدادات",
    version: "5.0.0",
    hasPermssion: 1,
    credits: "BraSL & AI",
    description: "لوحة تحكم حماية وتعديلات المجموعة",
    commandCategory: "المجموعات",
    usages: "اعدادات",
    cooldowns: 5,
    images: [],
    dependencies: {
      "fs-extra": "",
    },
  };
  const { readdirSync, readFileSync, writeFileSync, existsSync, unlinkSync } = require("fs-extra");
  const path = require('path');
  const fs = require('fs');
  const axios = require('axios');

  module.exports.handleReply = async function ({ api, event, args, handleReply, Threads }) {
    const { senderID, threadID, messageID, messageReply } = event;
    const { author, permssion } = handleReply;
    const pathData = global.anti;
    const dataAnti = JSON.parse(readFileSync(pathData, "utf8"));
  
    if (author !== senderID) return api.sendMessage("❎ عذراً، هذا الأمر ليس مخصصاً لك.", threadID, messageID);
  
    var number = event.args.filter(i => !isNaN(i));
    for (const num of number) {
      switch (num) {
        case "1": {
          if (permssion < 1) return api.sendMessage("⚠️ عذراً، ليس لديك صلاحية كافية لاستخدام هذا الأمر.", threadID, messageID);
          var NameBox = dataAnti.boxname;
          const antiImage = NameBox.find((item) => item.threadID === threadID);
          if (antiImage) {
            dataAnti.boxname = dataAnti.boxname.filter((item) => item.threadID !== threadID);
            api.sendMessage("☑️ تم [إيقاف] حماية اسم المجموعة بنجاح.", threadID, messageID);
          } else {
            var threadName = (await api.getThreadInfo(event.threadID)).threadName;
            dataAnti.boxname.push({ threadID, name: threadName });
            api.sendMessage("☑️ تم [تفعيل] حماية اسم المجموعة بنجاح.", threadID, messageID);
          }
          writeFileSync(pathData, JSON.stringify(dataAnti, null, 4));
          break;
        }
        case "2": {
          if (permssion < 1) return api.sendMessage("⚠️ عذراً، ليس لديك صلاحية كافية لاستخدام هذا الأمر.", threadID, messageID);
          const antiImage = dataAnti.boximage.find((item) => item.threadID === threadID);
          if (antiImage) {
            dataAnti.boximage = dataAnti.boximage.filter((item) => item.threadID !== threadID);
            api.sendMessage("☑️ تم [إيقاف] حماية صورة المجموعة بنجاح.", threadID, messageID);
          } else {
            var threadInfo = await api.getThreadInfo(event.threadID);
            let url = threadInfo.imageSrc;
            let response = await global.api.imgur(url);
            let img = response.link;
            dataAnti.boximage.push({ threadID, url: img });
            api.sendMessage("☑️ تم [تفعيل] حماية صورة المجموعة بنجاح.", threadID, messageID);
          }
          writeFileSync(pathData, JSON.stringify(dataAnti, null, 4));
          break;
        }
        case "3": {
          if (permssion < 1) return api.sendMessage("⚠️ عذراً، ليس لديك صلاحية كافية لاستخدام هذا الأمر.", threadID, messageID);
          const NickName = dataAnti.antiNickname.find((item) => item.threadID === threadID);
          if (NickName) {
            dataAnti.antiNickname = dataAnti.antiNickname.filter((item) => item.threadID !== threadID);
            api.sendMessage("☑️ تم [إيقاف] حماية الألقاب والأعضاء بنجاح.", threadID, messageID);
          } else {
            const nickName = (await api.getThreadInfo(event.threadID)).nicknames;
            dataAnti.antiNickname.push({ threadID, data: nickName });
            api.sendMessage("☑️ تم [تفعيل] حماية الألقاب والأعضاء بنجاح.", threadID, messageID);
          }
          writeFileSync(pathData, JSON.stringify(dataAnti, null, 4));
          break;
        }
        case "4": {
          if (permssion < 1) return api.sendMessage("⚠️ عذراً، ليس لديك صلاحية كافية لاستخدام هذا الأمر.", threadID, messageID);
          const antiout = dataAnti.antiout;
          if (antiout[threadID] == true) {
            antiout[threadID] = false;
            api.sendMessage("☑️ تم [إيقاف] منع خروج الاعضاء (Anti-Out) بنجاح.", threadID, messageID);
          } else {
            antiout[threadID] = true;
            api.sendMessage("☑️ تم [تفعيل] منع خروج الاعضاء (Anti-Out) بنجاح.", threadID, messageID);
          }
          writeFileSync(pathData, JSON.stringify(dataAnti, null, 4));
          break;
        }
        case "5": {
          const filepath = path.join(__dirname, 'data', 'antiemoji.json');
          let data = JSON.parse(fs.readFileSync(filepath, 'utf8'));  
          let emoji = "";
          try {
            let threadInfo = await api.getThreadInfo(threadID);
            emoji = threadInfo.emoji;
          } catch (error) {
            console.error("Error:", error);
          }
          if (!data.hasOwnProperty(threadID)) {
            data[threadID] = { emoji: emoji, emojiEnabled: true };
            fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
          } else {
            data[threadID].emojiEnabled = !data[threadID].emojiEnabled;
            if (data[threadID].emojiEnabled) data[threadID].emoji = emoji;
            fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
          }
          const statusMsg = data[threadID].emojiEnabled ? "تفعيل" : "إيقاف";
          api.sendMessage(`☑️ تم [${statusMsg}] حماية إيموجي المجموعة بنجاح.`, threadID, messageID);
          break;
        }
        case "6": {
          const filepath = path.join(__dirname, 'data', 'antitheme.json');
          let data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
          let theme = "";
          try {
            const threadInfo = await Threads.getInfo(threadID);
            theme = threadInfo.threadTheme.id;
          } catch (error) {
            console.error("Error:", error);
          }
          if (!data.hasOwnProperty(threadID)) {
            data[threadID] = { themeid: theme || "", themeEnabled: true };
            fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
          } else {
            data[threadID].themeEnabled = !data[threadID].themeEnabled;
            if (data[threadID].themeEnabled) data[threadID].themeid = theme || "";
            fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
          }
          const statusMsg = data[threadID].themeEnabled ? "تفعيل" : "إيقاف";
          api.sendMessage(`☑️ تم [${statusMsg}] حماية سمة المجموعة بنجاح.`, threadID, messageID);
          break;
        }
        case "7": {
          const dataAntiPath = __dirname + '/data/antiqtv.json';
          const info = await api.getThreadInfo(event.threadID);
          if (!info.adminIDs.some(item => item.id == api.getCurrentUserID())) 
            return api.sendMessage('❎ يحتاج البوت ليكون مشرفاً لتنفيذ هذا الأمر.', event.threadID, event.messageID);
          let data = JSON.parse(fs.readFileSync(dataAntiPath));
          if (!data[threadID]) {
            data[threadID] = true;
            api.sendMessage("☑️ تم [تفعيل] حماية المشرفين (Anti-Admin) بنجاح.", threadID, messageID);
          } else {
            data[threadID] = false;
            api.sendMessage("☑️ تم [إيقاف] حماية المشرفين (Anti-Admin) بنجاح.", threadID, messageID);
          }
          fs.writeFileSync(dataAntiPath, JSON.stringify(data, null, 4));
          break;
        }
        case "9": {
          const antiImage = dataAnti.boximage.find((item) => item.threadID === threadID);
          const antiBoxname = dataAnti.boxname.find((item) => item.threadID === threadID);
          const antiNickname = dataAnti.antiNickname.find((item) => item.threadID === threadID);
          return api.sendMessage(`╭─❖ [ حالة إعدادات الحماية ] ❖─╮\n\n1. حماية الاسم: ${antiBoxname ? "[✅]" : "[❌]"}\n2. حماية الصورة: ${antiImage ? "[✅]" : "[❌]"}\n3. حماية الألقاب: ${antiNickname ? "[✅]" : "[❌]"}\n4. منع الخروج: ${dataAnti.antiout[threadID] ? "[✅]" : "[❌]"}\n\n╰───────────────╯`, threadID);
        }
        default: {
          return api.sendMessage("❎ الرقم الذي اخترته غير صحيح، يرجى الرد برقم صالح من القائمة.", threadID, messageID);
        }
      }
    }
  };
  
  module.exports.run = async ({ api, event, args, permssion, Threads }) => {
    const { threadID, messageID, senderID } = event;
    const pathData = global.anti;
    
    let dataAnti = { boxname: [], boximage: [], antiNickname: [], antiout: {} };
    try {
      if (fs.existsSync(pathData)) {
        dataAnti = JSON.parse(readFileSync(pathData, "utf8"));
      }
    } catch (e) {}

    const isBoxNameOn = dataAnti.boxname.some(item => item.threadID === threadID);
    const isBoxImageOn = dataAnti.boximage.some(item => item.threadID === threadID);
    const isNicknameOn = dataAnti.antiNickname.some(item => item.threadID === threadID);
    const isAntiOutOn = dataAnti.antiout && dataAnti.antiout[threadID] === true;

    let isEmojiOn = false;
    let isThemeOn = false;
    let isQtvOn = false;
    try {
      const emojiData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'antiemoji.json'), 'utf8'));
      isEmojiOn = emojiData[threadID] && emojiData[threadID].emojiEnabled;
    } catch (e) {}
    try {
      const themeData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'antitheme.json'), 'utf8'));
      isThemeOn = themeData[threadID] && themeData[threadID].themeEnabled;
    } catch (e) {}
    try {
      const qtvData = JSON.parse(fs.readFileSync(__dirname + '/data/antiqtv.json', 'utf8'));
      isQtvOn = qtvData[threadID] === true;
    } catch (e) {}

    const menuText = 
      `╭─❖ [ لوحة تحكم الحماية ] ❖─╮\n` +
      `│\n` +
      `│ حـماية الاسـم: ${isBoxNameOn ? "[✅]" : "[❌]"}\n` +
      `│ حـماية الصـورة: ${isBoxImageOn ? "[✅]" : "[❌]"}\n` +
      `│ حـماية الألقـاب: ${isNicknameOn ? "[✅]" : "[❌]"}\n` +
      `│ مـنع الخـروج: ${isAntiOutOn ? "[✅]" : "[❌]"}\n` +
      `│ حـماية الإيمـوجي: ${isEmojiOn ? "[✅]" : "[❌]"}\n` +
      `│ حـماية السـمة: ${isThemeOn ? "[✅]" : "[❌]"}\n` +
      `│ حـماية المشرفين: ${isQtvOn ? "[✅]" : "[❌]"}\n` +
      `│ فحص الحالات: [ 9 ]\n` +
      `│\n` +
      `╰───────────────╯\n` +
      `📌 [ قم بالرد على هذه الرسالة برقم الخيار للتفعيل أو الإيقاف ]`;

    return api.sendMessage(menuText, threadID, (error, info) => {
        if (error) {
          return api.sendMessage("❎ حدث خطأ أثناء إرسال قائمة الإعدادات!", threadID);
        } else {
          global.client.handleReply.push({
            name: this.config.name,
            messageID: info.messageID,
            author: senderID,
            permssion
          });
        }
    }, messageID);
  };
