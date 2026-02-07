const axios = require('axios');
module.exports = {
    name: 'babel',
    async execute(m, sock, commands, args, db, ghostContext) {
        if (!args[1]) return m.reply("ᴜꜱᴀɢᴇ: .ʙᴀʙᴇʟ [ʟᴀɴɢ] [ᴛᴇxᴛ]\nᴇx: .ʙᴀʙᴇʟ ꜱᴡ ʜᴇʟʟᴏ");
        const lang = args[0];
        const text = args.slice(1).join(" ");
        try {
            const res = await axios.get(`https://api.popcat.xyz/translate?to=${lang}&text=${encodeURIComponent(text)}`);
            let resMsg = `╭─── • ✞ • ───╮\n  ʙ ᴀ ʙ ᴇ ʟ  ᴀ ɪ  \n╰─── • ✞ • ───╯\n\n✟  *ᴛʀᴀɴꜱʟᴀᴛɪᴏɴ* : ${res.data.translated}\n\n_ᴅᴇᴠ: ꜱᴛᴀɴʏᴛᴢ_`;
            await sock.sendMessage(m.key.remoteJid, { text: resMsg, contextInfo: ghostContext });
        } catch (e) { m.reply("ᴛʀᴀɴꜱʟᴀᴛɪᴏɴ ꜰᴀɪʟᴇᴅ."); }
    }
};
