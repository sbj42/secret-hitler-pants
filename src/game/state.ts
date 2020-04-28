import * as Interface from '../interface';
import { log } from '../log';
import { shuffle, RNG, randomHexString } from '../util';
import seedrandom from 'seedrandom';

const AUTO_NAME = !!process.env.AUTO_NAME;
const AUTO_SEED = process.env.AUTO_SEED;

const AUTO_NAME_ADJ = ['Awesome', 'Better', 'Cute', 'Daring', 'Elegant', 'Fun', 'Great', 'Happy', 'Icky', 'Jaunty'];
const AUTO_NAME_NOUN = ['Ardvark', 'Bear', 'Cobra', 'Dingo', 'Eagle', 'Frog', 'Giraffe', 'Hippo', 'Ibex', 'Jaguar'];

const UID_SIZE = 4;
const SEED_SIZE = 8;

export function randomUserId() {
    return randomHexString(UID_SIZE) as Interface.UserId;
}

function randomSeedString() {
    return randomHexString(SEED_SIZE);
}

function makeTeams(players: Interface.Player[], rng: RNG) {
    const shuffled = shuffle(players, rng); // randomize to split into teams
    const numFascists = Interface.NUM_FASCISTS_MAP[players.length];
    const fascists = shuffled.slice(0, numFascists);
    const liberals = shuffled.slice(numFascists);
    return { fascists, liberals };
}

function drawOne(state: Interface.ServerState) {
    const card = state.gameSecrets.policyDeck.shift();
    state.game.policyCards = state.gameSecrets.policyDeck.length;
    return card as Interface.Loyalty;
}

function drawThree(state: Interface.ServerState) {
    return [drawOne(state), drawOne(state), drawOne(state)];
}

function topDeck(state: Interface.ServerState, cards: Interface.Cards) {
    state.gameSecrets.policyDeck = cards.concat(state.gameSecrets.policyDeck);
    state.game.policyCards = state.gameSecrets.policyDeck.length;
}

interface LogEntryFunc {
    (text: string): LogEntryFunc;
    (style: Interface.Style, text: string): LogEntryFunc;
}

function logEntry(state: Interface.ServerState): LogEntryFunc {
    const entry: Interface.LogEntry = [];
    state.game.log.push(entry);
    const ret: LogEntryFunc = (arg1: string | Interface.Style, arg2?: string) => {
        if (typeof(arg2) === 'string') {
            entry.push({ style: arg1 as Interface.Style, text: arg2 });
        } else {
            entry.push(arg1);
        }
        return ret;
    };
    return ret;
}

function refreshDeck(state: Interface.ServerState) {
    const deck = state.gameSecrets.policyDeck;
    const discard = state.gameSecrets.policyDiscard;
    if (deck.length < 3) {
        state.gameSecrets.policyDeck = shuffle(discard.concat(deck), state.gameSecrets.rng);
        state.game.policyCards = state.gameSecrets.policyDeck.length;
        state.gameSecrets.policyDiscard = [];
        logEntry(state)(`The policy cards have been reshuffled.`);
    }
}

function enact(state: Interface.ServerState, policy: Interface.Loyalty) {
    if (policy === 'liberal') {
        state.game.policiesEnacted.liberal ++;
    } else {
        state.game.policiesEnacted.fascist ++;
    }
}

function setPhase(state: Interface.ServerState, phase: Interface.Phase) {
    state.game.phase = phase;
    log('  phase=' + phase);
    if (phase === 'game-over') {
        Object.values(state.users).forEach((u) => {
            u.status = 'not ready';
            u.playerNum = undefined;
        });
    }
}

function checkPhases(state: Interface.ServerState, phases: Interface.Phase[]) {
    if (phases.indexOf(state.game.phase) < 0) {
        throw new Error(`invalid game phase (expecting ${phases.map((p) => `'${p}'`).join(' or ')}, got '${state.game.phase}')`);
    }
}

function checkPhase(state: Interface.ServerState, phase: Interface.Phase) {
    return checkPhases(state, [phase]);
}

function createGame(): Interface.Game {
    return {
        players: [],
        phase: 'pregame',
        round: 0,
        lastPresidentNum: undefined,
        lastChancellorNum: undefined,
        specialElectionReturn: undefined,
        presidentNum: 0,
        chancellorNum: undefined,
        electionTracker: 0,
        policyCards: 0,
        policiesEnacted: {
            liberal: 0,
            fascist: 0,
        },
        log: [],
    };
}

function createGameSecrets(nextSeed?: string, seed?: string): Interface.GameSecrets {
    if (!seed) {
        seed = AUTO_SEED || randomSeedString();
    }
    return {
        seed,
        nextSeed,
        policyDeck: [],
        policyDiscard: [],
        rng: seedrandom(seed),
    };
}

export function createServerState(roomId: string, nextSeed?: string): Interface.ServerState {
    return {
        roomId,
        users: {},
        game: createGame(),

        gameSecrets: createGameSecrets(nextSeed),
        playerSecrets: [],
    };
}

function resetServerStateForNewGame(state: Interface.ServerState) {
    state.game = createGame();
    state.gameSecrets = createGameSecrets(undefined, state.gameSecrets.nextSeed);
    state.playerSecrets = [];
}

function createUser(userId: Interface.UserId, phase: Interface.Phase): Interface.User {
    return {
        userId,
        connected: false,
        name: '',
        status: phase === 'pregame' ? 'not ready' : 'spectator',
        playerNum: undefined,
    };
}

