import * as Interface from './interface';
import * as Game from './game';
import { log } from './log';

const AUTO_READY = +(process.env.AUTO_READY || '0');
const AUTO_JA = process.env.AUTO_JA;

const IDLE_ROOM_TIMEOUT = 1000 * 60 * 60 * 24 * 2;

const ROOMS: {
    [roomId: string]: {
        roomId: string;
        start: Date;
        active: Date;
        state: Interface.ServerState;
        completeGames: number;
        listeners: {
            [userId: string]: Listener | undefined;
        };
    };
} = {};

export type Listener = (message: Interface.ServerMessage, forAll: boolean) => void;

function dropIdleRooms() {
    const now = new Date();
    Object.values(ROOMS).filter((r) => (
        now.getTime() - r.active.getTime() > IDLE_ROOM_TIMEOUT
        && Object.values(r.listeners).length === 0
    )).forEach((r) => delete ROOMS[r.roomId]);
}

function getRoom(roomId: string) {
    const room = ROOMS[roomId];
    if (!room) {
        throw new Error(`no such room: ${roomId}`);
    }
    room.active = new Date();
    return room;
}

export function getAdminData() {
    return {
        rooms: [...Object.values(ROOMS).map((r) => ({
            roomId: r.roomId,
            start: r.start,
            active: r.active,
            round: r.state.game.round,
            phase: r.state.game.phase,
            users: Object.keys(r.listeners).length,
            players: r.state.playerSecrets.length,
            completeGames: r.completeGames,
        }))],
    };
}

function getOrCreateRoom(roomId: string) {
    if (!ROOMS[roomId]) {
        dropIdleRooms();
        const now = new Date();
        ROOMS[roomId] = {
            roomId,
            start: now,
            active: now,
            completeGames: 0,
            state: Game.createServerState(roomId),
            listeners: {},
        };
    }
    return getRoom(roomId);
}

export function emit(roomId: string, message: Interface.ServerMessage) {
    const room = getRoom(roomId);
    log(`[room ${roomId}] [all]: sending "${message.type}" ${JSON.stringify(message)}`);
    for (const listener of Object.values(room.listeners)) {
        if (listener) {
            listener(message, true);
        }
    }
}

export function onMessage(roomId: string, userId: Interface.UserId, message: Interface.ClientMessage) {
    const room = getRoom(roomId);
    const outMessage = Game.processMessage(room.state, userId, message);
    emit(roomId, outMessage);
    if (outMessage.type === 'game-over') {
        room.completeGames ++;
    }
    if (outMessage.type === 'president-chose-chancellor' && AUTO_JA) {
        const room = getRoom(roomId);
        Interface.enumerateUsers(room.state.users).filter((u) => u.connected && typeof(u.playerNum) !== 'undefined' && !Interface.getUserPlayer(room.state, u).isExecuted).forEach((u) => {
            onMessage(roomId, u.userId, { 'type': 'player-vote', vote: 'ja' });
        });
    }
}

export function addListener(roomId: string, userId: Interface.UserId, listener: Listener) {
    const room = getRoom(roomId);
    if (!room.state.users[userId].connected) {
        log(`[room ${roomId}] [user ${userId}]: connected`);
        room.state.users[userId].connected = true;
        if (room.state.game.phase === 'pregame') {
            room.state.users[userId].status = 'not ready';
        }
        emit(roomId, { type: 'user-connect', userId });
        if (AUTO_READY && room.state.game.phase === 'pregame') {
            const connectedUsers = Interface.enumerateUsers(room.state.users).filter((u) => u.connected && u.name && u.status !== 'spectator');
            if (connectedUsers.length == AUTO_READY) {
                connectedUsers.forEach((user) => {
                    onMessage(roomId, user.userId, { type: 'user-set-status', status: 'ready' });
                });
            }
        }
    }
    room.listeners[userId] = listener;
}

export function removeListener(roomId: string, userId: Interface.UserId) {
    const room = getRoom(roomId);
    delete room.listeners[userId];
    room.state.users[userId].connected = false;
    emit(roomId, { type: 'user-disconnect', userId });
}

export function getClientState(roomId: string, userId: Interface.UserId) {
    const room = getRoom(roomId);
    const playerNum = Interface.getUser(room.state, userId).playerNum;
    const state: Interface.ClientState = {
        roomId,
        users: room.state.users,
        game: room.state.game,

        userId,
        playerNum,
        playerSecrets: typeof(playerNum) !== 'undefined' ? room.state.playerSecrets[playerNum] : undefined,
    };
    return state;
}

export function newUser(roomId: string) {
    const room = getOrCreateRoom(roomId);
    const userId = Game.newUser(room.state);
    emit(roomId, { type: 'new-user', userId });
    return userId;
}