const axios = require('axios');
module.exports = {
    name: 'phantom',
    async execute(m, sock, commands, args, db, ghostContext) {
        const query = args.join(" ");
        if (!query) return m.reply("ᴡʜᴀᴛ ᴠɪꜱɪᴏɴ ᴅᴏ ʏᴏᴜ ꜱᴇᴇᴋ?");
        try {
            const res = await axios.get(`https://api.boxi.my.id/api/pinterest?query=${encodeURIComponent(query)}`);
            const img = res.data.result[0];
            await sock.sendMessage(m.key.remoteJid, { 
                image: { url: img }, 
                caption: `✞  *ᴘʜᴀɴᴛᴏᴍ ɪᴍᴀɢᴇ* : ${query}\n\n_ᴅᴇᴠ: ꜱᴛᴀɴʏᴛᴢ_`,
                contextInfo: ghostContext 
            }, { quoted: m });
        } catch (e) { m.reply("ɴᴏ ᴠɪꜱɪᴏɴ ꜰᴏᴜɴᴅ."); }
    }
};
