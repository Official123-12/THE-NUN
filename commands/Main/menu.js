const axios = require('axios');
const { doc, getDoc } = require('firebase/firestore');

module.exports = {
    name: 'menu',
    async execute(m, sock, commands, args, db, ghostContext) {
        const from = m.key.remoteJid;
        const pushName = m.pushName || "ꜱᴏᴜʟ";
        const uptime = `${Math.floor(process.uptime() / 3600)}ʜ ${Math.floor((process.uptime() % 3600) / 60)}ᴍ`;
        
        // 1. FETCH MODE & PREFIX FROM FIREBASE
        const ownerId = sock.user.id.split(':')[0];
        const setSnap = await getDoc(doc(db, "SETTINGS", ownerId));
        const s = setSnap.exists() ? setSnap.data() : { prefix: ".", mode: "public" };

        // 2. CATEGORIZE
        const categories = {};
        commands.forEach(cmd => {
            const cat = cmd.category ? cmd.category.toUpperCase() : 'ꜱᴀɴᴄᴛᴜᴀʀʏ';
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(cmd.name);
        });

        // 3. BUILD GOTHIC BODY
        let menuBody = `╭─── • ✞ • ───╮\n      ᴛ ʜ ᴇ  ɴ ᴜ ɴ  \n╰─── • ✞ • ───╯\n\n`;
        menuBody += `✟  *ɢᴜᴀʀᴅɪᴀɴ* : ${pushName}\n`;
        menuBody += `✟  *ᴍᴏᴅᴇ* : ${s.mode?.toUpperCase()}\n`;
        menuBody += `✟  *ᴜᴘᴛɪᴍᴇ* : ${uptime}\n`;
        menuBody += `✟  *ᴅᴇᴠ* : ꜱᴛᴀɴʏᴛᴢ\n\n`;

        const sortedCats = Object.keys(categories).sort();
        for (const cat of sortedCats) {
            menuBody += `🕯️  *${cat}*\n`;
            menuBody += `───────────────\n`;
            categories[cat].sort().forEach(n => {
                menuBody += `   ✞ ${s.prefix}${n}\n`;
            });
            menuBody += `\n`;
        }

        menuBody += `_ᴅᴏᴍɪɴᴜꜱ ᴠᴏʙɪꜱᴄᴜᴍ_ 🥀`;

        try {
            // PULL IMAGE BUFFER FOR HD DISPLAY
            const response = await axios.get('https://files.catbox.moe/invj9p.png', { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data, 'binary');

            await sock.sendMessage(from, { 
                text: menuBody, 
                contextInfo: {
                    ...ghostContext,
                    externalAdReply: {
                        title: "✞ THE NUN MAINFRRAME ✞",
                        body: "IN SHADOWS WE TRUST",
                        mediaType: 1,
                        renderLargerThumbnail: true,
                        thumbnail: buffer,
                        sourceUrl: "https://whatsapp.com/channel/stanytz",
                        showAdAttribution: true 
                    }
                }
            }, { quoted: m });
        } catch (e) {
            await sock.sendMessage(from, { text: menuBody, contextInfo: ghostContext });
        }
    }
};
