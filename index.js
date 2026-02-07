require('dotenv').config();
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    Browsers, 
    delay, 
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    initAuthCreds,
    getContentType
} = require('@whiskeysockets/baileys');
const express = require('express');
const pino = require('pino');
const axios = require('axios');
const path = require('path');
const fs = require('fs-extra');

/**
 * 🕯️ T H E  N U N 🕯️
 * ✞ THE GHOSTLY GUARDIAN ✞
 * DEVELOPED BY STANYTZ
 */

const app = express();
const PORT = process.env.PORT || 3000;
const activeSessions = new Map();
const msgCache = new Map();

// 🟢 GLOBAL ERROR PROTECTION
process.on('unhandledRejection', e => console.log('🛡️ Rejection Shield:', e));
process.on('uncaughtException', e => console.log('🛡️ Exception Shield:', e));

// 💎 THE NUN NEWSLETTER MASK
const ghostContext = {
    isForwarded: true,
    forwardingScore: 999,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363404317544295@newsletter',
        serverMessageId: 666,
        newsletterName: 'ᴛʜᴇ ɴᴜɴ ᴘʀᴏᴘʜᴇᴄʏ 🥀'
    }
};

/**
 * 🧠 SUPREME LOGIC (AI, SECURITY, AUTOMATION)
 */
async function handleNunLogic(sock, m) {
    const from = m.key.remoteJid;
    const sender = m.key.participant || from;
    const body = (m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || "").trim();
    const type = getContentType(m.message);

    msgCache.set(m.key.id, m);

    // 1. AUTO PRESENCE
    await sock.sendPresenceUpdate('composing', from);

    // 2. ANTI-DELETE & VIEWONCE (Forward to User DM)
    if (m.message?.protocolMessage?.type === 0 && !m.key.fromMe) {
        const cached = msgCache.get(m.message.protocolMessage.key.id);
        if (cached) {
            await sock.sendMessage(sock.user.id, { text: `✞ *ᴘʜᴀɴᴛᴏᴍ ʀᴇᴄᴏᴠᴇʀʏ* ✞\nCaptured deleted trace from @${sender.split('@')[0]}`, mentions: [sender] });
            await sock.copyNForward(sock.user.id, cached, false, { contextInfo: ghostContext });
        }
    }
    if (type === 'viewOnceMessage' || type === 'viewOnceMessageV2') {
        await sock.sendMessage(sock.user.id, { text: `✞ *ꜱʜᴀᴅᴏᴡ ᴠɪꜱɪᴏɴ ᴄᴀᴘᴛᴜʀᴇᴅ* ✞` });
        await sock.copyNForward(sock.user.id, m, false, { contextInfo: ghostContext });
    }

    // 3. EXORCISM (ANTI-LINK / PORN / SCAM)
    if (from.endsWith('@g.us') && !m.key.fromMe) {
        const demonScan = /(http|porn|xxx|sex|ngono|bundle|fixed match|earn money)/gi;
        if (demonScan.test(body)) {
            await sock.sendMessage(from, { delete: m.key });
            await sock.sendMessage(from, { text: `✞ *ᴇxᴏʀᴄɪꜱᴍ* ✞\nThe demon @${sender.split('@')[0]} has been purged.`, mentions: [sender], contextInfo: ghostContext });
            await sock.groupParticipantsUpdate(from, [sender], "remove");
        }
    }

    // 4. AUTO STATUS ENGINE (HUMAN MOOD)
    if (from === 'status@broadcast') {
        await sock.readMessages([m.key]);
        const moodPrompt = `React as a mysterious but cool human friend to this status briefly in English: "${body}". No quotes.`;
        const aiMood = await axios.get(`https://text.pollinations.ai/${encodeURIComponent(moodPrompt)}`);
        await sock.sendMessage(from, { text: aiMood.data, contextInfo: ghostContext }, { quoted: m });
        await sock.sendMessage(from, { react: { text: '🥀', key: m.key } }, { statusJidList: [sender] });
    }

    // 5. GHOSTLY AUTO-AI CHAT (Universal Personality)
    if (!body.startsWith('.') && !m.key.fromMe && body.length > 2 && !from.endsWith('@g.us')) {
        try {
            const aiPrompt = `Your name is THE NUN, a mysterious and ghostly human-like guardian developed by STANYTZ. Chat naturally and helpfully in the user's language. User says: ${body}`;
            const aiRes = await axios.get(`https://text.pollinations.ai/${encodeURIComponent(aiPrompt)}`);
            await sock.sendMessage(from, { text: `ᴛʜᴇ ɴᴜɴ 🥀\n\n${aiRes.data}\n\n_ɪɴ ꜱʜᴀᴅᴏᴡꜱ ᴡᴇ ᴛʀᴜꜱᴛ._`, contextInfo: ghostContext }, { quoted: m });
        } catch (e) {}
    }

    // 6. GOTHIC MENU
    if (body.toLowerCase() === '.menu' || body.toLowerCase() === 'menu') {
        let menu = `╭─── • ✞ • ───╮\n      ᴛ ʜ ᴇ  ɴ ᴜ ɴ  \n╰─── • ✞ • ───╯\n\n`;
        menu += `✟  ɢᴜᴀʀᴅɪᴀɴ : ${m.pushName}\n`;
        menu += `✟  ꜱᴛᴀᴛᴜꜱ : ᴇᴛᴇʀɴᴀʟ ᴠɪɢɪʟ\n`;
        menu += `✟  ᴅᴇᴠᴇʟᴏᴘᴇʀ : ꜱᴛᴀɴʏᴛᴢ\n\n`;
        menu += `🕯️  ꜱ ᴀ ɴ ᴄ ᴛ ᴜ ᴀ ʀ ʏ\n`;
        menu += `───────────────\n`;
        menu += `   ✞ .ping\n   ✞ .alive\n   ✞ .ai\n   ✞ .exorcise\n\n`;
        menu += `_ᴅᴏᴍɪɴᴜꜱ ᴠᴏʙɪꜱᴄᴜᴍ_ 🥀`;
        
        await sock.sendMessage(from, { 
            text: menu, 
            contextInfo: {
                ...ghostContext,
                externalAdReply: {
                    title: "✞ THE NUN MAINFRRAME ✞",
                    body: "IN SHADOWS WE TRUST",
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    thumbnailUrl: "https://files.catbox.moe/59ays3.jpg",
                    showAdAttribution: true 
                }
            }
        });
    }
}

