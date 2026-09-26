module.exports.config = {
    name: "قول",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "AI",
    description: "جعل البوت يعيد كتابة ونطق النص المرسل",
    commandCategory: "الخدمات",
    usages: "قول [النص]",
    cooldowns: 3,
    prefix: true
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID, messageReply } = event;
    
    let textToSay = messageReply ? messageReply.body : args.join(" ");

    if (!textToSay) {
        return api.sendMessage("يرجى كتابة النص المراد ترديده، أو الرد على رسالة.", threadID, messageID);
    }

    try {
        await api.unsendMessage(messageID);
    } catch (e) {}

    return api.sendMessage(textToSay, threadID);
};