export function newUser(state: Interface.ServerState) {
    let userId: Interface.UserId;
    for (;;) {
        userId = randomUserId();
        if (!state.users[userId]) {
            break;
        }
    }
    const user = createUser(userId, state.game.phase);
    if (AUTO_NAME) {
        let name: string;
        do {
            const a = AUTO_NAME_ADJ[Math.floor(Math.random() * AUTO_NAME_ADJ.length)];
            const n = AUTO_NAME_NOUN[Math.floor(Math.random() * AUTO_NAME_NOUN.length)];
            name = a + ' ' + n;
        } while (Object.values(state.users).findIndex((u) => u.name === name) >= 0);
        user.name = name;
    }
    state.users[userId] = user;
    return userId;
}

function createDeck(rng: RNG) {
    const deck: Interface.Cards = [];
    for (let i = 0; i < Interface.NUM_LIBERAL_POLICIES; i ++) {
        deck.push('liberal');
    }
    for (let i = 0; i < Interface.NUM_FASCIST_POLICIES; i ++) {
        deck.push('fascist');
    }
    return shuffle(deck, rng);
}

function createPlayer(playerNum: Interface.PlayerNum, userId: Interface.UserId): Interface.Player {
    return {
        playerNum,
        userId,
        voted: false,
        isExecuted: false,
        isInvestigated: false,
    };
}

function createPlayerSecrets(): Interface.PlayerSecrets {
    return {
        isHitler: false,
        loyalty: 'liberal',
        knownHitlerNum: undefined,
        knownFascistNums: [],
        vote: undefined,
        cards: [],
        investigation: undefined,
    };
}

// User [userId] changes their name
function doUserChangeName(user: Interface.User, name: string): Interface.ServerUserChangedName {
    user.name = name;
    return { type: 'user-changed-name', userId: user.userId };
}

// User [userId] takes over for disconnected user [oldUser]
// They inherit the properties of that user, but keep their own userId
// If that user had a player, the player is reassigned
// If the game hasn't started yet, the user is marked as not ready
// TODO: should this only be allowed for disconnected players?
// TODO: should there be a timeout?
function doUserTakeover(state: Interface.ServerState, user: Interface.User, name: string, oldUser: Interface.User): Interface.ServerUserTakeover {
    const {userId} = user;
    const {playerNum} = oldUser;
    if (typeof(playerNum) !== 'undefined') {
        Interface.getPlayer(state, playerNum).userId = userId;
        oldUser.playerNum = undefined;
    }
    const newUser = state.users[userId] = { ...oldUser, userId, name, connected: true };
    if (state.game.phase === 'pregame') {
        newUser.status = 'not ready';
    }
    oldUser.name = '';
    return { type: 'user-takeover', userId, oldUserId: oldUser.userId, playerNum };
}

// A user changes their ready status
function doUserSetReady(user: Interface.User, status: Interface.Status): Interface.ServerUserSetStatus {
    const {userId} = user;
    user.status = status;
    return { type: 'user-set-status', userId };
}

// The game starts
// Players are shuffled
// Loyalties are assigned
function doGameStart(state: Interface.ServerState, playerUsers: Interface.User[], cause: Interface.ServerUserSetStatus): Interface.ServerGameStarted {
    resetServerStateForNewGame(state);

    const numPlayers = playerUsers.length;
    log(`[room ${state.roomId}] starting a ${numPlayers}-player game`);
    playerUsers = shuffle(playerUsers, Math.random); // randomize player order
    log(`[room ${state.roomId}]   players: ${playerUsers.map((u) => u.userId + '(' + u.name + ')').join(' ')}`);
    
    state.game.players = playerUsers.map((user, playerNum) => createPlayer(playerNum, user.userId));
    state.game.players.forEach((player) => Interface.getUser(state, player.userId).playerNum = player.playerNum);
    
    log(`[room ${state.roomId}]   seed: ${state.gameSecrets.seed}`);

    const { fascists, liberals } = makeTeams(state.game.players, state.gameSecrets.rng);
    log(`[room ${state.roomId}]   hitler: ${fascists[0].playerNum}`);
    log(`[room ${state.roomId}]   fascists: ${fascists.slice(1).map((p) => p.playerNum).join(' ')}`);
    log(`[room ${state.roomId}]   liberals: ${liberals.map((p) => p.playerNum).join(' ')}`);

    state.playerSecrets = state.game.players.map(() => createPlayerSecrets());

    fascists.slice(1).forEach((player) => {
        const secrets = Interface.getPlayerSecrets(state, player);
        secrets.loyalty = 'fascist';
        secrets.knownHitlerNum = fascists[0].playerNum;
        secrets.knownFascistNums = fascists.slice(1).filter((p) => p.playerNum !== player.playerNum).map((p) => p.playerNum);
    });
    
    const hitlerSecrets = Interface.getPlayerSecrets(state, fascists[0]);
    hitlerSecrets.loyalty = 'fascist';
    hitlerSecrets.isHitler = true;
    if (Interface.HITLER_KNOWS_MAP[numPlayers]) {
        hitlerSecrets.knownFascistNums = fascists.filter((p) => p.playerNum !== fascists[0].playerNum).map((p) => p.playerNum);
    }

    state.gameSecrets.policyDeck = createDeck(state.gameSecrets.rng);
    state.game.policyCards = state.gameSecrets.policyDeck.length;
    state.game.round = 0;
    state.game.log = [];
    return { type: 'game-started', cause };
}