/**
 * 🦾 ENGINE BOOTSTRAP (Multi-User & Auto-Restore)
 */
async function startNun(num) {
    if (activeSessions.has(num)) return;
    const sessionPath = path.join(__dirname, 'sessions', num);
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
        version,
        logger: pino({ level: 'silent' }),
        browser: Browsers.macOS("Safari"),
        markOnlineOnConnect: true
    });

    activeSessions.set(num, sock);
    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (u) => {
        const { connection, lastDisconnect } = u;
        if (connection === 'open') {
            console.log(`🕯️ THE NUN: AWAKENED [${num}]`);
            const msg = `ᴛʜᴇ ɴᴜɴ ᴍᴀɪɴꜰʀᴀᴍᴇ 🥀\n\nꜱʏꜱᴛᴇᴍ ᴀʀᴍᴇᴅ & ᴏᴘᴇʀᴀᴛɪᴏɴᴀʟ\nɢᴜᴀʀᴅɪᴀɴ: ꜱᴛᴀɴʏᴛᴢ\nꜱᴛᴀᴛᴜꜱ: ᴇᴛᴇʀɴᴀʟ ᴠɪɢɪʟ`;
            await sock.sendMessage(sock.user.id, { text: msg, contextInfo: ghostContext });
        }
        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                activeSessions.delete(num);
                startNun(num);
            }
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message) return;
        await handleNunLogic(sock, m);
    });
}

/**
 * 🟢 PAIRING ROUTE (ZERO ERRORS)
 */
app.get('/code', async (req, res) => {
    let num = req.query.number.replace(/\D/g, '');
    if (!num) return res.status(400).send({ error: "Missing Number" });

    try {
        const sessionPath = path.join(__dirname, 'sessions', num);
        if (fs.existsSync(sessionPath)) fs.removeSync(sessionPath);

        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
        const pSock = makeWASocket({ auth: state, logger: pino({level:'silent'}), browser: Browsers.macOS("Safari") });
        pSock.ev.on('creds.update', saveCreds);

        await delay(5000); 
        let code = await pSock.requestPairingCode(num);
        res.send({ code });

        pSock.ev.on('connection.update', (u) => {
            if (u.connection === 'open') startNun(num);
        });
    } catch (e) { res.status(500).send({ error: "System Busy" }); }
});

// 🟢 RAILWAY INDEX
app.get('/', (req, res) => {
    res.status(200).send(`
        <body style="background:#050505;color:#ff0000;font-family:serif;text-align:center;padding-top:100px;">
            <img src="https://files.catbox.moe/59ays3.jpg" style="width:150px;border-radius:50%;border:2px solid #ff0000;">
            <h1 style="letter-spacing:15px;">T H E  N U N</h1>
            <p style="color:#444;letter-spacing:5px;">VIGIL STATUS: <span style="color:#00ff00">ACTIVE</span></p>
            <p>SOULS BOUND: ${activeSessions.size}</p>
        </body>
    `);
});

app.use(express.static('public'));

app.listen(PORT, async () => {
    console.log(`✞ THE NUN MAINFRRAME: PORT ${PORT} ✞`);
    const sessionsDir = path.join(__dirname, 'sessions');
    if (fs.existsSync(sessionsDir)) {
        const folders = fs.readdirSync(sessionsDir);
        for (const num of folders) startNun(num);
    }
});
