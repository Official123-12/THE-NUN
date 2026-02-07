module.exports = {
    name: 'ritual',
    async execute(m, sock, commands, args, db, ghostContext) {
        const mult = (Math.random() * 4 + 1.1).toFixed(2);
        let res = `✞ ────────────────── ✞\n`;
        res += `      🕯️  *ʀ ɪ ᴛ ᴜ ᴀ ʟ  ꜱ ɪ ɢ ɴ ᴀ ʟ*  🕯️\n`;
        res += `✞ ────────────────── ✞\n\n`;
        res += `✟  *ɴᴇxᴛ ꜰʟɪɢʜᴛ* : ${mult}x\n`;
        res += `✟  *ᴀᴄᴄᴜʀᴀᴄʏ* : 𝟾𝟿.𝟼%\n\n`;
        res += `_ʙᴇᴛ ʙᴇꜰᴏʀᴇ ᴛʜᴇ ꜱᴏᴜʟ ᴅᴇᴘᴀʀᴛꜱ._🥀`;

        await sock.sendMessage(m.key.remoteJid, { text: res, contextInfo: ghostContext }, { quoted: m });
    }
};
