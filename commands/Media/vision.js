const axios = require('axios');
module.exports = {
    name: 'vision',
    async execute(m, sock, commands, args, db, ghostContext) {
        if (!args[0]) return m.reply("ᴘʀᴏᴠɪᴅᴇ ᴛʜᴇ ʟɪɴᴋ ᴏꜰ ʏᴏᴜʀ ᴠɪꜱɪᴏɴ (ᴛɪᴋᴛᴏᴋ).");
        try {
            const res = await axios.get(`https://api.tiklydown.eu.org/api/download?url=${args[0]}`);
            const vid = res.data.video.noWatermark;
            await sock.sendMessage(m.key.remoteJid, { 
                video: { url: vid }, 
                caption: `✞  *ꜱʜᴀᴅᴏᴡ ᴠɪꜱɪᴏɴ*  🕯️\n\n_ɢᴜᴀʀᴅɪᴀɴ: ꜱᴛᴀɴʏᴛᴢ_`,
                contextInfo: ghostContext 
            }, { quoted: m });
        } catch (e) { m.reply("ᴠɪꜱɪᴏɴ ʙʟᴜʀʀᴇᴅ. ʟɪɴᴋ ɪɴᴠᴀʟɪᴅ."); }
    }
};
