const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const BASE_URL = 'http://dongdev.click/api/down/media';

module.exports.config = {
  name: "تحميل",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "DongDev & AI",
  description: "التحميل التلقائي واليدوي من منصات السوشيال ميديا",
  commandCategory: "الخدمات",
  usages: "تحميل [on/off] أو إرسال الرابط مباشرة",
  cooldowns: 3,
  dependencies: {
    "axios": "",
    "fs-extra": ""
  }
};

const dataPath = path.join(__dirname, 'data', 'autodown_status.json');

function getStatusData() {
  try {
    if (!fs.existsSync(dataPath)) {
      fs.ensureFileSync(dataPath);
      fs.writeFileSync(dataPath, JSON.stringify({}, null, 2));
    }
    return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch (e) {
    return {};
  }
}

function saveStatusData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
}

function getPlatformInfo(platform) {
  switch (platform) {
    case 'FACEBOOK': return { icon: '📘', name: 'فيسبوك', frame: '🔵' };
    case 'TIKTOK': return { icon: '🎵', name: 'تيك توك', frame: '⚫' };
    case 'YOUTUBE': return { icon: '▶️', name: 'يوتيوب', frame: '🔴' };
    case 'INSTAGRAM': return { icon: '📸', name: 'إنستغرام', frame: '🟣' };
    case 'THREADS': return { icon: '🧵', name: 'ثريدز', frame: '⚪' };
    case 'CAPCUT': return { icon: '🎬', name: 'كاب كات', frame: '🔵' };
    default: return { icon: '🌐', name: 'منصة خارجية', frame: '🟢' };
  }
}

module.exports.handleEvent = async ({ api, event, args }) => {
  const { threadID, senderID, body, messageID } = event;
  if (senderID == api.getCurrentUserID() || !body) return;

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = body.match(urlRegex);
  if (!matches) return;

  const statusData = getStatusData();
  const isAutoEnabled = statusData[threadID] === true;
  
  if (!isAutoEnabled && !body.startsWith("تحميل")) return;

  let stream = (url, ext = 'jpg') => axios.get(url, { responseType: 'stream' }).then(res => (res.data.path = `tmp.${ext}`, res.data)).catch(e => null);
  
  for (const url of matches) {
    if (/(^https:\/\/)(\w+\.|m\.)?(facebook|fb)\.(com|watch)\//.test(url)) {
      try {
        const res = (await axios.get(`${BASE_URL}?url=${encodeURIComponent(url)}`)).data;
        if (res.attachments && res.attachments.length > 0) {
          let attachment = [];
          if (res.queryStorieID) {
            const match = res.attachments.find(item => item.id == res.queryStorieID);
            if (match && match.type === 'Video') attachment.push(await stream(match.url.hd || match.url.sd, 'mp4'));
            else if (match && match.type === 'Photo') attachment.push(await stream(match.url, 'jpg'));
          } else {
            for (const item of res.attachments) {
              if (item.type === 'Video') attachment.push(await stream(item.url.hd || item.url.sd, 'mp4'));
              else if (item.type === 'Photo') attachment.push(await stream(item.url, 'jpg'));
            }
          }
          const pInfo = getPlatformInfo('FACEBOOK');
          const msgBody = 
            `╭─❖ [ ${pInfo.icon} التحميل التلقائي - ${pInfo.name} ] ❖─╮\n\n` +
            `📝 العنوان: ${res.message || "بدون عنوان"}\n` +
            `${res.like ? `👍 التفاعلات: ${res.like}\n` : ''}` +
            `${res.comment ? `💬 التعليقات: ${res.comment}\n` : ''}` +
            `${res.share ? `↗️ المشاركات: ${res.share}\n` : ''}` +
            `👤 الناشر: ${res.author || "غير معروف"}\n\n` +
            `╰────────────────────────╯`;
          return api.sendMessage({ body: msgBody, attachment }, threadID, messageID);
        }
      } catch (e) {}
    } else if (/^(https:\/\/)(www\.|vt\.|vm\.|m\.|web\.|v\.|mobile\.)?(tiktok\.com|t\.co|twitter\.com|youtube\.com|instagram\.com|bilibili\.com|douyin\.com|capcut\.com|threads\.net)\//.test(url)) {
      const platform = /tiktok\.com/.test(url) ? 'TIKTOK' : /youtube\.com/.test(url) ? 'YOUTUBE' : /instagram\.com/.test(url) ? 'INSTAGRAM' : /threads\.net/.test(url) ? 'THREADS' : /capcut\.com/.test(url) ? 'CAPCUT' : 'OTHER';
      try {
        const res = (await axios.get(`${BASE_URL}?url=${encodeURIComponent(url)}`)).data;
        let attachments = [];        
        if (res.attachments && res.attachments.length > 0) {
          for (const at of res.attachments) {
            if (at.type === 'Video') attachments.push(await stream(at.url, 'mp4'));
            else if (at.type === 'Photo') attachments.push(await stream(at.url, 'jpg'));
            else if (at.type === 'Audio') attachments.push(await stream(at.url, 'mp3'));
          }
          const pInfo = getPlatformInfo(platform);
          const msgBody = 
            `╭─❖ [ ${pInfo.icon} التحميل التلقائي - ${pInfo.name} ] ❖─╮\n\n` +
            `📝 الوصف: ${res.message || "بدون عنوان"}\n\n` +
            `╰────────────────────────╯`;
          return api.sendMessage({ body: msgBody, attachment: attachments }, threadID, messageID);
        }
      } catch (e) {}
    }
  }
};

