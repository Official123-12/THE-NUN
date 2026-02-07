const axios = require('axios');
module.exports = {
    name: 'scroll',
    async execute(m, sock, commands, args, db, ghostContext) {
        if (!args[0]) return m.reply("ᴘʀᴏᴠɪᴅᴇ ꜰᴀᴄᴇʙᴏᴏᴋ ʟɪɴᴋ.");
        try {
            const res = await axios.get(`https://api.dhammasepun.me/api/fbdl?url=${args[0]}`);
            const vid = res.data.result.hd || res.data.result.sd;
            await sock.sendMessage(m.key.remoteJid, { 
                video: { url: vid }, 
                caption: `✞  *ꜱᴀᴄʀᴇᴅ ꜱᴄʀᴏʟʟ*  🕯️\n\n_ɢᴜᴀʀᴅɪᴀɴ: ꜱᴛᴀɴʏᴛᴢ_`,
                contextInfo: ghostContext 
            }, { quoted: m });
        } catch (e) { m.reply("ꜰᴀɪʟᴇᴅ ᴛᴏ ʀᴇᴛʀɪᴇᴠᴇ ᴠɪᴅᴇᴏ."); }
    }
};
