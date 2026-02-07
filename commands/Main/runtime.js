
module.exports = {
    name: 'runtime',
    async execute(m, sock, commands, args, db, ghostContext) {
        const up = process.uptime();
        const h = Math.floor(up / 3600);
        const m1 = Math.floor((up % 3600) / 60);
        let res = `✞ ────────────────── ✞\n`;
        res += `      🕯️  *ᴠ ɪ ɢ ɪ ʟ  ᴛ ɪ ᴍ ᴇ*  🕯️\n`;
        res += `✞ ────────────────── ✞\n\n`;
        res += `✟  *ᴜᴘᴛɪᴍᴇ* : ${h}ʜ ${m1}ᴍ\n`;
        res += `✟  *ɢᴜᴀʀᴅɪᴀɴ* : ᴛʜᴇ ɴᴜɴ\n\n`;
        res += `_ᴛʜᴇ ꜱᴀɴᴄᴛᴜᴀʀʏ ɪꜱ ᴀᴡᴀᴋᴇ._`;
        await sock.sendMessage(m.key.remoteJid, { text: res, contextInfo: ghostContext });
    }
};
