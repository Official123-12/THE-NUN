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
process.on('unhandledRejection', e => console.log('🛡️ Rejection Shield:', e));
process.on('uncaughtException', e => console.log('🛡️ Exception Shield:', e));

// 💎 THE NUN NEWSLETTER MASKING
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
 * 🔐 EXORCISM SCANNER (Security Logic)
 */
async function exorcismScanner(sock, m) {
    const from = m.key.remoteJid;
    const sender = m.key.participant || from;
    const body = (m.message.conversation || m.message.extendedTextMessage?.text || "").toLowerCase();
    const type = getContentType(m.message);

    if (!from.endsWith('@g.us') || m.key.fromMe) return false;

    const demonFound = /(http|porn|xxx|sex|ngono|bundle|fixed match|invest|earn money)/gi.test(body);
    const mediaFound = (type === 'imageMessage' || type === 'videoMessage' || type === 'audioMessage');

    if (demonFound || mediaFound) {
        await sock.sendMessage(from, { delete: m.key });
        await sock.sendMessage(from, { 
            text: `✞ *ᴇxᴏʀᴄɪꜱᴍ ᴀᴄᴛɪᴏɴ* 🕯️\n\nᴛʜᴇ ᴅᴇᴍᴏɴ @${sender.split('@')[0]} ʜᴀꜱ ʙᴇᴇɴ ᴘᴜʀɢᴇᴅ ꜰᴏʀ ᴠɪᴏʟᴀᴛɪɴɢ ᴛʜᴇ ꜱᴀɴᴄᴛᴜᴀʀʏ.\nʀᴇᴀꜱᴏɴ: ᴜɴʜᴏʟʏ ᴄᴏɴᴛᴇɴᴛ.`,
            mentions: [sender],
            contextInfo: ghostContext
        });
        await sock.groupParticipantsUpdate(from, [sender], "remove");
        return true;
    }
    return false;
}

/**
 * 🦾 SUPREME GHOST LOGIC (AI, STATUS, AUTOMATION)
 */
