const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const crypto = require("crypto");

const baseApiUrl = async () => {
  try {
    const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json", { timeout: 5000 });
    return base.data.mahmud;
  } catch (e) {
    return null;
  }
};

const translateText = async (text) => {
  try {
    const res = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`, { timeout: 5000 });
    return res.data[0][0][0];
  } catch (error) {
    return text;
  }
};

module.exports = {
  config: {
    name: 'تعديل',
    aliases: ['عدلي', 'بندلين', 'بنتي', 'edit', 'imgedit'],
    version: '6.0.0',
    hasPermssion: 0,
    credits: 'SINKO & AI',
    description: 'تعديل الصور بالذكاء الاصطناعي عبر 3 سيرفرات متبادلة',
    commandCategory: 'الصور',
    usages: 'الرد على صورة + الوصف المطلوب',
    cooldowns: 5,
    dependencies: {
      "axios": "",
      "fs-extra": "",
      "crypto": ""
    }
  },

  run: async ({ api, event, args }) => {
    const { threadID, messageID, messageReply } = event;
    const promptAr = args.join(" ");

    if (!promptAr) {
      return api.sendMessage("╭─❖ [ نظام التعديل ] ❖─╮\n\n⚠️ يرجى الرد على صورة مع كتابة وصف التعديل المطلوب.\n\n╰───────────────╯", threadID, messageID);
    }

    const repliedImage = messageReply?.attachments?.[0];
    if (!repliedImage || (repliedImage.type !== "photo" && repliedImage.type !== "image")) {
      return api.sendMessage("╭─❖ [ نظام التعديل ] ❖─╮\n\n⚠️ عذراً، يجب الرد على [صورة] لتعديلها.\n\n╰───────────────╯", threadID, messageID);
    }

    const imageUrl = repliedImage.url;

    api.setMessageReaction("⏳", messageID, () => {}, true);

    let waitMsgID;
    await new Promise((resolve) => {
      api.sendMessage("╭─❖ [ معالجة الصور ] ❖─╮\n\n⏳ جاري تهيئة السيرفرات وتعديل الصورة بالذكاء الاصطناعي...\n\n╰───────────────╯", threadID, (err, info) => {
        if (!err) waitMsgID = info.messageID;
        resolve();
      }, messageID);
    });

    const cacheDir = path.join(__dirname, "cache");
    const imgPath = path.join(cacheDir, `edit_${crypto.randomBytes(4).toString('hex')}.jpg`);
    await fs.ensureDir(cacheDir);

    let optimizedPromptAr = promptAr;
    const containsNudityOrMask = /احذفي الملابس|الملابس|نقاب|نغاب|الوجه|وجه/.test(promptAr);
    
    if (containsNudityOrMask) {
      optimizedPromptAr = "امرأة بوجه واضح ومكشوف بالكامل، ملامح جميلة ومفصلة، ترتدي عباءة أنيقة ومحتشمة، جودة عالية جداً، إضاءة ممتازة ومثالية";
    }
    if (/وضحي|توضيح|وضح/.test(promptAr)) {
      optimizedPromptAr += ", unblur, highly detailed, 4k sharp focus, cleared face, hyperrealistic";
    }

    const promptEn = await translateText(optimizedPromptAr);
    const hakimBaseURL = await baseApiUrl();

    const servers = [
      {
        name: "السيرفر الأول (Uncensored SD)",
        url: `https://uncensored-sd.onrender.com/api/sd?prompt=${encodeURIComponent(promptEn + ", masterpiece, photorealistic, cinematic lighting")}&imageUrl=${encodeURIComponent(imageUrl)}&v=${crypto.randomBytes(4).toString('hex')}`,
        method: "GET",
        responseType: "stream"
      },
      {
        name: "السيرفر الثاني (Azad API)",
        url: `https://azadx69x.is-a.dev/api/editor?url=${encodeURIComponent(imageUrl)}&prompt=${encodeURIComponent(promptEn)}`,
        method: "GET",
        responseType: "stream"
      }
    ];

    if (hakimBaseURL) {
      servers.push({
        name: "السيرفر الثالث (Hakim API)",
        url: `${hakimBaseURL}/api/edit`,
        method: "POST",
        data: { prompt: promptEn, imageUrl: imageUrl },
        responseType: "arraybuffer"
      });
    }

    let success = false;

    for (const server of servers) {
      try {
        console.log(`[Aplin] جاري تجربة: ${server.name}`);
        let response;

        if (server.method === "POST") {
          response = await axios.post(server.url, server.data, {
            responseType: server.responseType,
            timeout: 90000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
          });
          await fs.writeFile(imgPath, Buffer.from(response.data));
        } else {
          response = await axios({
            method: 'get',
            url: server.url,
            responseType: server.responseType,
            timeout: 90000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
          });
          
          if (response.data.pipe) {
            const writer = fs.createWriteStream(imgPath);
            response.data.pipe(writer);
            await new Promise((resolve, reject) => {
              writer.on('finish', resolve);
              writer.on('error', reject);
            });
          } else {
            await fs.writeFile(imgPath, Buffer.from(response.data));
          }
        }

        success = true;
        break;
      } catch (err) {
        console.log(`[Aplin] فشل السيرفر ${server.name}:`, err.message);
      }
    }

    if (waitMsgID) {
      try { api.unsendMessage(waitMsgID); } catch(e) {}
    }

    if (!success || !fs.existsSync(imgPath) || fs.statSync(imgPath).size < 1000) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("╭─❖ [ نظام التعديل ] ❖─╮\n\n❌ عذراً، فشلت السيرفرات الثلاثة في معالجة الصورة. يرجى المحاولة لاحقاً.\n\n╰───────────────╯", threadID, messageID);
    }

    api.setMessageReaction("✅", messageID, () => {}, true);
    
    return api.sendMessage({
      body: `╭─❖ [ نجاح التعديل ] ❖─╮\n\n📝 الوصف: ${promptAr}\n\n╰───────────────╯`,
      attachment: fs.createReadStream(imgPath)
    }, threadID, () => {
      setTimeout(() => {
        try { if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath); } catch(e) {}
      }, 10000);
    }, messageID);
  }
};
