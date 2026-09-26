const axios = require('axios');
const fs = require('fs');
const crypto = require('crypto');

module.exports = {
 config: {
 name: 'note',
 version: '1.0.0',
 hasPermssion: 3,
 credits: 'DC-Nam & AI',
 description: 'رفع وتنزيل الأكواد عبر روابط سحابية (خاص بالمطور)',
 commandCategory: 'المطور',
 usages: 'note [اسم الملف] أو الرد برابط',
 prefix: false,
 cooldowns: 3,
 },
 run: async function(o) {
 const name = module.exports.config.name;
 const url = o.event?.messageReply?.args?.[0] || o.args[1];
 let path = `${__dirname}/${o.args[0]}`;
 const send = msg => new Promise(r => o.api.sendMessage(`╭─❖ [ نظام الملاحظات ] ❖─╮\n\n${msg}\n\n╰───────────────╯`, o.event.threadID, (err, res) => r(res), o.event.messageID));

 try {
 if (/^https:\/\//.test(url)) {
 return send(`🔗 مسار الملف:\n${path}\n\n📌 تفاعل مع هذه الرسالة (بأي إيموجي) لتأكيد جلب الكود واستبدال محتوى الملف.`).then(res => {
 res = {
 ...res,
 name,
 path,
 o,
 url,
 action: 'confirm_replace_content',
 };
 global.client.handleReaction.push(res);
 });
 } else {
 if (!o.args[0]) return send(`⚠️ يرجى كتابة اسم الملف المراد رفعه.\n📝 مثال: note admin.js`);
 if (!fs.existsSync(path)) return send(`❎ عذراً، مسار الملف غير موجود على السيرفر.`);
 
 const uuid_raw = crypto.randomUUID();
 const url_raw = new URL(`https://api.dungkon.id.vn/note/${uuid_raw}`);
 const url_redirect = new URL(`https://api.dungkon.id.vn/note/${crypto.randomUUID()}`);
 
 await axios.put(url_raw.href, fs.readFileSync(path, 'utf8'));
 url_redirect.searchParams.append('raw', uuid_raw);
 await axios.put(url_redirect.href);
 url_redirect.searchParams.delete('raw');

 return send(`📝 رابط العرض: ${url_redirect.href}\n\n✏️ رابط التعديل: ${url_raw.href}\n────────────────\n📂 الملف: ${o.args[0]}\n\n📌 تفاعل مع هذه الرسالة (بأي إيموجي) لتأكيد رفع وتحديث الكود.`).then(res => {
 res = {
 ...res,
 name,
 path,
 o,
 url: url_redirect.href,
 action: 'confirm_replace_content',
 };
 global.client.handleReaction.push(res);
 });
 }
 } catch(e) {
 console.error(e);
 send(`❎ حدث خطأ:\n${e.toString()}`);
 }
 },
 handleReaction: async function(o) {
 const _ = o.handleReaction;
 const send = msg => new Promise(r => o.api.sendMessage(`╭─❖ [ نظام الملاحظات ] ❖─╮\n\n${msg}\n\n╰───────────────╯`, o.event.threadID, (err, res) => r(res), o.event.messageID));

 try {
 if (o.event.userID != _.o.event.senderID) return;

 switch (_.action) {
 case 'confirm_replace_content': {
 const content = (await axios.get(_.url, {
 responseType: 'text',
 })).data;

 fs.writeFileSync(_.path, content);
 send(`✅ تم تحديث ورفع الكود بنجاح!\n\n📂 المسار:\n${_.path}`).then(res => {
 res = {
 ..._,
 ...res,
 };
 global.client.handleReaction.push(res);
 });
 };
 break;
 default:
 break;
 }
 } catch(e) {
 console.error(e);
 send(`❎ حدث خطأ أثناء المعالجة:\n${e.toString()}`);
 }
 }
}
