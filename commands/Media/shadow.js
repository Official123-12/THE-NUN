const axios = require('axios');
module.exports = {
    name: 'shadow',
    async execute(m, sock, commands, args, db, ghostContext) {
        if (!args[0]) return m.reply("ᴘʀᴏᴠɪᴅᴇ ᴀɴ ɪɴꜱᴛᴀɢʀᴀᴍ ʟɪɴᴋ.");
        try {
            const res = await axios.get(`https://api.dhammasepun.me/api/igdl?url=${args[0]}`);
            const media = res.data.result[0].url;
            await sock.sendMessage(m.key.remoteJid, { 
                video: { url: media }, 
                caption: `✞  *ꜱʜᴀᴅᴏᴡ ᴅᴏᴡɴʟᴏᴀᴅ*  🕯️\n\n_ɢᴜᴀʀᴅɪᴀɴ: ꜱᴛᴀɴʏᴛᴢ_`,
                contextInfo: ghostContext 
            }, { quoted: m });
        } catch (e) { m.reply("ᴛʜᴇ ꜱʜᴀᴅᴏᴡ ꜰᴀᴅᴇᴅ. ʟɪɴᴋ ɪɴᴠᴀʟɪᴅ."); }
    }
};
