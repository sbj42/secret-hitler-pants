require('dotenv').config();

import path from 'path';
import express from 'express';
import session from 'express-session';
import * as WebSocket from 'ws';

import * as Server from './server';
import { log, setLogger } from './log';

const PORT = process.env.PORT || 1234;
const COOKIE_SECRET = process.env.COOKIE_SECRET || 'insecure';
const AUTO_ROOM = process.env.AUTO_ROOM;
const ADMIN_KEY = process.env.ADMIN_KEY;

setLogger(console.log);

function getRoomId(path: string) {
    if (path.endsWith('/')) {
        return path.substr(1, path.length - 2);
    } else {
        return path.substr(1, path.length - 1);
    }
}

try {
    const app = express();

    const sessionStore = new session.MemoryStore();
    const sessionParser = session({
        name: 'secret-hitler-pants.sessionid',
        secret: COOKIE_SECRET,
        resave: false,
        saveUninitialized: true,
        store: sessionStore,
    });
    
    app.use(sessionParser);

    if (AUTO_ROOM) {
        app.get('/', (req, res, next) => {
            res.redirect(`/${AUTO_ROOM}/`);
        });
    }

    if (process.env.NODE_ENV === 'development') {
        app.use(express.static(path.join(__dirname, '../web')));
    } else {
        app.use(express.static(path.join(__dirname, '../../web')));
    }

    app.use((req, res, next) => {
        if (!req.path.startsWith('/-/')) {
            const session = req.session as Express.Session;
            if (!('userIds' in session)) {
                session.userIds = {};
                log('new connection');
            }
        }
        next();
    });
    
    if (ADMIN_KEY) {
        app.use('/' + ADMIN_KEY + '/data', (req, res, next) => {
            res.json(Server.getAdminData());
        });
    }
    
    if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const parcel = require('parcel-bundler');
        if (ADMIN_KEY) {
            app.use('/' + ADMIN_KEY, express.static(path.join(__dirname, '../admin')));
        }
        const bundler = new parcel(path.join(__dirname, '../app/index.html'), {
            publicUrl: '/-/',
            outDir: 'dist/app',
            hmr: true,
        });
        const middleware = bundler.middleware();
        app.use((req, res, next) => {
            middleware(req, res, next);
        });
    } else {
        if (ADMIN_KEY) {
            app.use('/' + ADMIN_KEY, express.static(path.join(__dirname, '../../admin')));
        }
        app.use('/-/', express.static(path.join(__dirname, '../app')));
        app.use((req, res, next) => {
            res.sendFile(path.join(__dirname, '../app/index.html'));
        });
    }

    const server = app.listen(PORT, () => {
        console.info(`Listening on port ${PORT}...`);
    });

    const wsServer = new WebSocket.Server({
        noServer: true,
    });
    server.on('upgrade', (req, sock, head) => {
        sessionParser(req, {} as express.Response<{}>, () => {
            if (!('userIds' in req.session)) {
                log('ERROR [server]: no userIds in session');
                sock.destroy();
                return;
            }
            wsServer.handleUpgrade(req, sock, head, (ws) => {
                wsServer.emit('connection', ws, req);
            });
        });
    });
    wsServer.on('connection', (ws, req_) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const req = req_ as any;
        const {session,sessionID} = req;
        const roomId = getRoomId(req.url);
        if (roomId.length < 2 || roomId.length > 20) {
            ws.close();
            return;
        }
        let connected = true;
        const {userIds} = session;
        let userId = userIds[roomId];
        if (!userId) {
            userId = userIds[roomId] = Server.newUser(roomId);
            sessionStore.set(sessionID, session);
        }
        try {
            const sendMessage: Server.Listener = (message, forAll) => {
                if (!connected) {
                    log(`[room ${roomId}] [user ${userId}]: WARNING: listener called but not connected`);
                }
                const state = Server.getClientState(roomId, userId);
                if (!forAll) {
                    log(`[room ${roomId}] [user ${userId}]: sending "${message.type}" ${JSON.stringify(message)}`);
                }
                const msg = JSON.stringify({message, state});
                ws.send(msg);
            };
            Server.addListener(roomId, userId, sendMessage);
            sendMessage({ type: 'init' }, false);
        } catch (err) {
            log(`[room ${roomId}] [user ${userId}]: ERROR [connect]: ${err}`);
        }
        ws.on('message', (text) => {
            if (text === '') { // heartbeat
                log(`heartbeat`);
                return;
            }
            const message = JSON.parse(text.toString());
            try {
                log(`[room ${roomId}] [user ${userId}]: got: "${message.type}" ${JSON.stringify(message)}`);
                Server.onMessage(roomId, userId, message);
            } catch (err) {
                log(`[room ${roomId}] [user ${userId}]: ERROR: ${err}`);
            }
        });
        ws.on('close', () => {
            log(`[room ${roomId}] [user ${userId}]: disconnected`);
            Server.removeListener(roomId, userId);
            connected = false;
        });
        ws.on('error', (err) => {
            log(`[room ${roomId}] [user ${userId}]: ERROR [ws]: ${err}`);
        });
    });
    wsServer.on('error', (err) => {
        log(`ERROR [wsServer]: ${err}`);
    });
} catch (err) {
    console.error(err);
}