// The presidential candidate chooses a chancellor candidate
// This triggers the beginning of the election: player votes are reset just in case
function doPresidentChooseChancellor(state: Interface.ServerState, user: Interface.User, chancellorNum: Interface.PlayerNum): Interface.ServerPresidentChoseChancellor {
    state.game.chancellorNum = chancellorNum;
    state.game.players.forEach((p) => p.voted = false);
    state.playerSecrets.forEach((p) => p.vote = undefined);
    log('presidential candidate chose chancellor candidate ' + state.game.chancellorNum);
    setPhase(state, 'players-vote');
    logEntry(state)(`${user.name} has chosen ${Interface.getChancellorName(state)} as the Chancellor Candidate.`);
    return { type: 'president-chose-chancellor', chancellorNum: chancellorNum };
}

function doPlayerVote(state: Interface.ServerState, player: Interface.Player, vote: Interface.Vote): Interface.ServerPlayerVoted {
    const {playerNum} = player;
    player.voted = true;
    Interface.getPlayerSecrets(state, player).vote = vote;
    return { type: 'player-voted', playerNum };
}

function doElection(state: Interface.ServerState, cause: Interface.ServerPlayerVoted): Interface.ServerElectionJa | Interface.ServerElectionNein {
    const jas = state.game.players.filter((p) => !p.isExecuted && Interface.getPlayerSecrets(state, p).vote === 'ja');
    const neins = state.game.players.filter((p) => !p.isExecuted && Interface.getPlayerSecrets(state, p).vote === 'nein');
    log('election complete');
    log(`[room ${state.roomId}]   ja:   ${jas.map((p) => p.playerNum).join(' ')}`);
    log(`[room ${state.roomId}]   nein: ${neins.map((p) => p.playerNum).join(' ')}`);
    if (jas.length === 0) {
        logEntry(state)(`Everyone voted NEIN!`);
    } else if (neins.length === 0) {
        logEntry(state)(`Everyone voted JA.`);
    } else {
        logEntry(state)(`Voting JA: ${jas.map((p) => Interface.getPlayerName(state, p)).join(', ')}`);
        logEntry(state)(`Voting NEIN: ${neins.map((p) => Interface.getPlayerName(state, p)).join(', ')}`);
    }
    state.game.players.forEach((p) => p.voted = false);
    state.playerSecrets.forEach((p) => p.vote = undefined);
    if (jas.length > neins.length) {
        log('  government elected');
        logEntry(state)('important', `${Interface.getPresidentName(state)} has been elected President, with ${Interface.getChancellorName(state)} as Chancellor.`);
        state.game.lastPresidentNum = state.game.presidentNum;
        state.game.lastChancellorNum = state.game.chancellorNum;
        return { type: 'election-ja', cause };
    } else {
        log('  election failed');
        state.game.electionTracker ++;
        logEntry(state)('important', `The vote has failed.  The election tracker has moved to ${state.game.electionTracker}.`);
        return { type: 'election-nein', cause };
    }
}

function doFascistsWinByElection(state: Interface.ServerState, cause: Interface.ServerElectionJa): Interface.ServerGameOver {
    log('  hitler was elected chancellor after 3 fascist policies: the fascists win');
    logEntry(state)('fascist', `${Interface.getChancellorName(state)} is Hitler`)(` and has been elected Chancellor after at least 3 fascist policies were enacted.`);
    logEntry(state)('important', `The FASCISTS win`);
    setPhase(state, 'game-over');
    return { type: 'game-over', winners: 'fascist', cause };
}

function doPresidentDrawsPolicies(state: Interface.ServerState, cause: Interface.ServerElectionJa): Interface.ServerElectionJa {
    if (state.game.policiesEnacted.fascist >= Interface.MIN_FASCIST_POLICIES_FOR_FASCIST_ELECTION_WIN) {
        logEntry(state)(`Chancellor `)('liberal', `${Interface.getChancellorName(state)} is not Hitler`)(` (revealed because at least 3 fascist policies have been enacted).`);
    }
    const cards = drawThree(state);
    log(`[room ${state.roomId}]   president drew: ${cards.join(' ')}`);
    Interface.getPlayerSecrets(state, Interface.getPresidentPlayer(state)).cards =  cards;
    logEntry(state)(`President ${Interface.getPresidentName(state)} has drawn three policy cards.`);
    setPhase(state, 'president-set-agenda');
    if (state.game.policiesEnacted.fascist >= Interface.MIN_FASCIST_POLICIES_FOR_FASCIST_ELECTION_WIN) {
        return { ...cause, chancellorNotHitler: true };
    } else {
        return cause;
    }
}

function doChaos(state: Interface.ServerState, cause: Interface.ServerElectionNein | Interface.ServerPresidentAcceptedVeto): Interface.ServerChaos {
    const policy = drawOne(state);
    enact(state, policy);
    refreshDeck(state);
    state.game.electionTracker = 0;
    logEntry(state)(`The country has been thrown into chaos.  `)(policy, `A ${policy} policy has been drawn and enacted.`)(`  The election tracker has been reset to 0.`);
    log('  country thrown into chaos: ' + policy + ' policy enacted');
    if (policy === 'fascist') {
        const power = (Interface.PRESIDENTIAL_POWERS_MAP[state.game.players.length] || [])[state.game.policiesEnacted.fascist];
        if (power) {
            log('  presidential power skipped');
            logEntry(state)(`Due to the chaos, the presidential power (${power}) has been skipped.`);
        }
    }
    state.game.lastChancellorNum = undefined;
    state.game.lastPresidentNum = undefined;
    return { type: 'chaos', policy, cause };
}

