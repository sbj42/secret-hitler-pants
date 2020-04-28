import * as Game from '.';
import * as Interface from '../interface';

describe('game/', () => {
    test('new-user', () => {
        const state = Game.createServerState('room', 'test');
        const user1 = Game.newUser(state);
        expect(Object.keys(state.users)).toEqual([user1]);
        expect(state.users[user1].status).toBe('not ready');
        expect(state.users[user1].playerNum).toBeUndefined();
        expect(state.users[user1].userId).toBe(user1);
        expect(state.users[user1].connected).toBe(false);
        expect(state.users[user1].name).toBe('');
        expect(state.game.phase).toBe('pregame');
    });
    test('new-user-not-connected-message', () => {
        const state = Game.createServerState('room', 'test');
        const user1 = Game.newUser(state);
        expect(() => Game.processMessage(state, user1, { type: 'user-set-name', name: 'A' })).toThrowError();
    });
    test('user-set-name', () => {
        const state = Game.createServerState('room', 'test');
        const user1 = Game.newUser(state);
        state.users[user1].connected = true;
        Game.processMessage(state, user1, { type: 'user-set-name', name: 'A' });
        expect(state.users[user1].name).toBe('A');
    });
    test('user-set-ready', () => {
        const state = Game.createServerState('room', 'test');
        const user1 = Game.newUser(state);
        state.users[user1].connected = true;
        Game.processMessage(state, user1, { type: 'user-set-name', name: 'A' });
        Game.processMessage(state, user1, { type: 'user-set-status', status: 'ready' });
        expect(state.users[user1].status).toBe('ready');
    });
    test('user-set-ready-before-name', () => {
        const state = Game.createServerState('room', 'test');
        const user1 = Game.newUser(state);
        state.users[user1].connected = true;
        expect(() => Game.processMessage(state, user1, { type: 'user-set-status', status: 'ready' })).toThrowError();
        expect(state.users[user1].status).toBe('not ready');
    });
    test('user-set-name-after-ready', () => {
        const state = Game.createServerState('room', 'test');
        const user1 = Game.newUser(state);
        state.users[user1].connected = true;
        Game.processMessage(state, user1, { type: 'user-set-name', name: 'A' });
        Game.processMessage(state, user1, { type: 'user-set-status', status: 'ready' });
        expect(() => Game.processMessage(state, user1, { type: 'user-set-name', name: 'B' })).toThrowError();
        expect(state.users[user1].name).toBe('A');
    });
    test('user-set-name-dup', () => {
        const state = Game.createServerState('room', 'test');
        const user1 = Game.newUser(state);
        const user2 = Game.newUser(state);
        state.users[user1].connected = true;
        state.users[user2].connected = true;
        Game.processMessage(state, user1, { type: 'user-set-name', name: 'A' });
        expect(() => Game.processMessage(state, user2, { type: 'user-set-name', name: 'A' })).toThrowError();
        expect(state.users[user2].name).toBe('');
    });
    const makeGame5 = () => {
        const state = Game.createServerState('room', 'test');
        const user1 = Game.newUser(state);
        const user2 = Game.newUser(state);
        const user3 = Game.newUser(state);
        const user4 = Game.newUser(state);
        const user5 = Game.newUser(state);
        state.users[user1].connected = true;
        state.users[user2].connected = true;
        state.users[user3].connected = true;
        state.users[user4].connected = true;
        state.users[user5].connected = true;
        Game.processMessage(state, user1, { type: 'user-set-name', name: 'A' });
        Game.processMessage(state, user2, { type: 'user-set-name', name: 'B' });
        Game.processMessage(state, user3, { type: 'user-set-name', name: 'C' });
        Game.processMessage(state, user4, { type: 'user-set-name', name: 'D' });
        Game.processMessage(state, user5, { type: 'user-set-name', name: 'E' });
        Game.processMessage(state, user1, { type: 'user-set-status', status: 'ready' });
        Game.processMessage(state, user2, { type: 'user-set-status', status: 'ready' });
        Game.processMessage(state, user3, { type: 'user-set-status', status: 'ready' });
        Game.processMessage(state, user4, { type: 'user-set-status', status: 'ready' });
        expect(state.game.phase).toBe('pregame');
        Game.processMessage(state, user5, { type: 'user-set-status', status: 'ready' });
        expect(state.game.players).toHaveLength(5);
        return {state};
    };
    test('game-5', () => {
        const {state} = makeGame5();
        expect(state.game.phase).toBe('president-choose-chancellor');
        expect(state.game.presidentNum).toBe(0);
        expect(state.game.players).toHaveLength(5);
        expect(state.playerSecrets).toHaveLength(5);
        expect(state.game.electionTracker).toBe(0);
        expect(state.game.policiesEnacted.fascist).toBe(0);
        expect(state.game.policiesEnacted.liberal).toBe(0);
        expect(state.gameSecrets.policyDeck.slice(0, 5)).toEqual(['liberal', 'liberal', 'fascist', 'liberal', 'fascist']);
    });
    test('game-5-choose-chancellor', () => {
        const {state} = makeGame5();
        Game.processMessage(state, Interface.getPresidentPlayer(state).userId, { type: 'president-choose-chancellor', chancellorNum: 3 });
        expect(state.game.phase).toBe('players-vote');
        expect(state.game.chancellorNum).toBe(3);
    });
    test('game-5-choose-chancellor-not-yourself', () => {
        const {state} = makeGame5();
        expect(() => Game.processMessage(state, Interface.getPresidentPlayer(state).userId, { type: 'president-choose-chancellor', chancellorNum: 0 })).toThrowError();
        expect(state.game.phase).toBe('president-choose-chancellor');
    });
    const vote5 = (state: Interface.ServerState, v1: Interface.Vote, v2: Interface.Vote, v3: Interface.Vote, v4: Interface.Vote, v5: Interface.Vote) => {
        Game.processMessage(state, state.game.players[0].userId, { type: 'player-vote', vote: v1 });
        Game.processMessage(state, state.game.players[1].userId, { type: 'player-vote', vote: v2 });
        Game.processMessage(state, state.game.players[2].userId, { type: 'player-vote', vote: v3 });
        Game.processMessage(state, state.game.players[3].userId, { type: 'player-vote', vote: v4 });
        Game.processMessage(state, state.game.players[4].userId, { type: 'player-vote', vote: v5 });
    };
    test('game-5-vote-ja', () => {
        const {state} = makeGame5();
        Game.processMessage(state, Interface.getPresidentPlayer(state).userId, { type: 'president-choose-chancellor', chancellorNum: 3 });
        vote5(state, 'ja', 'ja', 'ja', 'nein', 'nein');
        expect(state.game.phase).toBe('president-set-agenda');
        expect(state.playerSecrets[state.game.presidentNum].cards).toEqual(['liberal', 'liberal', 'fascist']);
    });
    test('game-5-vote-nein', () => {
        const {state} = makeGame5();
        Game.processMessage(state, Interface.getPresidentPlayer(state).userId, { type: 'president-choose-chancellor', chancellorNum: 3 });
        vote5(state, 'ja', 'ja', 'nein', 'nein', 'nein');
        expect(state.game.presidentNum).toBe(1);
        expect(state.game.electionTracker).toBe(1);
        expect(state.game.phase).toBe('president-choose-chancellor');
    });
    test('game-5-vote-nein-x3', () => {
        const {state} = makeGame5();
        Game.processMessage(state, Interface.getPresidentPlayer(state).userId, { type: 'president-choose-chancellor', chancellorNum: 3 });
        vote5(state, 'ja', 'ja', 'nein', 'nein', 'nein');
        Game.processMessage(state, Interface.getPresidentPlayer(state).userId, { type: 'president-choose-chancellor', chancellorNum: 0 });
        vote5(state, 'ja', 'ja', 'nein', 'nein', 'nein');
        Game.processMessage(state, Interface.getPresidentPlayer(state).userId, { type: 'president-choose-chancellor', chancellorNum: 1 });
        vote5(state, 'ja', 'ja', 'nein', 'nein', 'nein');
        expect(state.game.presidentNum).toBe(3);
        expect(state.game.electionTracker).toBe(0);
        expect(state.game.policiesEnacted.fascist).toBe(0);
        expect(state.game.policiesEnacted.liberal).toBe(1);
        expect(state.game.phase).toBe('president-choose-chancellor');
    });
    test('game-5-president-set-agenda', () => {
        const {state} = makeGame5();
        Game.processMessage(state, Interface.getPresidentPlayer(state).userId, { type: 'president-choose-chancellor', chancellorNum: 3 });
        vote5(state, 'ja', 'ja', 'ja', 'nein', 'nein');
        Game.processMessage(state, Interface.getPresidentPlayer(state).userId, { type: 'president-set-agenda', discardPolicy: 'liberal' });
        expect(state.game.phase).toBe('chancellor-enact-policy');
        expect(state.playerSecrets[state.game.presidentNum].cards).toEqual([]);
        expect(state.playerSecrets[state.game.chancellorNum as number].cards).toEqual(['liberal', 'fascist']);
    });
});