async function handlePhantomLogic(sock, m) {
    const from = m.key.remoteJid;
    const sender = m.key.participant || from;
    const body = (m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || "").trim();
    const type = getContentType(m.message);

    msgCache.set(m.key.id, m);

    // 1. AUTO PRESENCE
    await sock.sendPresenceUpdate('composing', from);

    // 2. SECURITY SCANNER
    if (await exorcismScanner(sock, m)) return;

    // 3. PHANTOM RECOVERY (Anti-Delete & ViewOnce to User DM)
    if (m.message?.protocolMessage?.type === 0 && !m.key.fromMe) {
        const cached = msgCache.get(m.message.protocolMessage.key.id);
        if (cached) {
            await sock.sendMessage(sock.user.id, { text: `✞ *ᴘʜᴀɴᴛᴏᴍ ʀᴇᴄᴏᴠᴇʀʏ* ✞\nRecovered deleted trace from @${sender.split('@')[0]}`, mentions: [sender] });
            await sock.copyNForward(sock.user.id, cached, false, { contextInfo: ghostContext });
        }
    }
    if (type === 'viewOnceMessage' || type === 'viewOnceMessageV2') {
        await sock.sendMessage(sock.user.id, { text: `✞ *ꜱʜᴀᴅᴏᴡ ᴠɪꜱɪᴏɴ ᴄᴀᴘᴛᴜʀᴇᴅ* ✞` });
        await sock.copyNForward(sock.user.id, m, false, { contextInfo: ghostContext });
    }

    // 4. FORCE JOIN (Group JID: 120363406549688641@g.us)
    if (body.startsWith('.') && !m.key.fromMe) {
        try {
            const groupMetadata = await sock.groupMetadata('120363406549688641@g.us');
            if (!groupMetadata.participants.find(p => p.id === (sender.split(':')[0] + '@s.whatsapp.net'))) {
                return sock.sendMessage(from, { text: "✞ *ᴀᴄᴄᴇꜱꜱ ᴅᴇɴɪᴇᴅ* ✞\nᴊᴏɪɴ ᴛʜᴇ ꜱᴀɴᴄᴛᴜᴀʀʏ ᴛᴏ ᴜꜱᴇ ᴛʜᴇ ɴᴜɴ:\nhttps://chat.whatsapp.com/J19JASXoaK0GVSoRvShr4Y", contextInfo: ghostContext });
            }
        } catch (e) {}
    }

    // 5. GHOSTLY AUTO-AI (Natural Person - Swahili/English/All)
    if (!body.startsWith('.') && !m.key.fromMe && body.length > 2 && !from.endsWith('@g.us')) {
        try {
            const aiPrompt = `Your name is THE NUN. Your developer is STANYTZ. You are a mysterious guardian. Reply very briefly and naturally to: ${body}`;
            const aiRes = await axios.get(`https://text.pollinations.ai/${encodeURIComponent(aiPrompt)}`);
            await sock.sendMessage(from, { text: `ᴛʜᴇ ɴᴜɴ 🥀\n\n${aiRes.data}\n\n_ɪɴ ꜱʜᴀᴅᴏᴡꜱ ᴡᴇ ᴛʀᴜꜱᴛ._`, contextInfo: ghostContext }, { quoted: m });
        } catch (e) {}
    }

    // 6. GOTHIC MENU
    if (body.toLowerCase() === '.menu') {
        let uptime = `${Math.floor(process.uptime() / 3600)}ʜ ${Math.floor((process.uptime() % 3600) / 60)}ᴍ`;
        let menuBody = `╭─── • ✞ • ───╮\n      ᴛ ʜ ᴇ  ɴ ᴜ ɴ  \n╰─── • ✞ • ───╯\n\n`;
        menuBody += `✟  ɢᴜᴀʀᴅɪᴀɴ : ${m.pushName}\n`;
        menuBody += `✟  ᴜᴘᴛɪᴍᴇ : ${uptime}\n`;
        menuBody += `✟  ᴅᴇᴠᴇʟᴏᴘᴇʀ : ꜱᴛᴀɴʏᴛᴢ\n\n`;
        menuBody += `🕯️  ꜱ ᴀ ɴ ᴄ ᴛ ᴜ ᴀ ʀ ʏ\n`;
        menuBody += `───────────────\n`;
        menuBody += `   ✞ .ping\n   ✞ .ai\n   ✞ .vision\n   ✞ .ritual\n   ✞ .purge\n\n`;
        menuBody += `_ᴅᴏᴍɪɴᴜꜱ ᴠᴏʙɪꜱᴄᴜᴍ_ 🥀`;

        await sock.sendMessage(from, { 
            text: menuBody, 
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

    const sock = makeWASocket({
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
        logger: pino({ level: 'silent' }),
        browser: Browsers.ubuntu("Chrome"),
        markOnlineOnConnect: true
    });

    activeSessions.set(num, sock);
    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (u) => {
        const { connection, lastDisconnect } = u;
        if (connection === 'open') {
            console.log(`🕯️ THE NUN: AWAKENED [${num}]`);
            const msg = `ᴛʜᴇ ɴᴜɴ ᴍᴀɪɴꜰʀᴀᴍᴇ 🥀\n\nꜱʏꜱᴛᴇᴍ ᴀʀᴍᴇᴅ & ᴏᴘᴇʀᴀᴛɪᴏɴᴀʟ\nɢᴜᴀʀᴅɪᴀɴ: ꜱᴛᴀɴʏᴛᴢ\nꜱᴛᴀᴛᴜꜱ: ᴏɴʟɪɴᴇ`;
            await sock.sendMessage(sock.user.id, { text: msg, contextInfo: ghostContext });
        }
        if (connection === 'close' && lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
            activeSessions.delete(num);
            startNun(num);
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message) return;
        await handlePhantomLogic(sock, m);
    });
}

/**
 * 🟢 PAIRING & HEALTH ROUTES
 */
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

app.listen(PORT, async () => {
    console.log(`✞ THE NUN MAINFRRAME: PORT ${PORT} ✞`);
    // 🟢 AUTO-RESTORE ALL SESSIONS
    const sessionsDir = path.join(__dirname, 'sessions');
    if (fs.existsSync(sessionsDir)) {
        fs.readdirSync(sessionsDir).forEach(num => startNun(num));
    }
});

// ALWAYS ONLINE & BIO
setInterval(async () => {
    for (let s of activeSessions.values()) {
        if (s.user) {
            const up = Math.floor(process.uptime() / 3600);
            await s.updateProfileStatus(`THE NUN 🥀 | ETERNAL VIGIL | ${up}h Active`).catch(() => {});
            await s.sendPresenceUpdate('available');
        }
    }
}, 30000);
