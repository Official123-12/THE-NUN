const axios = require('axios');
module.exports = {
    name: 'tithe',
    async execute(m, sock, commands, args, db, ghostContext) {
        if (!args[2]) return m.reply("ᴜꜱᴀɢᴇ: .ᴛɪᴛʜᴇ 100 ᴜꜱᴅ ᴛᴢꜱ");
        try {
            const res = await axios.get(`https://api.exchangerate-api.com/v4/latest/${args[1].toUpperCase()}`);
            const rate = res.data.rates[args[2].toUpperCase()];
            const result = (parseFloat(args[0]) * rate).toFixed(2);
            let resMsg = `╭─── • ✞ • ───╮\n  ᴏ ꜰ ꜰ ᴇ ʀ ɪ ɴ ɢ  \n╰─── • ✞ • ───╯\n\n✟  *ᴄᴏɴᴠᴇʀꜱɪᴏɴ* : ${args[0]} ${args[1]} = ${result} ${args[2]}\n\n_ᴅᴇᴠ: ꜱᴛᴀɴʏᴛᴢ_`;
            await sock.sendMessage(m.key.remoteJid, { text: resMsg, contextInfo: ghostContext });
        } catch (e) { m.reply("ɪɴᴠᴀʟɪᴅ ᴄᴜʀʀᴇɴᴄʏ."); }
    }
};