function doTeamWinsByPolicies(state: Interface.ServerState, cause: Interface.ServerChaos | Interface.ServerChancellorEnactedPolicy): Interface.ServerGameOver {
    setPhase(state, 'game-over');
    if (cause.policy === 'liberal') {
        logEntry(state)('liberal', `${state.game.policiesEnacted.liberal} liberal policies have been enacted.`);
        logEntry(state)('important', `The LIBERALS win!`);
    } else {
        log(`[room ${state.roomId}]   that's enough fascist policies, the fascists win`);
        logEntry(state)('fascist', `${state.game.policiesEnacted.fascist} fascist policies have been enacted.`);
        logEntry(state)('important', `The FACSISTS win!`);
    }
    return { type: 'game-over', winners: cause.policy, cause };
}

function doRoundStart(state: Interface.ServerState, cause: Interface.ServerGameStarted | Interface.ServerChaos | Interface.ServerElectionNein | Interface.ServerChancellorEnactedPolicy | Interface.ServerPresidentInvestigationComplete | Interface.ServerPresidentPolicyPeekComplete | Interface.ServerPresidentExecutedPlayer | Interface.ServerPresidentCalledSpecialElection | Interface.ServerPresidentAcceptedVeto): Interface.ServerRoundStarted {
    setPhase(state, 'president-choose-chancellor');
    state.game.round ++;
    logEntry(state)(`Round #${state.game.round} has begun.`);
    if (state.game.round === 1) {
        state.game.presidentNum = 0;
        log(`[room ${state.roomId}]   first presidential candidate is ${state.game.presidentNum}`);
        logEntry(state)(`${Interface.getPresidentName(state)} is the first Presidential Candidate.`);
    } else {
        if (typeof(state.game.specialElectionReturn) !== 'undefined') {
            state.game.presidentNum = state.game.specialElectionReturn;
            state.game.specialElectionReturn = undefined;
        }
        do {
            state.game.presidentNum = (state.game.presidentNum + 1) % state.game.players.length;
        } while (Interface.getPresidentPlayer(state).isExecuted);
        log('  next presidential candidate is ' + state.game.presidentNum);
        logEntry(state)(`${Interface.getPresidentName(state)} is the next Presidential Candidate.`);
    }
    state.game.chancellorNum = undefined;
    setPhase(state, 'president-choose-chancellor');
    return { type: 'round-started', cause };
}

function doPresidentSetAgenda(state: Interface.ServerState, discardPolicy: Interface.Loyalty): Interface.ServerPresidentSetAgenda {
    const secrets = Interface.getPlayerSecrets(state, Interface.getPresidentPlayer(state));
    const {cards} = secrets;
    const index = cards.indexOf(discardPolicy);
    if (index < 0) {
        throw new Error(`there are no ${discardPolicy} policy cards to discard`);
    }
    cards.splice(index, 1);
    state.gameSecrets.policyDiscard.push(discardPolicy);
    log('president passed [' +  cards.join(', ') + '] to chancellor');
    Interface.getPlayerSecrets(state, Interface.getChancellorPlayer(state)).cards = cards;
    secrets.cards = [];
    logEntry(state)(`President ${Interface.getPresidentName(state)} has passed two policies to Chancellor ${Interface.getChancellorName(state)}.`);
    if (state.game.policiesEnacted.fascist >= Interface.MIN_FASCIST_POLICIES_FOR_VETO) {
        setPhase(state, 'chancellor-consider-veto');
    } else {
        setPhase(state, 'chancellor-enact-policy');
    }
    return { type: 'president-set-agenda', vetoActive: state.game.policiesEnacted.fascist >= Interface.MIN_FASCIST_POLICIES_FOR_VETO };
}

function doChancellorProposeVeto(state: Interface.ServerState): Interface.ServerChancellorProposedVeto {
    const secrets = Interface.getPlayerSecrets(state, Interface.getChancellorPlayer(state));
    const {cards} = secrets;
    log('chancellor proposed veto');
    logEntry(state)(`Chancellor ${Interface.getChancellorName(state)} has proposed a veto.`);
    Interface.getPlayerSecrets(state, Interface.getPresidentPlayer(state)).cards = cards;
    secrets.cards = [];
    setPhase(state, 'president-consider-veto');
    return { type: 'chancellor-proposed-veto' };
}

function doChancellorRejectVeto(state: Interface.ServerState): Interface.ServerChancellorRejectedVeto {
    log('chancellor rejected veto');
    logEntry(state)(`Chancellor ${Interface.getChancellorName(state)} has decided not to veto this agenda.`);
    setPhase(state, 'chancellor-enact-policy');
    return { type: 'chancellor-rejected-veto' };
}

function doPresidentAcceptVeto(state: Interface.ServerState): Interface.ServerPresidentAcceptedVeto {
    const secrets = Interface.getPlayerSecrets(state, Interface.getPresidentPlayer(state));
    const {cards} = secrets;
    log('chancellor proposed veto');
    log('president accepted veto');
    logEntry(state)(`President ${Interface.getPresidentName(state)} has accepted the veto.`);
    state.gameSecrets.policyDiscard.push(...cards);
    refreshDeck(state);
    state.game.electionTracker ++;
    logEntry(state)('important', `The government has vetoed this agenda.`)(`  The election tracker has moved to ${state.game.electionTracker}.`);
    return { type: 'president-accepted-veto' };
}

