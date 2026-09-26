const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const baseApiUrl = async () => {
    try {
        const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
    } catch (e) {
        return "https://fi1.lord-kaiz.workers.dev";
    }
};

module.exports.config = {
    name: "تعديل",
    version: "1.7.0",
    hasPermssion: 0,
    credits: "MahMUD & AI",
    description: "تعديل الصور باستخدام الذكاء الاصطناعي عبر الرد على الصورة بكتابة الوصف",
    commandCategory: "الصور",
    usages: "الرد على صورة مع كتابة الوصف",
    cooldowns: 5,
    dependencies: {
        "axios": "",
        "fs-extra": ""
    }
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, messageReply } = event;
    const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
    
    if (module.exports.config.credits !== authorName && !module.exports.config.credits.includes("MahMUD")) {
        return api.sendMessage("You are not authorized to change the author name.", threadID, messageID);
    }

    const prompt = args.join(" ");
    const repliedImage = messageReply?.attachments?.[0];

    if (!prompt || !repliedImage || repliedImage.type !== "photo") {
        api.setMessageReaction("⚠️", messageID, () => {}, true);
        return api.sendMessage(
            "╭─❖ [ تنبيه الاستخدام ] ❖─╮\n\n⚠️ يرجى الرد على صورة مع كتابة وصف التعديل المطلوب.\n📝 مثال: غير لون الشعر إلى أحمر\n\n╰───────────────╯",
            threadID,
            messageID
        );
    }

    const cacheDir = path.join(__dirname, "cache");
    const imgPath = path.join(cacheDir, `${Date.now()}_edit.jpg`);
    await fs.ensureDir(cacheDir);

    api.setMessageReaction("⏳", messageID, () => {}, true);
    
    let waitMsgID;
    await new Promise((resolve) => {
        api.sendMessage("╭─❖ [ معالجة الصور ] ❖─╮\n\n⏳ جاري تعديل صورتك بالذكاء الاصطناعي، يرجى الانتظار...\n\n╰───────────────╯", threadID, (err, info) => {
            if (!err) waitMsgID = info.messageID;
            resolve();
        }, messageID);
    });

    try {
        const res = await axios.post(
            `${await baseApiUrl()}/api/edit`,
            { prompt, imageUrl: repliedImage.url },
            { responseType: "arraybuffer" }
        );

        await fs.writeFile(imgPath, Buffer.from(res.data, "binary"));

        api.setMessageReaction("✅", messageID, () => {}, true);
        
        await api.sendMessage({
            body: `╭─❖ [ تم التعديل بنجاح ] ❖─╮\n\n📝 الوصف: ${prompt}\n\n╰───────────────╯`,
            attachment: fs.createReadStream(imgPath)
        }, threadID, messageID);

    } catch (err) {
        console.error("Edit Command Error:", err);
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage(`╭─❖ [ خطأ في المعالجة ] ❖─╮\n\n❌ حدث خطأ أثناء تعديل الصورة:\n${err.message}\n\n╰───────────────╯`, threadID, messageID);
    } finally {
        if (waitMsgID) {
            try { api.unsendMessage(waitMsgID); } catch(e) {}
        }
        setTimeout(() => {
            try { if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath); } catch(e) {}
        }, 10000);
    }
};
