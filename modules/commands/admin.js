const fs = require('fs');

module.exports.config = {
  name: "ادمن",
  version: "1.1.0",
  hasPermssion: 1,
  credits: "quocduy & AI",
  description: "إدارة مشرفي البوت",
  commandCategory: "المسؤولين",
  usages: "ادمن [list / add / remove] [آي دي المستخدم]",
  cooldowns: 2,
  dependencies: {
    "fs-extra": ""
  }
};

module.exports.run = async function({ api, event, args }) {
  const configPath = './config.json';

  // قراءة ملف الإعدادات
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  // جلب قائمة المسؤولين
  const admins = config.NDH || [];

  // التعامل مع الأوامر الفرعية
  switch (args[0]) {
    case "list": 
    case "قائمة":
      if (admins.length === 0) {
        return api.sendMessage("╭─❖ [قائمة المشرفين] ❖─╮\n\n❌ عذراً، لا يوجد أي مشرفين مضافين حالياً.\n\n╰───────────────╯", event.threadID, event.messageID);
      } else {
        const adminList = admins.map((admin, index) => `  ${index + 1} ⟡ ${admin}`).join('\n');
        return api.sendMessage(`╭─❖ [قائمة مشرفي البوت] ❖─╮\n\n${adminList}\n\n╰───────────────╯`, event.threadID, event.messageID);
      }

    case "add":
    case "اضافة":
      const newAdminID = args[1];
      if (!newAdminID) {
        return api.sendMessage("╭─❖ [تنبيه إداري] ❖─╮\n\n⚠️ يرجى تحديد (آي دي) المستخدم المراد إضافته.\n📝 الاستخدام: ادمن اضافة [رابط/آي دي]\n\n╰───────────────╯", event.threadID, event.messageID);
      }
      if (admins.includes(newAdminID)) {
        return api.sendMessage("╭─❖ [تنبيه إداري] ❖─╮\n\nℹ️ هذا المستخدم مسجل مسبقاً ضمن قائمة المشرفين.\n\n╰───────────────╯", event.threadID, event.messageID);
      }
      admins.push(newAdminID);
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      return api.sendMessage(`╭─❖ [نجاح الإضافة] ❖─╮\n\n✅ تم ترقية المستخدم بنجاح وإضافته إلى المشرفين.\n🆔 الآي دي: ${newAdminID}\n\n╰───────────────╯`, event.threadID, event.messageID);

    case "remove":
    case "حذف":
      const adminToRemoveID = args[1];
      if (!adminToRemoveID) {
        return api.sendMessage("╭─❖ [تنبيه إداري] ❖─╮\n\n⚠️ يرجى تحديد (آي دي) المستخدم المراد إزالته.\n📝 الاستخدام: ادمن حذف [الآي دي]\n\n╰───────────────╯", event.threadID, event.messageID);
      }
      if (!admins.includes(adminToRemoveID)) {
        return api.sendMessage("╭─❖ [تنبيه إداري] ❖─╮\n\nℹ️ هذا المستخدم غير موجود في قائمة المشرفين أساساً.\n\n╰───────────────╯", event.threadID, event.messageID);
      }
      const adminIndex = admins.indexOf(adminToRemoveID);
      admins.splice(adminIndex, 1);
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      return api.sendMessage(`╭─❖ [نجاح الإزالة] ❖─╮\n\n🗑️ تم سحب صلاحيات الإشراف عن المستخدم بنجاح.\n🆔 الآي دي: ${adminToRemoveID}\n\n╰───────────────╯`, event.threadID, event.messageID);

    default:
      return api.sendMessage("╭─❖ [لوحة التحكم بالادمنية] ❖─╮\n\n⚠️ أمر غير معروف! الأوامر المتاحة:\n• ⟡ ادمن قائمة\n• ⟡ ادمن اضافة [آي دي]\n• ⟡ ادمن حذف [آي دي]\n\n╰───────────────╯", event.threadID, event.messageID);
  }
};