function doPresidentRejectVeto(state: Interface.ServerState): Interface.ServerPresidentRejectedVeto {
    const secrets = Interface.getPlayerSecrets(state, Interface.getPresidentPlayer(state));
    const {cards} = secrets;
    log('president rejected veto');
    logEntry(state)(`President ${Interface.getPresidentName(state)} has rejected the veto.`);
    Interface.getPlayerSecrets(state, Interface.getChancellorPlayer(state)).cards = cards;
    secrets.cards = [];
    setPhase(state, 'chancellor-enact-policy');
    return { type: 'president-rejected-veto' };
}

function doChancellorEnactPolicy(state: Interface.ServerState, enactPolicy: Interface.Loyalty): Interface.ServerChancellorEnactedPolicy {
    const secrets = Interface.getPlayerSecrets(state, Interface.getChancellorPlayer(state));
    const {cards} = secrets;
    const index = cards.indexOf(enactPolicy);
    if (index < 0) {
        throw new Error(`there are no ${enactPolicy} policy cards to enact`);
    }
    cards.splice(index, 1);
    state.gameSecrets.policyDiscard.push(...cards);
    log('chancellor enacted a ' + enactPolicy + ' policy');
    secrets.cards = [];
    logEntry(state)(`Chancellor ${Interface.getChancellorName(state)} `)(enactPolicy, `has enacted a ${enactPolicy} policy`)(`.`);
    refreshDeck(state);
    enact(state, enactPolicy);
    return { type: 'chancellor-enacted-policy', policy: enactPolicy };
}

function doTriggerPower(state: Interface.ServerState, power: Interface.Power, cause: Interface.ServerChancellorEnactedPolicy): Interface.ServerChancellorEnactedPolicy {
    if (power === 'investigate-loyalty') {
        logEntry(state)(`President ${Interface.getPresidentName(state)} must now investigate someone's loyalty.`);
        setPhase(state, 'president-investigate-player');
    } else if (power === 'policy-peek') {
        const cards = drawThree(state);
        log('  president drew: ' +  cards.join(' '));
        Interface.getPlayerSecrets(state, Interface.getPresidentPlayer(state)).cards =  cards;
        logEntry(state)(`President ${Interface.getPresidentName(state)} may now look at the top three cards of the policy deck.`);
        setPhase(state, 'president-policy-peek');
    } else if (power === 'execution') {
        logEntry(state)(`President ${Interface.getPresidentName(state)} must now execute someone.`);
        setPhase(state, 'president-execute-player');
    } else if (power === 'call-special-election') {
        logEntry(state)(`President ${Interface.getPresidentName(state)} must now call for a special election.`);
        setPhase(state, 'president-call-special-election');
    }
    return { ...cause, power};
}

function doInvestigatePlayer(state: Interface.ServerState, target: Interface.Player): Interface.ServerPresidentInvestigatingPlayer {
    log('president is investigating ' + target.playerNum);
    logEntry(state)(`President ${Interface.getPresidentName(state)} has chosen to investigate ${Interface.getPlayerName(state, target)}.`);
    target.isInvestigated = true;
    Interface.getPlayerSecrets(state, Interface.getPresidentPlayer(state)).investigation = {
        targetNum: target.playerNum,
        loyalty: Interface.getPlayerSecrets(state, target).loyalty,
    };
    setPhase(state, 'president-investigating-player');
    return { type: 'president-investigating-player', targetNum: target.playerNum };
}

function doInvestigationComplete(state: Interface.ServerState): Interface.ServerPresidentInvestigationComplete {
    log('president is done investigating');
    logEntry(state)(`President ${Interface.getPresidentName(state)} has completed their investigation.`);
    Interface.getPlayerSecrets(state, Interface.getPresidentPlayer(state)).investigation = undefined;
    return { type: 'president-investigation-complete' };
}

function doPolicyPeekComplete(state: Interface.ServerState): Interface.ServerPresidentPolicyPeekComplete {
    const secrets = Interface.getPlayerSecrets(state, Interface.getPresidentPlayer(state));
    log('president is done peeking at the policies');
    logEntry(state)(`President ${Interface.getPresidentName(state)} has returned the policy cards to the deck in order.`);
    topDeck(state, secrets.cards);
    secrets.cards = [];
    return { type: 'president-policy-peek-complete' };
}

function doExecutePlayer(state: Interface.ServerState, target: Interface.Player): Interface.ServerPresidentExecutedPlayer {
    log('president is executing ' + target.playerNum);
    logEntry(state)('important', `President ${Interface.getPresidentName(state)} has executed ${Interface.getPlayerName(state, target)}.`);
    target.isExecuted = true;
    return { type: 'president-executed-player', targetNum: target.playerNum };
}

function doLiberalsWinByExecution(state: Interface.ServerState, cause: Interface.ServerPresidentExecutedPlayer): Interface.ServerGameOver {
    log(`[room ${state.roomId}]   hitler has been executed`);
    setPhase(state, 'game-over');
    logEntry(state)('fascist', `${Interface.getPlayerName(state, Interface.getPlayer(state, cause.targetNum))} was Hitler.`);
    logEntry(state)('important', `The LIBERALS win!`);
    return { type: 'game-over', winners: 'liberal', cause };
}

