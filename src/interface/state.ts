import { RNG } from '../util';

export type Loyalty = 'liberal' | 'fascist';

export interface ServerState {
    roomId: string;
    users: UserMap;
    game: Game;

    gameSecrets: GameSecrets;
    playerSecrets: PlayerSecrets[];
}

export interface ClientState {
    roomId: string;
    users: UserMap;
    game: Game;

    userId: UserId;
    playerNum: PlayerNum | undefined;
    playerSecrets: PlayerSecrets | undefined;
}

export type UserId = string;
export type PlayerNum = number;

export type Cards = Loyalty[];

export type Power = null | 'policy-peek' | 'execution' | 'investigate-loyalty' | 'call-special-election';

export type Phase =
      'pregame'
    | 'president-choose-chancellor'
    | 'players-vote'
    | 'president-set-agenda'
    | 'chancellor-consider-veto'
    | 'president-consider-veto'
    | 'chancellor-enact-policy'
    | 'president-investigate-player'
    | 'president-investigating-player'
    | 'president-policy-peek'
    | 'president-execute-player'
    | 'president-call-special-election'
    | 'game-over'
    ;

export type Vote = 'ja' | 'nein';

export type Style = 'important' | 'fascist' | 'liberal';

export interface StyleString {
    style: Style;
    text: string;
}

export type LogEntryPart = string | StyleString;

export type LogEntry = LogEntryPart[];

export interface Game {
    players: Player[];
    phase: Phase;
    round: number;
    lastPresidentNum: PlayerNum | undefined;
    lastChancellorNum: PlayerNum | undefined;
    specialElectionReturn: number | undefined;
    presidentNum: PlayerNum;
    chancellorNum: PlayerNum | undefined;
    electionTracker: number;
    policyCards: number;
    policiesEnacted: {
        liberal: number;
        fascist: number;
    };
    log: LogEntry[];
}

export interface GameSecrets {
    seed: string;
    policyDeck: Cards;
    policyDiscard: Cards;
    rng: RNG;
}

export type Status = 'ready' | 'not ready' | 'spectator';

export interface User {
    userId: UserId;
    connected: boolean;
    name: string;
    status: Status;
    playerNum: PlayerNum | undefined;
}

export interface UserMap {
    [id: string]: User;
}

export interface Player {
    playerNum: PlayerNum;
    userId: UserId;
    isExecuted: boolean;
    isInvestigated: boolean;
    voted: boolean;
}

export interface Investigation {
    targetNum: number;
    loyalty: Loyalty;
}

export interface PlayerSecrets {
    loyalty: Loyalty;
    isHitler: boolean;
    knownHitlerNum: PlayerNum | undefined;
    knownFascistNums: PlayerNum[];
    vote: Vote | undefined;
    cards: Cards;
    investigation: Investigation | undefined;
}