const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { alldown } = require("shaon-videos-downloader");

module.exports.config = {
    name: "تحميل",
    version: "1.0.3",
    hasPermssion: 0,
    credits: "DANTE SPARDA",
    description: "تحميل الفيديوهات من مختلف المنصات عبر الرابط مباشرة",
    commandCategory: "الوسائط",
    usages: "تحميل [الرابط]",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID } = event;
    const content = args[0];

    if (!content || !content.startsWith("https://")) {
        return api.sendMessage("يرجى وضع رابط فيديو صحيح بعد اسم الأمر.", threadID, messageID);
    }

    let reactionEmoji = "⚪"; 
    if (content.includes("tiktok.com")) reactionEmoji = "⚫"; 
    if (content.includes("facebook.com") || content.includes("fb.watch")) reactionEmoji = "🔵";
    if (content.includes("instagram.com")) reactionEmoji = "🟣";
    if (content.includes("youtube.com") || content.includes("youtu.be")) reactionEmoji = "🔴";

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    const pathVideo = path.join(cacheDir, `auto_${messageID}.mp4`);

    try {
        try {
            await api.setMessageReaction(reactionEmoji, messageID, () => {}, true);
        } catch (err) {}

        const data = await alldown(content);
        if (!data || !data.url) {
            try { await api.setMessageReaction("⚠️", messageID, () => {}, true); } catch(e) {}
            return api.sendMessage("تعذر العثور على رابط مباشر لمحتوى الفيديو المعني.", threadID, messageID);
        }

        const videoRes = await axios.get(data.url, { responseType: "arraybuffer" });
        fs.writeFileSync(pathVideo, Buffer.from(videoRes.data));

        const responseMsg = 
            `╭─  ── ── ── ──  ─╮\n` +
            `     نـظـام الـتـحـمـيـل\n` +
            `╰─  ── ── ── ──  ─╯\n` +
            `⎔ الـعـنـوان: ${data.title || "──"}\n` +
            `⎔ الـمـنـصـة: ${data.source || "Unknown"}\n` +
            `⊞ الـحـالـة: مكتمل التجهيز\n` +
            `── ── ── ── ── ── ──`;

        return api.sendMessage({
            body: responseMsg,
            attachment: fs.createReadStream(pathVideo)
        }, threadID, () => {
            try { api.setMessageReaction("✅", messageID, () => {}, true); } catch(e) {}
            setTimeout(() => {
                if (fs.existsSync(pathVideo)) fs.unlinkSync(pathVideo);
            }, 10000);
        }, messageID);

    } catch (error) {
        console.error("خطأ في أمر تحميل: " + error.message);
        try {
            await api.setMessageReaction("⚠️", messageID, () => {}, true);
        } catch (err) {}
        
        if (fs.existsSync(pathVideo)) fs.unlinkSync(pathVideo);
        return api.sendMessage("حدث خطأ أثناء معالجة وتنزيل ملف الفيديو.", threadID, messageID);
    }
};
