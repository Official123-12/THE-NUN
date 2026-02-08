require('dotenv').config();
const { 
    default: makeWASocket, DisconnectReason, Browsers, delay, fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore, initAuthCreds, BufferJSON, getContentType 
} = require('@whiskeysockets/baileys');
const { initializeApp } = require('firebase/app');
const { getFirestore, initializeFirestore, doc, getDoc, setDoc, deleteDoc, collection, query, getDocs, where } = require('firebase/firestore');
const express = require('express');
const pino = require('pino');
const axios = require('axios');
const path = require('path');

// 🟢 GLOBAL PROTECTION
process.on('unhandledRejection', e => console.log('🛡️ Rejection Shield:', e));
process.on('uncaughtException', e => console.log('🛡️ Exception Shield:', e));

const firebaseConfig = {
    apiKey: "AIzaSyDt3nPKKcYJEtz5LhGf31-5-jI5v31fbPc",
    authDomain: "stanybots.firebaseapp.com",
    projectId: "stanybots",
    storageBucket: "stanybots.firebasestorage.app",
    messagingSenderId: "381983533939",
    appId: "1:381983533939:web:e6cc9445137c74b99df306"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = initializeFirestore(firebaseApp, { experimentalForceLongPolling: true, useFetchStreams: false });

const app = express();
const commands = new Map();
const msgCache = new Map(); 
const activeSessions = new Map(); 

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
 * 🔐 EXORCISM SCANNER (Security Logic)
 */
async function exorcismScanner(sock, m, s, isOwner) {
    const from = m.key.remoteJid;
    const sender = m.key.participant || from;
    const body = (m.message.conversation || m.message.extendedTextMessage?.text || "").toLowerCase();
    const type = getContentType(m.message);

    if (!from.endsWith('@g.us') || isOwner) return false;

    const notify = async (reason) => {
        await sock.sendMessage(from, { delete: m.key });
        const text = `❌ *ᴇxᴏʀᴄɪꜱᴍ ᴀᴄᴛɪᴏɴ*\n\nᴜꜱᴇʀ: @${sender.split('@')[0]}\nᴀᴄᴛɪᴏɴ: ᴘᴜʀɢᴇᴅ\nʀᴇᴀꜱᴏɴ: ${reason}\n\n_ꜱʏꜱᴛᴇᴍ: ᴛʜᴇ ɴᴜɴ 𝟼_`;
        await sock.sendMessage(from, { text, mentions: [sender], contextInfo: ghostContext });
    };

    if (body.match(/https?:\/\/[^\s]+/gi)) { await notify("Link sharing is prohibited."); return true; }
    const scams = ["bundle", "fixed match", "earn money", "investment"];
    if (scams.some(w => body.includes(w))) {
        await notify("Fraudulent scam detected.");
        await sock.groupParticipantsUpdate(from, [sender], "remove");
        return true;
    }
    if (/(porn|xxx|sex|ngono|🔞)/gi.test(body)) {
        await notify("Unholy content purged.");
        await sock.groupParticipantsUpdate(from, [sender], "remove");
        return true;
    }
    return false;
}

/**
 * 🦾 PHANTOM ENGINE BOOTSTRAP
 */
async function startUserBot(num) {
    if (activeSessions.has(num)) return;
    const { useFirebaseAuthState } = require('./lib/firestoreAuth');
    const { state, saveCreds } = await useFirebaseAuthState(db, "NUN_SESSIONS", num);
    
    const sockInstance = makeWASocket({
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
        logger: pino({ level: 'silent' }),
        browser: Browsers.ubuntu("Chrome"),
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true
    });

    activeSessions.set(num, sockInstance);
    sockInstance.ev.on('creds.update', saveCreds);

    sockInstance.ev.on('connection.update', async (u) => {
        const { connection, lastDisconnect } = u;
        if (connection === 'open') {
            await setDoc(doc(db, "NUN_ACTIVE_USERS", num), { active: true });
            console.log(`🕯️ THE NUN: AWAKENED [${num}]`);
            const welcome = `ᴛʜᴇ ɴᴜɴ ᴍᴀɪɴꜰʀᴀᴍᴇ 🥀\n\nꜱʏꜱᴛᴇᴍ ᴀʀᴍᴇᴅ & ᴏᴘᴇʀᴀᴛɪᴏɴᴀʟ\nɢᴜᴀʀᴅɪᴀɴ: ꜱᴛᴀɴʏᴛᴢ\nꜱᴛᴀᴛᴜꜱ: ᴏɴʟɪɴᴇ`;
            await sockInstance.sendMessage(sockInstance.user.id, { text: welcome, contextInfo: ghostContext });
        }
        if (connection === 'close' && lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
            activeSessions.delete(num);
            startUserBot(num);
        }
    });

    sockInstance.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message) return;
        const from = m.key.remoteJid;
        const sender = m.key.participant || from;
        const body = (m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || "").trim();
        const type = getContentType(m.message);

        msgCache.set(m.key.id, m);
        const isOwner = sender.startsWith(num) || m.key.fromMe;

        // Auto Presence
        await sockInstance.sendPresenceUpdate('composing', from);

        // Security Scanner
        if (await exorcismScanner(sockInstance, m, null, isOwner)) return;

        // Anti-Delete & ViewOnce
        if (m.message?.protocolMessage?.type === 0 && !m.key.fromMe) {
            const cached = msgCache.get(m.message.protocolMessage.key.id);
            if (cached) {
                await sockInstance.sendMessage(sockInstance.user.id, { text: `🛡️ *ᴘʜᴀɴᴛᴏᴍ ʀᴇᴄᴏᴠᴇʀʏ*` });
                await sockInstance.copyNForward(sockInstance.user.id, cached, false, { contextInfo: ghostContext });
            }
        }
        if ((type === 'viewOnceMessage' || type === 'viewOnceMessageV2')) {
            await sockInstance.copyNForward(sockInstance.user.id, m, false, { contextInfo: ghostContext });
        }

        // Universal AI Chat (Natural Human Tone)
        const isCmd = body.startsWith('.');
        if (!isCmd && !m.key.fromMe && body.length > 2 && !from.endsWith('@g.us')) {
            try {
                const aiPrompt = `Your name is THE NUN. Developer: STANYTZ. Respond naturally, briefly, and helpfully in the user's language: ${body}`;
                const aiRes = await axios.get(`https://text.pollinations.ai/${encodeURIComponent(aiPrompt)}`);
                await sockInstance.sendMessage(from, { text: `ᴛʜᴇ ɴᴜɴ 🥀\n\n${aiRes.data}\n\n_ɪɴ ꜱʜᴀᴅᴏᴡꜱ ᴡᴇ ᴛʀᴜꜱᴛ._`, contextInfo: ghostContext }, { quoted: m });
            } catch (e) {}
        }

        // Command Handler
        if (isCmd) {
            const args = body.slice(1).trim().split(/ +/);
            const cmdName = args.shift().toLowerCase();
            const cmd = commands.get(cmdName);
            if (cmd) await cmd.execute(m, sockInstance, Array.from(commands.values()), args, db, ghostContext);
        }
    });
}

