const axios = require('axios');
module.exports = {
    name: 'define',
    async execute(m, sock, commands, args, db, ghostContext) {
        if (!args[0]) return m.reply("ᴡʜɪᴄʜ ᴡᴏʀᴅ, ꜱᴏᴜʟ?");
        try {
            const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${args[0]}`);
            const def = res.data[0].meanings[0].definitions[0].definition;
            await sock.sendMessage(m.key.remoteJid, { text: `✞  *ᴅᴇꜰɪɴɪᴛɪᴏɴ*  🕯️\n\n✟  ᴡᴏʀᴅ: ${args[0]}\n✟  ᴍᴇᴀɴɪɴɢ: ${def}`, contextInfo: ghostContext });
        } catch (e) { m.reply("ᴡᴏʀᴅ ɴᴏᴛ ꜰᴏᴜɴᴅ."); }
    }
};
