const axios = require('axios');
module.exports = {
    name: 'spotify',
    async execute(m, sock, commands, args, db, ghostContext) {
        if (!args[0]) return m.reply("ꜱᴏɴɢ ɴᴀᴍᴇ?");
        const res = await axios.get(`https://api.popcat.xyz/spotify?q=${encodeURIComponent(args.join(" "))}`);
        let txt = `╭─── • ✞ • ───╮\n  ꜱ ᴘ ᴏ ᴛ ɪ ꜰ ʏ  \n╰─── • ✞ • ───╯\n\n✟  ᴛɪᴛʟᴇ: ${res.data.title}\n✟  ᴀʀᴛɪꜱᴛ: ${res.data.artists}\n✟  ᴀʟʙᴜᴍ: ${res.data.album}\n\n_ᴅᴇᴠ: ꜱᴛᴀɴʏᴛᴢ_`;
        await sock.sendMessage(m.key.remoteJid, { image: { url: res.data.image }, caption: txt, contextInfo: ghostContext });
    }
};
