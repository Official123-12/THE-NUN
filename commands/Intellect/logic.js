const axios = require('axios');
module.exports = {
    name: 'logic',
    async execute(m, sock, commands, args, db, ghostContext) {
        if (!args[0]) return m.reply("ᴘʀᴏᴠɪᴅᴇ ᴀ ᴄᴀʟᴄᴜʟᴀᴛɪᴏɴ.");
        try {
            const res = await axios.get(`https://api.mathjs.org/v4/?expr=${encodeURIComponent(args.join(""))}`);
            let resMsg = `╭─── • ✞ • ───╮\n  ʟ ᴏ ɢ ɪ ᴄ  ᴀ ɪ  \n╰─── • ✞ • ───╯\n\n✟  *ɪɴᴘᴜᴛ* : ${args.join("")}\n✟  *ʀᴇꜱᴜʟᴛ* : ${res.data}\n\n_ᴅᴇᴠ: ꜱᴛᴀɴʏᴛᴢ_`;
            await sock.sendMessage(m.key.remoteJid, { text: resMsg, contextInfo: ghostContext });
        } catch (e) { m.reply("ɪɴᴠᴀʟɪᴅ ᴇxᴘʀᴇꜱꜱɪᴏɴ."); }
    }
};
