import { Power } from './state';

export const MIN_PLAYERS = 5;
export const MAX_PLAYERS = 10;

export const PRESIDENTIAL_POWERS_5_OR_6: Power[] = [null, null, null, 'policy-peek', 'execution', 'execution'];
export const PRESIDENTIAL_POWERS_7_OR_8: Power[] = [null, null, 'investigate-loyalty', 'call-special-election', 'execution', 'execution'];
export const PRESIDENTIAL_POWERS_9_OR_10: Power[] = [null, 'investigate-loyalty', 'investigate-loyalty', 'call-special-election', 'execution', 'execution'];

export const PRESIDENTIAL_POWERS_MAP = [null, null, null, null, null,
    PRESIDENTIAL_POWERS_5_OR_6,
    PRESIDENTIAL_POWERS_5_OR_6,
    PRESIDENTIAL_POWERS_7_OR_8,
    PRESIDENTIAL_POWERS_7_OR_8,
    PRESIDENTIAL_POWERS_9_OR_10,
    PRESIDENTIAL_POWERS_9_OR_10,
];

export const MAX_ELECTION_TRACKER = 3;
export const NUM_LIBERAL_POLICIES = 6;
export const NUM_FASCIST_POLICIES = 11;
export const MAX_LIBERAL_POLICIES_ENACTED = 5;
export const MAX_FASCIST_POLICIES_ENACTED = 6;

export const MIN_NAME = 1;
export const MAX_NAME = 15;

export const NUM_FASCISTS_MAP = [-1, -1, -1, -1, -1, 2, 2, 3, 3, 4, 4]; // including hitler
export const NUM_LIBERALS_MAP = [-1, -1, -1, -1, -1, 3, 4, 4, 5, 5, 6];
export const HITLER_KNOWS_MAP = [false, false, false, false, false, true, true, false, false, false, false];

export const MIN_FASCIST_POLICIES_FOR_FASCIST_ELECTION_WIN = 3;
export const MAX_PLAYERS_WHERE_LAST_PRESIDENT_CAN_BE_CHANCELLOR = 5;
export const MIN_FASCIST_POLICIES_FOR_VETO = 5;