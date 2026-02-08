require('dotenv').config();

// 🔥 USING ANGULARSOCKETS 1.4.5 (BAILEYS FORK)
const {
  default: makeWASocket,
  DisconnectReason,
  Browsers,
  delay,
  useMultiFileAuthState,
  getContentType,
  makeCacheableSignalKeyStore,
  initAuthCreds,
  BufferJSON,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys'); // This points to angularsockets@1.4.5

// 🔥 FIREBASE V8 (COMPATIBLE WITH ANGULARSOCKETS)
const firebase = require('firebase');
require('firebase/firestore');

const express = require('express');
const pino = require('pino');
const axios = require('axios');
const path = require('path');
const fs = require('fs-extra');

// 🛡️ GLOBAL STABILITY
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

// Initialize Firebase
let db;
try {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  db = firebase.firestore();
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase error:', error);
}

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
 * 🔐 EXORCISM SCANNER (Anti-Link, Porn, Scam)
 */
async function exorcismScanner(sock, m, isOwner) {
  const from = m.key.remoteJid;
  const sender = m.key.participant || from;
  const body = (m.message.conversation || m.message.extendedTextMessage?.text || "").toLowerCase();
  const type = getContentType(m.message);

  if (!from.endsWith('@g.us') || isOwner) return false;

  const demonFound = /(http|porn|xxx|sex|ngono|bundle|fixed match|earn money)/gi.test(body);
  if (demonFound) {
    await sock.sendMessage(from, { delete: m.key });
    await sock.sendMessage(from, { text: `✞ *ᴇxᴏʀᴄɪꜱᴍ ᴀᴄᴛɪᴏɴ* 🕯️\n\nᴛʜᴇ ᴅᴇᴍᴏɴ @${sender.split('@')[0]} ʜᴀꜱ ʙᴇᴇɴ ᴘᴜʀɢᴇᴅ.\nʀᴇᴀꜱᴏɴ: ᴜɴʜᴏʟʏ ᴄᴏɴᴛᴇɴᴛ.`, mentions: [sender], contextInfo: ghostContext });
    await sock.groupParticipantsUpdate(from, [sender], "remove");
    return true;
  }
  return false;
}

/**
 * 🦾 PHANTOM ENGINE LOGIC
 */
async function handlePhantomLogic(sock, m, num) {
  const from = m.key.remoteJid;
  const sender = m.key.participant || from;
  const body = (m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || "").trim();
  const type = getContentType(m.message);

  msgCache.set(m.key.id, m);
  const ownerId = sock.user.id.split(':')[0];
  const isOwner = sender.startsWith(num) || m.key.fromMe;

  const setSnap = await db.collection("SETTINGS").doc(ownerId).get();
  const s = setSnap.exists ? setSnap.data() : { mode: "public" };
  if (s.mode === "private" && !isOwner) return;

  // 1. AUTO PRESENCE
  await sock.sendPresenceUpdate('composing', from);

  // 2. 📸 STATUS ENGINE (VIEW + LIKE + AI MOOD REPLY)
  if (from === 'status@broadcast') {
    await sock.readMessages([m.key]);
    await sock.sendMessage(from, { react: { text: '🥀', key: m.key } }, { statusJidList: [sender] });
    try {
      const aiMood = await axios.get(`https://text.pollinations.ai/You are a mysterious guardian friend. React briefly and naturally in English to this status: "${body}". No quotes.`);
      await sock.sendMessage(from, { text: aiMood.data, contextInfo: ghostContext }, { quoted: m });
    } catch (e) { }
    return;
  }

  // 3. SECURITY SCANNER
  if (await exorcismScanner(sock, m, isOwner)) return;

  // 4. ANTI-DELETE & VIEWONCE
  if (m.message?.protocolMessage?.type === 0 && !m.key.fromMe) {
    const cached = msgCache.get(m.message.protocolMessage.key.id);
    if (cached) {
      await sock.sendMessage(sock.user.id, { text: `✞ *ᴘʜᴀɴᴛᴏᴍ ʀᴇᴄᴏᴠᴇʀʏ* ✞\nCaptured trace from @${sender.split('@')[0]}`, mentions: [sender] });
      await sock.copyNForward(sock.user.id, cached, false, { contextInfo: ghostContext });
    }
  }
  if (type === 'viewOnceMessage' || type === 'viewOnceMessageV2') {
    await sock.copyNForward(sock.user.id, m, false, { contextInfo: ghostContext });
  }

  // 5. GHOSTLY AUTO-AI CHAT
  const isCmd = body.startsWith('.');
  if (!isCmd && !m.key.fromMe && body.length > 2 && !from.endsWith('@g.us')) {
    try {
      const aiPrompt = `Your name is THE NUN. Developer: STANYTZ. Respond naturally and very briefly in the user's language: ${body}`;
      const aiRes = await axios.get(`https://text.pollinations.ai/${encodeURIComponent(aiPrompt)}`);
      await sock.sendMessage(from, { text: `ᴛʜᴇ ɴᴜɴ 🥀\n\n${aiRes.data}\n\n_ɪɴ ꜱʜᴀᴅᴏᴡꜱ ᴡᴇ ᴛʀᴜꜱᴛ._`, contextInfo: ghostContext }, { quoted: m });
    } catch (e) { }
  }

  // 6. COMMAND EXECUTION
  if (isCmd) {
    const args = body.slice(1).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();
    const cmd = commands.get(cmdName);
    if (cmd) await cmd.execute(m, sock, Array.from(commands.values()), args, db, ghostContext);
  }
}

// 🔥 FIREBASE AUTH STATE FOR ANGULARSOCKETS
async function useFirebaseAuthState(db, collectionName, userId) {
  const authRef = db.collection(collectionName).doc(userId);

  const state = {
    creds: initAuthCreds(),
    keys: {}
  };

  // Load from Firebase
  const snap = await authRef.get();
  if (snap.exists) {
    const data = snap.data();
    if (data.creds) {
      try {
        state.creds = JSON.parse(data.creds, BufferJSON.reviver);
      } catch (e) {
        state.creds = initAuthCreds();
      }
    }
    if (data.keys) {
      try {
        state.keys = JSON.parse(data.keys, BufferJSON.reviver);
      } catch (e) {
        state.keys = {};
      }
    }
  }

  const saveCreds = async () => {
    try {
      await authRef.set({
        creds: JSON.stringify(state.creds, BufferJSON.replacer),
        keys: JSON.stringify(state.keys, BufferJSON.replacer),
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.error('❌ Save creds error:', e);
    }
  };

  const wipeSession = async () => {
    try {
      await authRef.delete();
      state.creds = initAuthCreds();
      state.keys = {};
      console.log(`✅ Session wiped for ${userId}`);
    } catch (e) {
      console.error('❌ Wipe session error:', e);
    }
  };

  return { state, saveCreds, wipeSession };
}

/**
 * 🦾 ENGINE BOOTSTRAP
 */
async function startUserBot(num) {
  if (activeSessions.has(num)) {
    console.log(`⚠️ Session already active for ${num}`);
    return;
  }

  console.log(`🚀 Starting bot for ${num}...`);

  try {
    const { state, saveCreds } = await useFirebaseAuthState(db, "NUN_SESSIONS", num);

    const { version } = await fetchLatestBaileysVersion();

    const sockInstance = makeWASocket({
      version,
      auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
      logger: pino({ level: 'silent' }),
      browser: Browsers.macOS("Safari"),
      markOnlineOnConnect: true,
      generateHighQualityLinkPreview: true,
      printQRInTerminal: false
    });

    activeSessions.set(num, sockInstance);
    sockInstance.ev.on('creds.update', saveCreds);

    sockInstance.ev.on('connection.update', async (u) => {
      const { connection, lastDisconnect } = u;
      console.log(`📡 Connection update for ${num}:`, connection);

      if (connection === 'open') {
        await db.collection("NUN_ACTIVE_USERS").doc(num).set({ 
          active: true, 
          lastActive: new Date().toISOString(),
          user: sockInstance.user.id 
        });
        console.log(`🕯️ THE NUN: AWAKENED [${num}]`);
        const msg = `ᴛʜᴇ ɴᴜɴ ᴍᴀɪɴꜰʀᴀᴍᴇ 🥀\n\nꜱʏꜱᴛᴇᴍ ᴀʀᴍᴇᴅ & ᴏᴘᴇʀᴀᴛɪᴏɴᴀʟ\nɢᴜᴀʀᴅɪᴀɴ: ꜱᴛᴀɴʏᴛᴢ\nꜱᴛᴀᴛᴜꜱ: ᴏɴʟɪɴᴇ`;
        await sockInstance.sendMessage(sockInstance.user.id, { text: msg, contextInfo: ghostContext });
      }

      if (connection === 'close') {
        console.log(`🔌 Connection closed for ${num}:`, lastDisconnect?.error?.output?.statusCode);
        if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
          activeSessions.delete(num);
          setTimeout(() => {
            console.log(`🔄 Restarting bot for ${num}...`);
            startUserBot(num);
          }, 5000);
        } else {
          console.log(`❌ Logged out: ${num}`);
          activeSessions.delete(num);
          await db.collection("NUN_ACTIVE_USERS").doc(num).delete();
        }
      }
    });

    sockInstance.ev.on('messages.upsert', async ({ messages }) => {
      const m = messages[0];
      if (!m.message) return;
      await handlePhantomLogic(sockInstance, m, num);
    });

    // Handle call events
    sockInstance.ev.on('call', async (call) => {
      if (call.status === 'offer') {
        try {
          await sockInstance.rejectCall(call.id, call.from);
          await sockInstance.sendMessage(call.from, {
            text: `✞ ᴛʜᴇ ɴᴜɴ ᴅᴏᴇꜱ ɴᴏᴛ ᴀᴄᴄᴇᴘᴛ ᴄᴀʟʟꜱ 🕯️\n\nᴘʟᴇᴀꜱᴇ ꜱᴇɴᴅ ᴀ ᴍᴇꜱꜱᴀɢᴇ ɪɴꜱᴛᴇᴀᴅ.`,
            contextInfo: ghostContext
          });
        } catch (e) {}
      }
    });

  } catch (error) {
    console.error(`❌ Failed to start bot for ${num}:`, error);
    activeSessions.delete(num);
  }
}

/**
 * 🟢 ROUTES (HEALTH & PAIRING)
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(200).send(`
        <body style="background:#000;color:#ff0000;text-align:center;padding-top:100px;font-family:serif;">
            <h1>T H E  N U N</h1>
            <p>VIGIL: <span style="color:#00ff00">ACTIVE</span></p>
            <p>Active Sessions: ${activeSessions.size}</p>
            <p><a href="/link" style="color:#ff0000;">Pair Device</a></p>
        </body>
    `);
});

app.use(express.static('public'));
app.get('/link', (req, res) => {
  const indexPath = path.join(__dirname, 'public/index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send(`
            <html>
                <head><title>THE NUN PAIRING</title>
                <style>
                    body { background:#000; color:#ff0000; font-family:monospace; padding:20px; }
                    input, button { padding:10px; margin:5px; }
                    button { background:#ff0000; color:black; border:none; cursor:pointer; }
                </style>
                </head>
                <body>
                    <h1>🔗 THE NUN PAIRING</h1>
                    <input id="number" placeholder="+255123456789">
                    <button onclick="getCode()">GET PAIRING CODE</button>
                    <div id="result"></div>
                    
                    <script>
                        async function getCode() {
                            const num = document.getElementById('number').value;
                            const resultDiv = document.getElementById('result');
                            resultDiv.innerHTML = "Generating pairing code...";
                            
                            const res = await fetch('/code?number=' + encodeURIComponent(num));
                            const data = await res.json();
                            
                            if (data.code) {
                                resultDiv.innerHTML = '<h3>✅ CODE: <strong style="color:#00ff00">' + data.code + '</strong></h3><p>Open WhatsApp > Settings > Linked Devices > Link a Device > Enter this code</p>';
                            } else {
                                resultDiv.innerHTML = '<p style="color:yellow">❌ Error: ' + (data.error || 'Unknown') + '</p>';
                            }
                        }
                    </script>
                </body>
            </html>
        `);
  }
});

app.get('/code', async (req, res) => {
  try {
    if (!req.query.number) {
      return res.status(400).json({ error: "Number is required" });
    }

    // Clean number - remove all non-digits
    let num = req.query.number.replace(/\D/g, '');

    // Remove leading zeros if present
    if (num.startsWith('0')) {
      num = num.substring(1);
    }

    // If starts with 255 (Tanzania), keep as is
    // If starts with other country codes, keep as is
    // If short number, assume local (add 255)
    if (num.length === 9 && !num.startsWith('255')) {
      num = '255' + num;
    }

    console.log(`🔐 Requesting pairing code for: ${num}`);

    const { state, saveCreds, wipeSession } = await useFirebaseAuthState(db, "NUN_SESSIONS", num);
    await wipeSession();

    const { version } = await fetchLatestBaileysVersion();

    const pSock = makeWASocket({
      version,
      auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
      logger: pino({ level: 'silent' }),
      browser: Browsers.macOS("Safari"),
      markOnlineOnConnect: false,
      printQRInTerminal: false
    });

    pSock.ev.on('creds.update', saveCreds);

    // Wait for socket to initialize
    await delay(2000);

    let code = "";
    try {
      // Use the cleaned number for pairing
      code = await pSock.requestPairingCode(num);
      console.log(`✅ Pairing code generated for ${num}: ${code}`);
    } catch (pairError) {
      console.error("❌ Pairing error:", pairError);
      return res.status(500).json({ error: "Failed to generate pairing code. Please try again." });
    }

    res.json({ code: code, number: num });

    pSock.ev.on('connection.update', async (u) => {
      const { connection, lastDisconnect } = u;
      console.log(`📡 Pairing connection update:`, connection);

      if (connection === 'open') {
        console.log(`✅ Successfully paired: ${num}`);
        setTimeout(() => {
          if (pSock.ws && pSock.ws.readyState !== pSock.ws.CLOSED) {
            pSock.ws.close();
          }
          if (pSock.end) pSock.end();
        }, 2000);

        // Start the main bot after a delay
        setTimeout(() => {
          startUserBot(num);
        }, 3000);
      }

      if (connection === 'close') {
        console.log(`🔌 Pairing socket closed for: ${num}`);
        if (pSock.ws && pSock.ws.readyState !== pSock.ws.CLOSED) {
          pSock.ws.close();
        }
        if (pSock.end) pSock.end();
      }
    });

    // Auto-close after 2 minutes if not connected
    setTimeout(() => {
      if (pSock.ws && pSock.ws.readyState !== pSock.ws.CLOSED) {
        pSock.ws.close();
      }
      if (pSock.end) pSock.end();
    }, 120000);

  } catch (e) {
    console.error("❌ Code endpoint error:", e);
    res.status(500).json({ error: "System Busy. Please try again in 30 seconds." });
  }
});

// 🟢 ADD PING ENDPOINT FOR RENDER
app.get('/ping', (req, res) => {
  res.status(200).send('OK');
});

// 🟢 ADD SESSIONS ENDPOINT TO CHECK
app.get('/sessions', (req, res) => {
  const sessions = Array.from(activeSessions.keys());
  res.json({
    activeSessions: sessions,
    count: sessions.length,
    status: 'active'
  });
});

const PORT = process.env.PORT || 3000;

// Load commands
const loadCommands = () => {
  const cmdPath = path.resolve(__dirname, 'commands');
  if (fs.existsSync(cmdPath)) {
    fs.readdirSync(cmdPath).forEach(folder => {
      const folderPath = path.join(cmdPath, folder);
      if (fs.lstatSync(folderPath).isDirectory()) {
        fs.readdirSync(folderPath).filter(f => f.endsWith('.js')).forEach(file => {
          try {
            const cmd = require(path.join(folderPath, file));
            if (cmd && cmd.name) {
              cmd.category = folder;
              commands.set(cmd.name.toLowerCase(), cmd);
              console.log(`✅ Loaded command: ${cmd.name}`);
            }
          } catch (e) {
            console.error(`❌ Failed to load command ${file}:`, e);
          }
        });
      }
    });
  }
  console.log(`✅ Loaded ${commands.size} commands`);
};

// Start server
app.listen(PORT, () => {
  console.log(`🔥 The Nun Vigil active on port: ${PORT}`);
  loadCommands();

  // 🟢 AUTO-RESTORE active users from Firebase
  db.collection("NUN_ACTIVE_USERS").get()
    .then(snap => {
      snap.forEach(doc => {
        if (doc.exists && doc.data().active) {
          console.log(`🔄 Restoring session for: ${doc.id}`);
          setTimeout(() => {
            startUserBot(doc.id).catch(e =>
              console.error(`❌ Failed to restore ${doc.id}:`, e)
            );
          }, 5000);
        }
      });
    })
    .catch(e => console.error("❌ Firestore restore error:", e));
});

// Always Online heartbeat
setInterval(async () => {
  for (let [num, s] of activeSessions.entries()) {
    if (s.user) {
      try {
        const up = Math.floor(process.uptime() / 3600);
        await s.updateProfileStatus(`THE NUN 🥀 | VIGIL | ${up}h Active`).catch(() => { });
        await s.sendPresenceUpdate('available');
      } catch (e) {
        console.error(`❌ Heartbeat error for ${num}:`, e.message);
      }
    }
  }
}, 30000);

// 🟢 Keep Render alive
setInterval(() => {
  axios.get(`http://localhost:${PORT}/ping`).catch(() => { });
}, 60000);

// 🟢 Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down gracefully...');
  activeSessions.forEach((sock, num) => {
    if (sock.ws && sock.ws.readyState !== sock.ws.CLOSED) {
      sock.ws.close();
    }
    if (sock.end) sock.end();
  });
  process.exit(0);
});

// 🔥 Handle WhatsApp Web updates
setInterval(async () => {
  try {
    const { version } = await fetchLatestBaileysVersion();
    console.log(`📱 WhatsApp Web version: ${version.join('.')}`);
  } catch (e) { }
}, 3600000);
