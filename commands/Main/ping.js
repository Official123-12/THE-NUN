module.exports = {
    name: 'ping',
    async execute(m, sock, commands, args, db, ghostContext) {
        const start = Date.now();
        const end = Date.now();
        let body = `✞ ────────────────── ✞\n`;
        body += `      🕯️  *ʀ ɪ ᴛ ᴜ ᴀ ʟ  ꜱ ᴘ ᴇ ᴇ ᴅ*  🕯️\n`;
        body += `✞ ────────────────── ✞\n\n`;
        body += `✟  *ʟᴀᴛᴇɴᴄʏ* : ${end - start}ᴍꜱ\n`;
        body += `✟  *ꜱᴛᴀᴛᴜꜱ* : ᴇᴛᴇʀɴᴀʟ ᴠɪɢɪʟ\n`;
        body += `✟  *ᴅᴇᴠ* : ꜱᴛᴀɴʏᴛᴢ\n\n`;
        body += `_ɪɴ ꜱʜᴀᴅᴏᴡꜱ ᴡᴇ ᴛʀᴜꜱᴛ._`;

        await sock.sendMessage(m.key.remoteJid, { text: body, contextInfo: ghostContext }, { quoted: m });
    }
};
