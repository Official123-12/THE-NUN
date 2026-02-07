module.exports = {
    name: 'purge',
    async execute(m, sock, commands, args, db, ghostContext) {
        if (!m.key.remoteJid.endsWith('@g.us')) return;
        const target = m.message.extendedTextMessage?.contextInfo?.mentionedJid[0];
        if (!target) return m.reply("ᴛᴀɢ ᴛʜᴇ ᴅᴇᴍᴏɴ ᴛᴏ ᴘᴜʀɢᴇ.");

        await sock.groupParticipantsUpdate(m.key.remoteJid, [target], "remove");
        let msg = `✞ *ᴇxᴏʀᴄɪꜱᴍ ᴄᴏᴍᴘʟᴇᴛᴇ* 🕯️\n\nᴛʜᴇ ᴅᴇᴍᴏɴ @${target.split('@')[0]} ʜᴀꜱ ʙᴇᴇɴ ʙᴀɴɪꜱʜᴇᴅ ꜰʀᴏᴍ ᴛʜᴇ ꜱᴀɴᴄᴛᴜᴀʀʏ.`;
        await sock.sendMessage(m.key.remoteJid, { text: msg, mentions: [target], contextInfo: ghostContext });
    }
};
