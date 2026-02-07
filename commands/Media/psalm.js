
const axios = require('axios');
module.exports = {
    name: 'psalm',
    async execute(m, sock, commands, args, db, ghostContext) {
        const query = args.join(" ");
        if (!query) return m.reply("Name of the psalm (song)?");
        try {
            const search = await axios.get(`https://api.popcat.xyz/ytsearch?q=${encodeURIComponent(query)}`);
            const dl = await axios.get(`https://api.dhammasepun.me/api/ytmp3?url=${search.data[0].url}`);
            await sock.sendMessage(m.key.remoteJid, { audio: { url: dl.data.result.download_url }, mimetype: 'audio/mp4', contextInfo: ghostContext }, { quoted: m });
        } catch (e) { m.reply("Psalm not found."); }
    }
};
