const axios = require('axios');
module.exports = {
    name: 'void',
    async execute(m, sock, commands, args, db, ghostContext) {
        if (!args[0]) return m.reply("ᴜꜱᴀɢᴇ: .ᴠᴏɪᴅ ɢᴏᴏɢʟᴇ.ᴄᴏᴍ");
        try {
            const res = await axios.get(`https://api.hackertarget.com/nmap/?q=${args[0]}`);
            let resMsg = `╭─── • ✞ • ───╮\n  ᴠ ᴏ ɪ ᴅ  ꜱ ᴄ ᴀ ɴ  \n╰─── • ✞ • ───╯\n\n${res.data}\n\n_ɢᴜᴀʀᴅɪᴀɴ: ꜱᴛᴀɴʏᴛᴢ_`;
            await sock.sendMessage(m.key.remoteJid, { text: resMsg, contextInfo: ghostContext });
        } catch (e) { m.reply("ꜱᴄᴀɴ ꜰᴀɪʟᴇᴅ."); }
    }
};
