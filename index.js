require('dotenv').config();
const { 
    default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers, 
    delay, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, getContentType 
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

// 🟢 GLOBAL STABILITY SHIELD
process.on('unhandledRejection', e => console.log('🛡️ Rejection Shielded:', e));
process.on('uncaughtException', e => console.log('🛡️ Exception Shielded:', e));

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

const commands = new Map();
const loadCmds = () => {
    const cmdPath = path.resolve(__dirname, 'commands');
    if (!fs.existsSync(cmdPath)) fs.mkdirSync(cmdPath);
    fs.readdirSync(cmdPath).forEach(folder => {
        const folderPath = path.join(cmdPath, folder);
        if (fs.lstatSync(folderPath).isDirectory()) {
            fs.readdirSync(folderPath).filter(f => f.endsWith('.js')).forEach(file => {
                try {
                    const cmd = require(path.join(folderPath, file));
                    if (cmd && cmd.name) {
                        cmd.category = folder;
                        commands.set(cmd.name.toLowerCase(), cmd);
                    }
                } catch (e) {}
            });
        }
    });
};

/**
 * 🧠 SUPREME PHANTOM LOGIC (AI, SECURITY, AUTOMATION)
 */
async function handlePhantomLogic(sock, m) {
    const from = m.key.remoteJid;
    const sender = m.key.participant || from;
    const body = (m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || "").trim();
    const type = getContentType(m.message);

    msgCache.set(m.key.id, m);

    // 1. AUTO PRESENCE
    await sock.sendPresenceUpdate('composing', from);

    // 2. PHANTOM RECOVERY (Anti-Delete & ViewOnce to User DM)
    if (m.message?.protocolMessage?.type === 0 && !m.key.fromMe) {
        const cached = msgCache.get(m.message.protocolMessage.key.id);
        if (cached) {
            await sock.sendMessage(sock.user.id, { text: `✞ *ᴘʜᴀɴᴛᴏᴍ ʀᴇᴄᴏᴠᴇʀʏ* ✞\nCaptured from @${sender.split('@')[0]}`, mentions: [sender] });
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
        const moodPrompt = `React as a mysterious but cool human friend to this status briefly in User Language and Mood: "${body}". No quotes.`;
        const aiMood = await axios.get(`https://text.pollinations.ai/${encodeURIComponent(moodPrompt)}`);
        await sock.sendMessage(from, { text: aiMood.data, contextInfo: ghostContext }, { quoted: m });
        await sock.sendMessage(from, { react: { text: '🥀', key: m.key } }, { statusJidList: [sender] });
    }

    // 5. GHOSTLY AUTO-AI CHAT (Universal Personality)
    if (!body.startsWith('.') && !m.key.fromMe && body.length > 2 && !from.endsWith('@g.us')) {
        try {
            const aiPrompt = `Your name is THE NUN, a mysterious human-like guardian by STANYTZ. Respond naturally, briefly, and helpfully in the user's language: ${body}`;
            const aiRes = await axios.get(`https://text.pollinations.ai/${encodeURIComponent(aiPrompt)}`);
            await sock.sendMessage(from, { text: `ᴛʜᴇ ɴᴜɴ 🥀\n\n${aiRes.data}\n\n_ɪɴ ꜱʜᴀᴅᴏᴡꜱ ᴡᴇ ᴛʀᴜꜱᴛ._`, contextInfo: ghostContext }, { quoted: m });
        } catch (e) {}
    }

    // 6. COMMAND EXECUTION (Reply-By-Number Support)
    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const quotedText = (quoted?.conversation || quoted?.extendedTextMessage?.text || "").toLowerCase();
    if (quoted && !isNaN(body)) {
        for (let [name, obj] of commands) {
            if (quotedText.includes(name)) {
                await obj.execute(m, sock, Array.from(commands.values()), [body.trim()], null, ghostContext);
                return;
            }
        }
    }

    if (body.startsWith('.')) {
        const args = body.slice(1).trim().split(/ +/);
        const cmdName = args.shift().toLowerCase();
        const cmd = commands.get(cmdName);
        if (cmd) await cmd.execute(m, sock, Array.from(commands.values()), args, null, ghostContext);
    }
}

/**
 * 🦾 ENGINE BOOTSTRAP (Multi-User & Auto-Restore)
 */
async function startNun(num) {
    if (activeSessions.has(num)) return;
    const sessionPath = path.join(__dirname, 'sessions', num);
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

    const sockInstance = makeWASocket({
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
        logger: pino({ level: 'silent' }),
        browser: Browsers.ubuntu("Chrome"),
        markOnlineOnConnect: true
    });

    activeSessions.set(num, sockInstance);
    sockInstance.ev.on('creds.update', saveCreds);

    sockInstance.ev.on('connection.update', async (u) => {
        const { connection, lastDisconnect } = u;
        if (connection === 'open') {
            console.log(`🕯️ THE NUN: AWAKENED [${num}]`);
            const msg = `ᴛʜᴇ ɴᴜɴ ᴍᴀɪɴꜰʀᴀᴍᴇ 🥀\n\nꜱʏꜱᴛᴇᴍ ᴀʀᴍᴇᴅ & ᴏᴘᴇʀᴀᴛɪᴏɴᴀʟ\nɢᴜᴀʀᴅɪᴀɴ: ꜱᴛᴀɴʏᴛᴢ\nꜱᴛᴀᴛᴜꜱ: ᴏɴʟɪɴᴇ`;
            await sockInstance.sendMessage(sockInstance.user.id, { text: msg, contextInfo: ghostContext });
        }
        if (connection === 'close' && lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
            activeSessions.delete(num);
            startNun(num);
        }
    });

    sockInstance.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message) return;
        await handlePhantomLogic(sockInstance, m);
    });
}

/**
 * 🟢 ROUTES (PAIRING & UI)
 */
app.use(express.static('public'));

app.get('/code', async (req, res) => {
    let num = req.query.number.replace(/\D/g, '');
    if (!num) return res.status(400).send({ error: "Missing Number" });
    try {
        const sessionPath = path.join(__dirname, 'sessions', num);
        if (fs.existsSync(sessionPath)) fs.removeSync(sessionPath);
        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
        const pSock = makeWASocket({ auth: state, logger: pino({level:'silent'}), browser: Browsers.ubuntu("Chrome") });
        pSock.ev.on('creds.update', saveCreds);
        await delay(5000); 
        let code = await pSock.requestPairingCode(num);
        res.send({ code });
        pSock.ev.on('connection.update', (u) => { if (u.connection === 'open') startNun(num); });
    } catch (e) { res.status(500).send({ error: "System Busy" }); }
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));

/**
 * 🟢 SERVER STARTUP
 */
app.listen(PORT, async () => {
    loadCmds();
    console.log(`✞ THE NUN MAINFRRAME: PORT ${PORT} ✞`);
    const sessionsDir = path.join(__dirname, 'sessions');
    if (fs.existsSync(sessionsDir)) {
        fs.readdirSync(sessionsDir).forEach(num => startNun(num));
    }
});

// AUTO BIO & ALWAYS ONLINE
setInterval(async () => {
    for (let s of activeSessions.values()) {
        if (s.user) {
            const up = Math.floor(process.uptime() / 3600);
            await s.updateProfileStatus(`ᴛʜᴇ ɴᴜɴ 🥀 | ᴇᴛᴇʀɴᴀʟ ᴠɪɢɪʟ | ${up}ʜ ᴀᴄᴛɪᴠᴇ`).catch(() => {});
            await s.sendPresenceUpdate('available');
        }
    }
}, 30000);