function doExecutedPlayerWasNotHitler(state: Interface.ServerState, cause: Interface.ServerPresidentExecutedPlayer): Interface.ServerRoundStarted {
    logEntry(state)('liberal', `${Interface.getPlayerName(state, Interface.getPlayer(state, cause.targetNum))} was not Hitler.`);
    return doRoundStart(state, cause);
}

function doCallSpecialElection(state: Interface.ServerState, nextPresident: Interface.Player): Interface.ServerRoundStarted {
    log('president is calling a special election');
    logEntry(state)(`President ${Interface.getPresidentName(state)} has called for a special election and nominated ${Interface.getPlayerName(state, nextPresident)} as the next Presidential Candidate.`);
    state.game.round ++;
    logEntry(state)(`Round #${state.game.round} (special election) has begun.`);
    state.game.specialElectionReturn = state.game.presidentNum;
    state.game.presidentNum = nextPresident.playerNum;
    state.game.chancellorNum = undefined;
    log('  next presidential candidate is ' + state.game.presidentNum);
    setPhase(state, 'president-choose-chancellor');
    return { type: 'round-started', cause: { type: 'president-called-special-election', nextPresidentNum: nextPresident.playerNum } };
}

function processUserSetName(state: Interface.ServerState, user: Interface.User, message: Interface.ClientUserSetName):
    Interface.ServerUserTakeover | Interface.ServerUserChangedName
{
    const name = message.name.trim();
    if (name.length < Interface.MIN_NAME || name.length > Interface.MAX_NAME) {
        throw new Error(`invalid name length ${name.length}`);
    }
    const oldUser = Interface.enumerateUsers(state.users).find((u) => u.userId != user.userId && u.name.toLowerCase() === name.toLowerCase());
    if (oldUser) {
        if (oldUser.connected || !user.connected) {
            throw new Error('name already taken');
        }
        return doUserTakeover(state, user, name, oldUser);
    } else {
        if (user.status === 'ready') {
            throw new Error('can\'t change name now');
        }
        return doUserChangeName(user, name);
    }
}

function processUserSetStatus(state: Interface.ServerState, user: Interface.User, message: Interface.ClientUserSetStatus):
    Interface.ServerUserSetStatus | Interface.ServerRoundStarted
{
    checkPhases(state, ['pregame', 'game-over']);
    if (!user.name) {
        throw new Error('name not set');
    }

    const {status} = message;
    const userSetReady = doUserSetReady(user, status);

    const ready = Interface.enumerateUsers(state.users).filter((u) => u.connected && u.status === 'not ready').length === 0;
    const playerUsers = Interface.enumerateUsers(state.users).filter((u) => u.status === 'ready');
    const numPlayers = playerUsers.length;
    if (ready && numPlayers >= Interface.MIN_PLAYERS && numPlayers <= Interface.MAX_PLAYERS) {
        const gameStart = doGameStart(state, playerUsers, userSetReady);
        return doRoundStart(state, gameStart);
    }
    return userSetReady;
}

function processPresidentChooseChancellor(state: Interface.ServerState, user: Interface.User, message: Interface.ClientPresidentChooseChancellor):
    Interface.ServerPresidentChoseChancellor
{
    checkPhase(state, 'president-choose-chancellor');
    const player = Interface.getUserPlayer(state, user);
    if (typeof(state.game.chancellorNum) !== 'undefined') {
        throw new Error('[bug] there is already a chancellor');
    }
    if (state.game.presidentNum !== player.playerNum) {
        throw new Error('you are not the president');
    }
    const {chancellorNum} = message;
    if (chancellorNum === player.playerNum) {
        throw new Error('can\'t choose yourself');
    }
    if (chancellorNum < 0 || chancellorNum >= state.game.players.length) {
        throw new Error('invalid player num');
    }
    if (chancellorNum === state.game.lastPresidentNum && Interface.getPlayersRemaining(state.game.players) > Interface.MAX_PLAYERS_WHERE_LAST_PRESIDENT_CAN_BE_CHANCELLOR) {
        throw new Error('that player is not eligible - they were the last President');
    }
    if (chancellorNum === state.game.lastChancellorNum) {
        throw new Error('that player is not eligible - they were the last Chancellor');
    }
    if (Interface.getPlayer(state, chancellorNum).isExecuted) {
        throw new Error('that player has been executed');
    }
    return doPresidentChooseChancellor(state, user, chancellorNum);
}

