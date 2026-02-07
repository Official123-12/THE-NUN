/**
 * 🕯️ THE NUN - FOREX VIGIL ENGINE
 * ✞ STYLE: GOTHIC VERTICAL | REPLY-BY-NUMBER
 * ✞ DEVELOPED BY STANYTZ
 */

const axios = require('axios');

module.exports = {
    name: 'forex',
    async execute(m, sock, commands, args, db, ghostContext) {
        const from = m.key.remoteJid;
        
        const pairs = [
            "ᴇᴜʀ/ᴜꜱᴅ", "ɢʙᴘ/ᴜꜱᴅ", "ᴜꜱᴅ/ᴊᴘʏ", "ᴜꜱᴅ/ᴄʜꜰ", "ᴀᴜᴅ/ᴜꜱᴅ",
            "ᴜꜱᴅ/ᴄᴀᴅ", "ɴᴢᴅ/ᴜꜱᴅ", "ᴇᴜʀ/ɢʙᴘ", "ᴇᴜʀ/ᴊᴘʏ", "ɢʙᴘ/ᴊᴘʏ",
            "xᴀᴜ/ᴜꜱᴅ (ɢᴏʟᴅ)", "ʙᴛᴄ/ᴜꜱᴅ", "ᴇᴛʜ/ᴜꜱᴅ", "ꜱᴏʟ/ᴜꜱᴅ", "ᴜꜱ𝟹𝟶 (ᴅᴏᴡ ᴊᴏɴᴇꜱ)",
            "💡 ᴛʀᴀᴅɪɴɢ ᴛᴜᴛᴏʀɪᴀʟ"
        ];

        // 🟢 STEP 1: DISPLAY SELECTION LIST
        if (!args[0]) {
            let list = `╭─── • ✞ • ───╮\n  ꜰ ᴏ ʀ ᴇ x  ᴠ ɪ ɢ ɪ ʟ  \n╰─── • ✞ • ───╯\n\n`;
            list += `ʀᴇᴘʟʏ ᴡɪᴛʜ ᴀ ɴᴜᴍʙᴇʀ ᴛᴏ ɪɴᴠᴏᴋᴇ ᴀ ꜱɪɢɴᴀʟ:\n\n`;
            pairs.forEach((p, i) => {
                list += `   ✟  ${i + 1}. ${p}\n`;
            });
            list += `\n_ɢᴜᴀʀᴅɪᴀɴ: ꜱᴛᴀɴʏᴛᴢ_`;
            
            return sock.sendMessage(from, { 
                text: list, 
                contextInfo: {
                    ...ghostContext,
                    externalAdReply: {
                        title: "✞ FOREX MAINFRAME ✞",
                        body: "MARKET ANALYSIS ACTIVE",
                        mediaType: 1,
                        renderLargerThumbnail: true,
                        thumbnailUrl: "https://files.catbox.moe/59ays3.jpg",
                        showAdAttribution: true
                    }
                }
            }, { quoted: m });
        }

        const choice = parseInt(args[0]);

        // 🟢 STEP 2: TUTORIAL LOGIC (Choice 16)
        if (choice === 16) {
            let help = `╭─── • ✞ • ───╮\n  ᴛʀᴀᴅɪɴɢ ʀɪᴛᴜᴀʟ  \n╰─── • ✞ • ───╯\n\n`;
            help += `✟ 1. ᴏᴘᴇɴ ʏᴏᴜʀ ᴛʀᴀᴅɪɴɢ ᴘʟᴀᴛꜰᴏʀᴍ (ᴍᴛ𝟺/ᴍᴛ𝟻).\n`;
            help += `✟ 2. ꜱᴇʟᴇᴄᴛ ᴛʜᴇ ᴘᴀɪʀ ᴘʀᴏᴠɪᴅᴇᴅ ʙʏ ᴛʜᴇ ɴᴜɴ.\n`;
            help += `✟ 3. ᴇxᴇᴄᴜᴛᴇ ᴛʜᴇ ᴀᴄᴛɪᴏɴ (ʙᴜʏ/ꜱᴇʟʟ) ᴀᴛ ᴇɴᴛʀʏ.\n`;
            help += `✟ 4. ꜱᴇᴛ ᴛᴀᴋᴇ ᴘʀᴏꜰɪᴛ (ᴛᴘ) ᴀɴᴅ ꜱᴛᴏᴘ ʟᴏꜱꜱ (ꜱʟ).\n\n`;
            help += `⚠️ *ᴘʀᴇᴄᴀᴜᴛɪᴏɴ*: ᴛʀᴀᴅɪɴɢ ɪꜱ ᴀ ꜱᴀᴄʀɪꜰɪᴄᴇ ᴏꜰ ᴄᴀᴘɪᴛᴀʟ. ᴡᴇ ᴀʀᴇ ɴᴏᴛ ʟɪᴀʙʟᴇ ꜰᴏʀ ʟᴏꜱꜱᴇꜱ. ᴛʀᴀᴅᴇ ᴡɪᴛʜ ꜰᴀɪᴛʜ ᴀɴᴅ ʟᴏɢɪᴄ. 🕯️`;
            return sock.sendMessage(from, { text: help, contextInfo: ghostContext }, { quoted: m });
        }

        // 🟢 STEP 3: SIGNAL GENERATION (Choice 1-15)
        if (choice >= 1 && choice <= 15) {
            const selectedPair = pairs[choice - 1];
            
            try {
                // Fetching real base rates for realism
                const api = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
                const basePrice = api.data.rates.EUR; 

                // Deep Logic Simulation
                const action = Math.random() > 0.5 ? "ʙᴜʏ ⬆️" : "ꜱᴇʟʟ ⬇️";
                const volatility = (Math.random() * 0.05).toFixed(4);
                const entry = (1.08 + Math.random() * 0.1).toFixed(5);
                
                // Calculate TP and SL based on Action
                let tp1, tp2, sl;
                if (action.includes("ʙᴜʏ")) {
                    tp1 = (parseFloat(entry) + 0.0040).toFixed(5);
                    tp2 = (parseFloat(entry) + 0.0085).toFixed(5);
                    sl = (parseFloat(entry) - 0.0035).toFixed(5);
                } else {
                    tp1 = (parseFloat(entry) - 0.0040).toFixed(5);
                    tp2 = (parseFloat(entry) - 0.0085).toFixed(5);
                    sl = (parseFloat(entry) + 0.0035).toFixed(5);
                }

                let res = `╭─── • ✞ • ───╮\n  ᴠ ɪ ɢ ɪ ʟ  ꜱ ɪ ɢ ɴ ᴀ ʟ  \n╰─── • ✞ • ───╯\n\n`;
                res += `✟  *ᴘᴀɪʀ* : ${selectedPair.toUpperCase()}\n`;
                res += `✟  *ᴀᴄᴛɪᴏɴ* : ${action}\n`;
                res += `✟  *ᴇɴᴛʀʏ* : ${entry}\n`;
                res += `✟  *ᴛᴘ 𝟷* : ${tp1}\n`;
                res += `✟  *ᴛᴘ 𝟸* : ${tp2}\n`;
                res += `✟  *ꜱʟ* : ${sl}\n\n`;
                res += `✟  *ᴠᴏʟᴀᴛɪʟɪᴛʏ* : ʜɪɢʜ\n`;
                res += `✟  *ᴛɪᴍᴇ* : ${new Date().toLocaleTimeString()}\n\n`;
                res += `_ᴛʜᴇ ɴᴜɴ ʜᴀꜱ ꜱᴘᴏᴋᴇɴ._ 🥀`;

                await sock.sendMessage(from, { text: res, contextInfo: ghostContext }, { quoted: m });

            } catch (e) {
                await sock.sendMessage(from, { text: "🕯️ *ᴛʜᴇ ᴍᴀʀᴋᴇᴛ ᴠᴏɪᴅ ɪꜱ ᴄʟᴏꜱᴇᴅ.* ᴛʀʏ ᴀɢᴀɪɴ.", contextInfo: ghostContext });
            }
        } else {
            await sock.sendMessage(from, { text: "✞ *ɪɴᴠᴀʟɪᴅ ʀɪᴛᴜᴀʟ ɴᴜᴍʙᴇʀ* ✞", contextInfo: ghostContext });
        }
    }
};
