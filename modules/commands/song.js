const axios = require("axios");
const fs = require('fs-extra');
const path = require('path');

const baseApiUrl = async () => {
    try {
        const base = await axios.get(`https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json`);
        return base.data.mahmud;
    } catch (e) {
        return "https://fi1.lord-kaiz.workers.dev";
    }
};

module.exports.config = {
    name: "اغنية",
    version: "2.8.0",
    hasPermssion: 0,
    credits: "MahMUD & AI",
    description: "البحث وتحميل الأغاني والمقاطع الصوتية من يوتيوب",
    commandCategory: "الخدمات",
    usages: "اغنية [اسم الأغنية أو الرابط]",
    cooldowns: 5,
    dependencies: {
        "axios": "",
        "fs-extra": ""
    }
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    const input = args.join(" ");

    if (!input) {
        return api.sendMessage(
            "╭─❖ [ نظام الأغاني ] ❖─╮\n\n⚠️ يرجى كتابة اسم الأغنية أو إرسال رابط يوتيوب.\n📝 مثال: اغنية stay\n\n╰───────────────╯",
            threadID,
            messageID
        );
    }

    const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;

    if (checkurl.test(input)) {
        const videoID = input.match(checkurl)[1];
        api.setMessageReaction("⌛", messageID, () => {}, true);
        return handleDownload(api, threadID, messageID, videoID);
    }

    try {
        api.setMessageReaction("⏳", messageID, () => {}, true);
        const res = await axios.get(`${await baseApiUrl()}/api/ytb/search?q=${encodeURIComponent(input)}`);
        const results = res.data.results.slice(0, 5);
        
        if (!results || results.length === 0) {
            return api.sendMessage("╭─❖ [ نظام الأغاني ] ❖─╮\n\n⭕ عذراً، لم يتم العثور على أي نتائج مطابقة لبحثك.\n\n╰───────────────╯", threadID, messageID);
        }

        let songListText = "";
        const attachments = [];
        const cacheDir = path.join(__dirname, 'cache');
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

        for (let i = 0; i < results.length; i++) {
            songListText += `│ ${i + 1}. 🎵 ${results[i].title}\n│ ⏱️ المدة: ${results[i].time}\n├───────────────\n`;
            try {
                const thumbPath = path.join(cacheDir, `thumb_${senderID}_${Date.now()}_${i}.jpg`);
                const thumbRes = await axios.get(results[i].thumbnail, { responseType: 'arraybuffer' });
                fs.writeFileSync(thumbPath, Buffer.from(thumbRes.data));
                attachments.push(fs.createReadStream(thumbPath));
            } catch (err) {}
        }

        const menuMsg = 
            `╭─❖ [ نتائج البحث عن الأغاني ] ❖─╮\n\n` +
            songListText +
            `\n📌 [ الرد على هذه الرسالة برقم الأغنية للتحميل ]\n` +
            `╰───────────────╯`;

        const sendOptions = { body: menuMsg };
        if (attachments.length > 0) {
            sendOptions.attachment = attachments;
        }

        return api.sendMessage(sendOptions, threadID, (err, info) => {
            if (attachments.length > 0) {
                attachments.forEach(stream => { 
                    try { if (fs.existsSync(stream.path)) fs.unlinkSync(stream.path); } catch(e){} 
                });
            }
            if (!err) {
                global.client.handleReply.push({
                    name: module.exports.config.name,
                    messageID: info.messageID,
                    author: senderID,
                    results
                });
            }
        }, messageID);

    } catch (e) {
        return api.sendMessage(`╭─❖ [ نظام الأغاني ] ❖─╮\n\n❌ حدث خطأ في الاتصال بالخادم:\n${e.message}\n\n╰───────────────╯`, threadID, messageID);
    }
};

module.exports.handleReply = async function ({ event, api, handleReply }) {
    const { results, author, messageID } = handleReply;
    const { senderID, threadID, body } = event;

    if (senderID !== author) return;
    
    const choice = parseInt(body);
    if (isNaN(choice) || choice <= 0 || choice > results.length) {
        return api.sendMessage("❎ يرجى الرد برقم صحيح من قائمة الأغاني المعروضة.", threadID, event.messageID);
    }
    
    const videoID = results[choice - 1].id;
    
    try {
        api.unsendMessage(messageID);
    } catch(e) {}
    
    api.setMessageReaction("⌛", event.messageID, () => {}, true);
   
    await handleDownload(api, threadID, event.messageID, videoID);
};

async function handleDownload(api, threadID, messageID, videoID) {
    try {
        const res = await axios.get(`${await baseApiUrl()}/api/ytb/get?id=${videoID}&type=audio`);
        const { title, downloadLink } = res.data.data;
        
        const response = await axios({ url: downloadLink, method: 'GET', responseType: 'stream' });
        const stream = response.data;
        stream.path = `music_${Date.now()}.mp3`;

        return api.sendMessage({
            body: `╭─❖ [ نجاح التحميل ] ❖─╮\n\n🎵 الأغنية: ${title}\n\n╰───────────────╯`,
            attachment: stream
        }, threadID, () => {
            api.setMessageReaction("✅", messageID, () => {}, true);
        }, messageID);
    } catch (e) {
        return api.sendMessage("╭─❖ [ نظام الأغاني ] ❖─╮\n\n❌ عذراً، فشل تحميل الملف الصوتي!\n\n╰───────────────╯", threadID, messageID);
    }
}