function processPlayerVote(state: Interface.ServerState, user: Interface.User, message: Interface.ClientPlayerVote):
    Interface.ServerPlayerVoted | Interface.ServerElectionJa | Interface.ServerElectionNein | Interface.ServerRoundStarted | Interface.ServerGameOver
{
    checkPhase(state, 'players-vote');
    const player = Interface.getUserPlayer(state, user);
    const {playerNum} = player;
    if (player.voted) {
        throw new Error('you\'ve already voted');
    }
    if (player.isExecuted) {
        throw new Error('you have been executed');
    }
    const playerVoted = doPlayerVote(state, player, message.vote);
    if (Interface.getVoteCount(state) === Interface.getPlayersRemaining(state.game.players)) {
        const electionResult = doElection(state, playerVoted);
        if (electionResult.type === 'election-ja') {
            if (state.game.policiesEnacted.fascist >= Interface.MIN_FASCIST_POLICIES_FOR_FASCIST_ELECTION_WIN && Interface.getChancellorIsHitler(state)) {
                return doFascistsWinByElection(state, electionResult);
            } else {
                return doPresidentDrawsPolicies(state, electionResult);
            }
        } else {
            if (state.game.electionTracker == Interface.MAX_ELECTION_TRACKER) {
                const chaos = doChaos(state, electionResult);
                if (state.game.policiesEnacted.fascist >= Interface.MAX_FASCIST_POLICIES_ENACTED) {
                    return doTeamWinsByPolicies(state, chaos);
                } else if (state.game.policiesEnacted.liberal >= Interface.MAX_LIBERAL_POLICIES_ENACTED) {
                    return doTeamWinsByPolicies(state, chaos);
                } else {
                    return doRoundStart(state, chaos);
                }
            } else {
                return doRoundStart(state, electionResult);
            }
        }
    } else {
        return { type: 'player-voted', playerNum };
    }
}

function processPresidentSetAgenda(state: Interface.ServerState, user: Interface.User, message: Interface.ClientPresidentSetAgenda):
    Interface.ServerPresidentSetAgenda
{
    checkPhase(state, 'president-set-agenda');
    const player = Interface.getUserPlayer(state, user);
    if (state.game.presidentNum !== player.playerNum) {
        throw new Error('you\'re not the president');
    }
    const {discardPolicy} = message;
    return doPresidentSetAgenda(state, discardPolicy);
}

function processChancellorProposeVeto(state: Interface.ServerState, user: Interface.User, message: Interface.ClientChancellorProposeVeto):
    Interface.ServerChancellorProposedVeto
{
    checkPhase(state, 'chancellor-consider-veto');
    const player = Interface.getUserPlayer(state, user);
    if (state.game.chancellorNum !== player.playerNum) {
        throw new Error('you\'re not the chancellor');
    }
    return doChancellorProposeVeto(state);
}

function processChancellorRejectVeto(state: Interface.ServerState, user: Interface.User, message: Interface.ClientChancellorRejectVeto):
    Interface.ServerChancellorRejectedVeto
{
    checkPhase(state, 'chancellor-consider-veto');
    const player = Interface.getUserPlayer(state, user);
    if (state.game.chancellorNum !== player.playerNum) {
        throw new Error('you\'re not the chancellor');
    }
    return doChancellorRejectVeto(state);
}

function processPresidentAcceptVeto(state: Interface.ServerState, user: Interface.User, message: Interface.ClientPresidentAcceptVeto):
    Interface.ServerPresidentAcceptedVeto | Interface.ServerRoundStarted | Interface.ServerGameOver
{
    checkPhase(state, 'president-consider-veto');
    const player = Interface.getUserPlayer(state, user);
    if (state.game.presidentNum !== player.playerNum) {
        throw new Error('you\'re not the president');
    }
    const accept = doPresidentAcceptVeto(state);
    if (state.game.electionTracker == Interface.MAX_ELECTION_TRACKER) {
        const chaos = doChaos(state, accept);
        if (state.game.policiesEnacted.fascist >= Interface.MAX_FASCIST_POLICIES_ENACTED) {
            return doTeamWinsByPolicies(state, chaos);
        } else if (state.game.policiesEnacted.liberal >= Interface.MAX_LIBERAL_POLICIES_ENACTED) {
            return doTeamWinsByPolicies(state, chaos);
        } else {
            return doRoundStart(state, chaos);
        }
    } else {
        return doRoundStart(state, accept);
    }
}

function processPresidentRejectVeto(state: Interface.ServerState, user: Interface.User, message: Interface.ClientPresidentRejectVeto):
    Interface.ServerPresidentRejectedVeto
{
    checkPhase(state, 'president-consider-veto');
    const player = Interface.getUserPlayer(state, user);
    if (state.game.presidentNum !== player.playerNum) {
        throw new Error('you\'re not the president');
    }
    return doPresidentRejectVeto(state);
}

function processChancellorEnactPolicy(state: Interface.ServerState, user: Interface.User, message: Interface.ClientChancellorEnactPolicy):
    Interface.ServerRoundStarted | Interface.ServerGameOver | Interface.ServerChancellorEnactedPolicy
{
    checkPhase(state, 'chancellor-enact-policy');
    const player = Interface.getUserPlayer(state, user);
    if (state.game.chancellorNum !== player.playerNum) {
        throw new Error('you\'re not the chancellor');
    }
    const enactedPolicy = doChancellorEnactPolicy(state, message.enactPolicy);
    if (state.game.policiesEnacted.fascist >= Interface.MAX_FASCIST_POLICIES_ENACTED) {
        return doTeamWinsByPolicies(state, enactedPolicy);
    } else if (state.game.policiesEnacted.liberal >= Interface.MAX_LIBERAL_POLICIES_ENACTED) {
        return doTeamWinsByPolicies(state, enactedPolicy);
    } else  if (enactedPolicy.policy === 'liberal') {
        return doRoundStart(state, enactedPolicy);
    } else {
        const power = (Interface.PRESIDENTIAL_POWERS_MAP[state.game.players.length] || [])[state.game.policiesEnacted.fascist];
        if (power) {
            return doTriggerPower(state, power, enactedPolicy);
        } else {
            return doRoundStart(state, enactedPolicy);
        }
    }
}

