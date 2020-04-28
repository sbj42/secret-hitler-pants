import * as Interface from './state';

export function getVoteCount(state: Interface.ServerState) {
    return state.game.players.filter((p) => p.voted).length;
}

export function enumerateUsers(users: Interface.UserMap) {
    return Object.values(users);
}

export function getUser(state: Interface.ServerState, userId: Interface.UserId) {
    const user = state.users[userId];
    if (!user) {
        throw new Error(`invalid user id ${userId}`);
    }
    return user;
}

export function getPlayer(state: Interface.ServerState, playerNum: Interface.PlayerNum) {
    if (state.game.phase === 'pregame') {
        throw new Error(`invalid game phase (game not started)`);
    }
    const player = state.game.players[playerNum];
    if (!player) {
        throw new Error(`invalid player number ${playerNum}`);
    }
    return player;
}

export function getPlayerName(state: Interface.ServerState, player: Interface.Player) {
    return getUser(state, player.userId).name;
}

export function getPlayerSecrets(state: Interface.ServerState, player: Interface.Player) {
    const secrets = state.playerSecrets[player.playerNum];
    if (!secrets) {
        throw new Error(`[bug] missing player secrets`);
    }
    return secrets;
}

export function getUserPlayer(state: Interface.ServerState, user: Interface.User) {
    const {playerNum} = user;
    if (typeof(playerNum) === 'undefined') {
        throw new Error(`user ${user.userId} is not a player`);
    }
    return getPlayer(state, playerNum);
}

export function getPresidentPlayer(state: Interface.ServerState) {
    if (state.game.phase === 'pregame') {
        throw new Error(`invalid game phase (game not playing)`);
    }
    return state.game.players[state.game.presidentNum];
}

export function getPresidentName(state: Interface.ServerState) {
    return getUser(state, getPresidentPlayer(state).userId).name;
}

export function getChancellorPlayer(state: Interface.ServerState) {
    if (state.game.phase === 'pregame') {
        throw new Error(`invalid game phase (game not playing)`);
    }
    if (typeof(state.game.chancellorNum) === 'undefined') {
        throw new Error(`[bug] no chancellor`);
    }
    return state.game.players[state.game.chancellorNum];
}

export function getChancellorName(state: Interface.ServerState) {
    return getUser(state, getChancellorPlayer(state).userId).name;
}

export function getPlayersRemaining(players: Interface.Player[]) {
    return players.filter((p) => !p.isExecuted).length;
}

export function getChancellorIsHitler(state: Interface.ServerState) {
    return getPlayerSecrets(state, getChancellorPlayer(state)).isHitler;
}

export function compareUsersByName(a: Interface.User, b: Interface.User) {
    const an = a.name || a.userId;
    const bn = b.name || b.userId;
    if (an < bn) return -1;
    if (bn < an) return 1;
    return 0;
}