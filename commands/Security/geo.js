const axios = require('axios');
module.exports = {
    name: 'geo',
    async execute(m, sock, commands, args, db, ghostContext) {
        if (!args[0]) return m.reply("ᴘʀᴏᴠɪᴅᴇ ᴀɴ ɪᴘ.");
        try {
            const res = await axios.get(`http://ip-api.com/json/${args[0]}?fields=66846719`);
            const d = res.data;
            let resMsg = `╭─── • ✞ • ───╮\n  ɢ ᴇ ᴏ  ʟ ᴏ ᴄ ᴀ ᴛ ᴇ \n╰─── • ✞ • ───╯\n\n✟  ʟᴀᴛ: ${d.lat}\n✟  ʟᴏɴ: ${d.lon}\n✟  ᴛɪᴍᴇᴢᴏɴᴇ: ${d.timezone}\n✟  ᴄᴜʀʀᴇɴᴄʏ: ${d.currency}\n\n_ᴅᴇᴠ: ꜱᴛᴀɴʏᴛᴢ_`;
            await sock.sendMessage(m.key.remoteJid, { text: resMsg, contextInfo: ghostContext });
        } catch (e) { m.reply("ᴠᴏɪᴅ ᴇʀʀᴏʀ."); }
    }
};