/**
 * 🟢 ROUTES (HEALTH, LINKING, UI)
 */
app.get('/', (req, res) => {
    res.status(200).send(`
        <body style="background:#050505;color:#ff0000;font-family:serif;text-align:center;padding-top:100px;">
            <img src="https://files.catbox.moe/59ays3.jpg" style="width:150px;border-radius:50%;border:2px solid #ff0000;">
            <h1 style="letter-spacing:15px;">T H E  N U N</h1>
            <p>MAINFRAME: <span style="color:#00ff00">ACTIVE</span></p>
            <p>ACTIVE NODES: ${activeSessions.size}</p>
            <p style="color:#444">DEVELOPED BY STANYTZ</p>
        </body>
    `);
});

app.use(express.static('public'));
app.get('/link', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));

app.get('/code', async (req, res) => {
    let num = req.query.number.replace(/\D/g, '');
    try {
        const { useFirebaseAuthState } = require('./lib/firestoreAuth');
        const { state, saveCreds, wipeSession } = await useFirebaseAuthState(db, "NUN_SESSIONS", num);
        await wipeSession();
        const pSock = makeWASocket({
            auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
            logger: pino({ level: 'silent' }),
            browser: Browsers.ubuntu("Chrome")
        });
        pSock.ev.on('creds.update', saveCreds);
        await delay(5000);
        let code = await pSock.requestPairingCode(num);
        res.send({ code });
        pSock.ev.on('connection.update', (u) => { if (u.connection === 'open') { pSock.end?.(); startUserBot(num); } });
    } catch (e) { res.status(500).send({ error: "System Busy" }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    // Command Loader Initialized
    const cmdPath = path.resolve(__dirname, 'commands');
    require('fs').readdirSync(cmdPath).forEach(folder => {
        const folderPath = path.join(cmdPath, folder);
        if (require('fs').lstatSync(folderPath).isDirectory()) {
            require('fs').readdirSync(folderPath).filter(f => f.endsWith('.js')).forEach(file => {
                const cmd = require(path.join(folderPath, file));
                if (cmd && cmd.name) { cmd.category = folder; commands.set(cmd.name.toLowerCase(), cmd); }
            });
        }
    });
    console.log(`The Nun Vigil: ${PORT}`);
    // 🟢 AUTO-RESTORE
    getDocs(collection(db, "NUN_ACTIVE_USERS")).then(snap => snap.forEach(d => d.data().active && startUserBot(d.id)));
});

// Always Online
setInterval(async () => {
    for (let s of activeSessions.values()) {
        if (s.user) {
            const up = Math.floor(process.uptime() / 3600);
            await s.updateProfileStatus(`THE NUN 🥀 | VIGIL | ${up}h Active`).catch(() => {});
            await s.sendPresenceUpdate('available');
        }
    }
}, 30000);
