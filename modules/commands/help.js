const axios = require('axios');

module.exports.config = {
    name: "help",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "AI",
    description: "عرض قائمة الأوامر وتفاصيل استخدامها",
    commandCategory: "الخدمات",
    usages: "[اسم الأمر / all]",
    cooldowns: 5,
    images: [],
};

module.exports.run = async function({ api, event, args }) {
    const { threadID: tid, messageID: mid, senderID: sid } = event;
    var type = !args[0] ? "" : args[0].toLowerCase();
    var msg = "", array = [], i = 0;
    const cmds = global.client.commands;
    const TIDdata = global.data.threadData.get(tid) || {};
    const admin = global.config.ADMINBOT || [];
    const NameBot = global.config.BOTNAME || "Mirai";
    var prefix = TIDdata.PREFIX || global.config.PREFIX || "/";

    if (type == "all") {
        for (const cmd of cmds.values()) {
            msg += `│ 📌 ${cmd.config.name}\n│ 📝 الوصف: ${cmd.config.description || "بدون وصف"}\n├───────────────\n`;
        }
        const allMsg = 
            `╭─❖ [ جميع أوامر البوت ] ❖─╮\n\n` +
            msg +
            `\n╰───────────────╯`;
        return api.sendMessage(allMsg, tid, mid);
    }

    if (type) {
        for (const cmd of cmds.values()) {
            array.push(cmd.config.name.toString());
        }
        if (!array.find(n => n == args[0].toLowerCase())) {
            const stringSimilarity = require('string-similarity');
            const commandName = args.shift().toLowerCase() || "";
            var allCommandName = [];
            const commandValues = Object.keys(cmds);
            for (const cmd of commandValues) allCommandName.push(cmd);
            const checker = stringSimilarity.findBestMatch(commandName, allCommandName);
            
            msg = checker.bestMatch.rating >= 0.5
                ? `عذراً، لم أجد الأمر '${type}'. هل تقصد '${checker.bestMatch.target}'؟`
                : `عذراً، لم أجد الأمر '${type}' في النظام.`;
            return api.sendMessage(msg, tid, mid);
        }
        
        const cmd = cmds.get(type).config;
        const img = cmd.images || [];
        let image = [];
        for (let i = 0; i < img.length; i++) {
            const a = img[i];
            const stream = (await axios.get(a, { responseType: "stream" })).data;
            image.push(stream);
        }
        
        const detailMsg = 
            `╭─❖ [ دليل استخدام الأمر ] ❖─╮\n\n` +
            `📌 اسم الأمر: ${cmd.name}\n` +
            `👤 المطور: ${cmd.credits || "غير معروف"}\n` +
            `🌾 الإصدار: ${cmd.version || "1.0.0"}\n` +
            `🌴 الصلاحية: ${TextPr(cmd.hasPermssion)}\n` +
            `📝 الوصف: ${cmd.description || "بدون وصف"}\n` +
            `🏷️ القسم: ${cmd.commandCategory || "عام"}\n` +
            `🍁 طريقة الاستخدام: ${prefix}${cmd.usages || cmd.name}\n` +
            `⏳ وقت الانتظار: ${cmd.cooldowns || 5} ثانية\n\n` +
            `╰───────────────╯`;
            
        return api.sendMessage({ body: detailMsg, attachment: image }, tid, mid);
    } else {
        CmdCategory();
        array.sort(S("nameModule"));
        for (const cmd of array) {
            msg += `│ 📂 ${cmd.cmdCategory.toUpperCase()}\n` +
                   `│ 📊 عدد الأوامر: ${cmd.nameModule.length}\n` +
                   `│ ⚙️ الأوامر: ${cmd.nameModule.join(", ")}\n` +
                   `├───────────────\n`;
        }
        
        const mainHelpMsg = 
            `╭─❖ [ قائمة أوامر البوت ] ❖─╮\n\n` +
            msg +
            `📌 إحصائيات عامة:\n` +
            `📦 إجمالي الأوامر: ${cmds.size}\n` +
            `🤖 اسم البوت: ${NameBot}\n` +
            `⚡ البادئة المستخدمة: ${prefix}\n\n` +
            `💡 اكتب ${prefix}help [اسم الأمر] لتفاصيل أكثر.\n` +
            `💡 اكتب ${prefix}help all لعرض كل الأوامر.\n` +
            `╰───────────────╯`;
            
        return api.sendMessage(mainHelpMsg, tid, mid);
    }

    function CmdCategory() {
        for (const cmd of cmds.values()) {
            const { commandCategory = "أخرى", hasPermssion = 0, name: nameModule } = cmd.config;
            if (!array.find(i => i.cmdCategory == commandCategory)) {
                array.push({
                    cmdCategory: commandCategory,
                    permission: hasPermssion,
                    nameModule: [nameModule]
                });
            } else {
                const find = array.find(i => i.cmdCategory == commandCategory);
                find.nameModule.push(nameModule);
            }
        }
    }
};

function S(k) {
    return function(a, b) {
        let i = 0;
        if (a[k].length > b[k].length) {
            i = 1;
        } else if (a[k].length < b[k].length) {
            i = -1;
        }
        return i * -1;
    };
}

function TextPr(permission) {
    const p = permission;
    return p == 0 ? "الكل (عضو)" : p == 1 ? "مشرف المجموعة" : p == 2 ? "مطور البوت" : "صلاحية خاصة";
}
