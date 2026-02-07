const axios = require('axios');
module.exports = {
    name: 'coin',
    async execute(m, sock, commands, args, db, ghostContext) {
        try {
            const res = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd');
            const d = res.data;
            let resMsg = `╭─── • ✞ • ───╮\n  ᴄ ᴏ ɪ ɴ  ᴠ ɪ ɢ ɪ ʟ  \n╰─── • ✞ • ───╯\n\n✟  ʙᴛᴄ : $${d.bitcoin.usd}\n✟  ᴇᴛʜ : $${d.ethereum.usd}\n✟  ꜱᴏʟ : $${d.solana.usd}\n\n_ɢᴜᴀʀᴅɪᴀɴ: ꜱᴛᴀɴʏᴛᴢ_`;
            await sock.sendMessage(m.key.remoteJid, { text: resMsg, contextInfo: ghostContext });
        } catch (e) { m.reply("ᴄʀʏᴘᴛᴏ ᴠɪꜱɪᴏɴ ʙʟᴜʀʀᴇᴅ."); }
    }
};
