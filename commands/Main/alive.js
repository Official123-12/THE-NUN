module.exports = {
    name: 'alive',
    async execute(m, sock, commands, args, db, ghostContext) {
        let msg = `✞ ────────────────── ✞\n`;
        msg += `      🕯️  *ꜱ ᴏ ᴜ ʟ  ᴘ ʀ ᴇ ꜱ ᴇ ɴ ᴄ ᴇ*  🕯️\n`;
        msg += `✞ ────────────────── ✞\n\n`;
        msg += `✟  *ɢᴜᴀʀᴅɪᴀɴ* : ᴛʜᴇ ɴᴜɴ\n`;
        msg += `✟  *ᴇɴɢɪɴᴇ* : ᴘʜᴀɴᴛᴏᴍ ᴠ𝟷\n`;
        msg += `✟  *ᴅᴇᴠ* : ꜱᴛᴀɴʏᴛᴢ\n\n`;
        msg += `_ᴛʜᴇ ꜱᴀɴᴄᴛᴜᴀʀʏ ɪꜱ ᴀʀᴍᴇᴅ._ 🥀`;

        await sock.sendMessage(m.key.remoteJid, { 
            image: { url: 'https://files.catbox.moe/59ays3.jpg' }, 
            caption: msg, 
            contextInfo: ghostContext 
        }, { quoted: m });
    }
};