module.exports.run = async function ({ api, event, args, permssion }) {
  const { threadID, messageID, senderID } = event;
  const action = args[0] ? args[0].toLowerCase() : "";

  if (action === "on" || action === "off") {
    const threadInfo = await api.getThreadInfo(threadID);
    const isAdmin = threadInfo.adminIDs.some(item => item.id == senderID);
    
    if (permssion < 1 && !isAdmin) {
      return api.sendMessage("╭─❖ [ تنبيه إداري ] ❖─╮\n\n⚠️ عذراً، هذا الأمر مخصص لمشرفي المجموعة فقط.\n\n╰───────────────╯", threadID, messageID);
    }

    const statusData = getStatusData();
    if (action === "on") {
      statusData[threadID] = true;
      saveStatusData(statusData);
      return api.sendMessage("╭─❖ [ نظام التحميل ] ❖─╮\n\n✅ تم [تفعيل] التحميل التلقائي بنجاح في هذه المجموعة.\n📥 سيقوم البوت بتحميل أي رابط يتم إرساله تلقائياً.\n\n╰───────────────╯", threadID, messageID);
    } else {
      statusData[threadID] = false;
      saveStatusData(statusData);
      return api.sendMessage("╭─❖ [ نظام التحميل ] ❖─╮\n\n❌ تم [إيقاف] التحميل التلقائي في هذه المجموعة.\n\n╰───────────────╯", threadID, messageID);
    }
  }

  const targetUrl = args.find(arg => arg.startsWith("http"));
  if (targetUrl) {
    event.body = targetUrl;
    return module.exports.handleEvent({ api, event, args: [targetUrl] });
  }

  const statusData = getStatusData();
  const currentStatus = statusData[threadID] === true ? "[✅ مفعّل]" : "[❌ معطّل]";
  
  const helpMsg = 
    `╭─❖ [ لوحة تحكم التحميل ] ❖─╮\n` +
    `│\n` +
    `│ حالة المجموعة: ${currentStatus}\n` +
    `│\n` +
    `│ 📌 الأوامر المتاحة:\n` +
    `│ • ⟡ تحميل on (لتفعيل التحميل التلقائي)\n` +
    `│ • ⟡ تحميل off (لإيقاف التحميل التلقائي)\n` +
    `│ • ⟡ تحميل [الرابط] (للتحميل اليدوي الفوري)\n` +
    `│\n` +
    `╰───────────────╯`;

  return api.sendMessage(helpMsg, threadID, messageID);
};