function processPresidentInvestigatePlayer(state: Interface.ServerState, user: Interface.User, message: Interface.ClientPresidentInvestigatePlayer):
    Interface.ServerPresidentInvestigatingPlayer
{
    checkPhase(state, 'president-investigate-player');
    const player = Interface.getUserPlayer(state, user);
    if (state.game.presidentNum !== player.playerNum) {
        throw new Error('you\'re not the president');
    }
    const {targetNum} = message;
    if (player.playerNum === targetNum) {
        throw new Error('can\'t investigate yourself');
    }
    const targetPlayer = Interface.getPlayer(state, targetNum);
    if (targetPlayer.isExecuted) {
        throw new Error('that player has been executed');
    }
    if (targetPlayer.isInvestigated) {
        throw new Error('that player has already been investigated');
    }
    return doInvestigatePlayer(state, targetPlayer);
}

function processPresidentInvestigationComplete(state: Interface.ServerState, user: Interface.User, message: Interface.ClientPresidentInvestigationComplete):
    Interface.ServerRoundStarted
{
    checkPhase(state, 'president-investigating-player');
    const player = Interface.getUserPlayer(state, user);
    if (state.game.presidentNum !== player.playerNum) {
        throw new Error('you\'re not the president');
    }
    const complete = doInvestigationComplete(state);
    return doRoundStart(state, complete);
}

function processPresidentPolicyPeekComplete(state: Interface.ServerState, user: Interface.User, message: Interface.ClientPresidentPolicyPeekComplete):
    Interface.ServerRoundStarted
{
    checkPhase(state, 'president-policy-peek');
    const player = Interface.getUserPlayer(state, user);
    if (state.game.presidentNum !== player.playerNum) {
        throw new Error('you\'re not the president');
    }
    const complete = doPolicyPeekComplete(state);
    return doRoundStart(state, complete);
}

function processPresidentExecutePlayer(state: Interface.ServerState, user: Interface.User, message: Interface.ClientPresidentExecutePlayer):
    Interface.ServerRoundStarted | Interface.ServerGameOver
{
    checkPhase(state, 'president-execute-player');
    const player = Interface.getUserPlayer(state, user);
    if (state.game.presidentNum !== player.playerNum) {
        throw new Error('you\'re not the president');
    }
    const {targetNum} = message;
    if (player.playerNum === targetNum) {
        throw new Error('can\'t execute yourself');
    }
    const target = Interface.getPlayer(state, targetNum);
    if (target.isExecuted) {
        throw new Error('that player has already been executed');
    }
    const executed = doExecutePlayer(state, target);
    if (Interface.getPlayerSecrets(state, target).isHitler) {
        return doLiberalsWinByExecution(state, executed);
    } else {
        return doExecutedPlayerWasNotHitler(state, executed);
    }
}

function processPresidentCallSpecialElection(state: Interface.ServerState, user: Interface.User, message: Interface.ClientPresidentCallSpecialElection):
    Interface.ServerRoundStarted
{
    checkPhase(state,'president-call-special-election');
    const player = Interface.getUserPlayer(state, user);
    if (state.game.presidentNum !== player.playerNum) {
        throw new Error('you\'re not the president');
    }
    const {nextPresidentNum} = message;
    if (player.playerNum === nextPresidentNum) {
        throw new Error('can\'t choose yourself');
    }
    const nextPresident = Interface.getPlayer(state, nextPresidentNum);
    if (nextPresident.isExecuted) {
        throw new Error('that player has been executed');
    }
    return doCallSpecialElection(state, nextPresident);
}

export function processMessage(state: Interface.ServerState, userId: Interface.UserId, message: Interface.ClientMessage):
    Interface.ServerMessage
{
    const user = Interface.getUser(state, userId);
    if (!user.connected) {
        throw new Error('user not connected');
    }
    if (message.type === 'user-set-name') {
        return processUserSetName(state, user, message);
    } else if (message.type == 'user-set-status') {
        return processUserSetStatus(state, user, message);
    } else if (message.type == 'president-choose-chancellor') {
        return processPresidentChooseChancellor(state, user, message);
    } else if (message.type == 'player-vote') {
        return processPlayerVote(state, user, message);
    } else if (message.type === 'president-set-agenda') {
        return processPresidentSetAgenda(state, user, message);
    } else if (message.type === 'chancellor-propose-veto') {
        return processChancellorProposeVeto(state, user, message);
    } else if (message.type === 'chancellor-reject-veto') {
        return processChancellorRejectVeto(state, user, message);
    } else if (message.type === 'president-accept-veto') {
        return processPresidentAcceptVeto(state, user, message);
    } else if (message.type === 'president-reject-veto') {
        return processPresidentRejectVeto(state, user, message);
    } else if (message.type === 'chancellor-enact-policy') {
        return processChancellorEnactPolicy(state, user, message);
    } else if (message.type === 'president-investigate-player') {
        return processPresidentInvestigatePlayer(state, user, message);
    } else if (message.type === 'president-investigation-complete') {
        return processPresidentInvestigationComplete(state, user, message);
    } else if (message.type === 'president-policy-peek-complete') {
        return processPresidentPolicyPeekComplete(state, user, message);
    } else if (message.type === 'president-execute-player') {
        return processPresidentExecutePlayer(state, user, message);
    } else if (message.type === 'president-call-special-election') {
        return processPresidentCallSpecialElection(state, user, message);
    } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        throw new Error(`invalid message type "${message && (message as any).type}"`);
    }
}