const axios = require('axios');
module.exports = {
    name: 'omni',
    async execute(m, sock, commands, args, db, ghostContext) {
        if (!args[0]) return m.reply("ᴘʀᴏᴠɪᴅᴇ ᴀ ᴅᴏᴍᴀɪɴ.");
        try {
            const res = await axios.get(`https://api.hackertarget.com/whois/?q=${args[0]}`);
            let resMsg = `╭─── • ✞ • ───╮\n  ᴏ ᴍ ɴ ɪ  ᴅ ᴀ ᴛ ᴀ  \n╰─── • ✞ • ───╯\n\n${res.data}\n\n_ᴅᴇᴠ: ꜱᴛᴀɴʏᴛᴢ_`;
            await sock.sendMessage(m.key.remoteJid, { text: resMsg, contextInfo: ghostContext });
        } catch (e) { m.reply("ᴡʜᴏɪꜱ ꜰᴀɪʟᴇᴅ."); }
    }
};
