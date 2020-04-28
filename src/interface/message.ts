import { Vote, Loyalty, Power, PlayerNum, UserId, Status } from './state';

export interface ClientUserSetName {
    type: 'user-set-name';
    name: string;
}

export interface ClientUserSetStatus {
    type: 'user-set-status';
    status: Status;
}

export interface ClientPresidentChooseChancellor {
    type: 'president-choose-chancellor';
    chancellorNum: PlayerNum;
}

export interface ClientPlayerVote {
    type: 'player-vote';
    vote: Vote;
}

export interface ClientPresidentSetAgenda {
    type: 'president-set-agenda';
    discardPolicy: Loyalty;
}

export interface ClientChancellorProposeVeto {
    type: 'chancellor-propose-veto';
}

export interface ClientChancellorRejectVeto {
    type: 'chancellor-reject-veto';
}

export interface ClientPresidentAcceptVeto {
    type: 'president-accept-veto';
}

export interface ClientPresidentRejectVeto {
    type: 'president-reject-veto';
}

export interface ClientChancellorEnactPolicy {
    type: 'chancellor-enact-policy';
    enactPolicy: Loyalty;
}

export interface ClientPresidentInvestigatePlayer {
    type: 'president-investigate-player';
    targetNum: PlayerNum;
}

export interface ClientPresidentInvestigationComplete {
    type: 'president-investigation-complete';
}

export interface ClientPresidentPolicyPeekComplete {
    type: 'president-policy-peek-complete';
}

export interface ClientPresidentExecutePlayer {
    type: 'president-execute-player';
    targetNum: PlayerNum;
}

export interface ClientPresidentCallSpecialElection {
    type: 'president-call-special-election';
    nextPresidentNum: PlayerNum;
}

export type ClientMessage =
      ClientUserSetName
    | ClientUserSetStatus
    | ClientPresidentChooseChancellor
    | ClientPlayerVote
    | ClientPresidentSetAgenda
    | ClientChancellorProposeVeto
    | ClientChancellorRejectVeto
    | ClientPresidentAcceptVeto
    | ClientPresidentRejectVeto
    | ClientChancellorEnactPolicy
    | ClientPresidentInvestigatePlayer
    | ClientPresidentInvestigationComplete
    | ClientPresidentPolicyPeekComplete
    | ClientPresidentExecutePlayer
    | ClientPresidentCallSpecialElection
    ;

export interface ServerInit {
    type: 'init';
}

export interface ServerUserConnect {
    type: 'user-connect';
    userId: UserId;
}

export interface ServerUserDisconnect {
    type: 'user-disconnect';
    userId: UserId;
}

export interface ServerNewUser {
    type: 'new-user';
    userId: UserId;
}

export interface ServerUserTakeover {
    type: 'user-takeover';
    userId: UserId;
    playerNum: PlayerNum | undefined;
    oldUserId: UserId;
}

export interface ServerUserChangedName {
    type: 'user-changed-name';
    userId: UserId;
}

export interface ServerGameStarted {
    type: 'game-started';
    cause: ServerUserSetStatus;
}

export interface ServerUserSetStatus {
    type: 'user-set-status';
    userId: UserId;
}

export interface ServerPresidentChoseChancellor {
    type: 'president-chose-chancellor';
    chancellorNum: PlayerNum;
}

export interface ServerPlayerVoted {
    type: 'player-voted';
    playerNum: number;
}

export interface ServerElectionJa {
    type: 'election-ja';
    cause: ServerPlayerVoted;
    chancellorNotHitler?: true;
}

export interface ServerElectionNein {
    type: 'election-nein';
    cause: ServerPlayerVoted;
}

export interface ServerElectionNein {
    type: 'election-nein';
    cause: ServerPlayerVoted;
}

export interface ServerChaos {
    type: 'chaos';
    policy: Loyalty;
    cause: ServerElectionNein | ServerPresidentAcceptedVeto;
}

export interface ServerPresidentSetAgenda {
    type: 'president-set-agenda';
    vetoActive: boolean;
}

export interface ServerChancellorProposedVeto {
    type: 'chancellor-proposed-veto';
}

export interface ServerChancellorRejectedVeto {
    type: 'chancellor-rejected-veto';
}

export interface ServerPresidentAcceptedVeto {
    type: 'president-accepted-veto';
}

export interface ServerPresidentRejectedVeto {
    type: 'president-rejected-veto';
}

export interface ServerPresidentSetAgenda {
    type: 'president-set-agenda';
    vetoActive: boolean;
}

export interface ServerChancellorEnactedPolicy {
    type: 'chancellor-enacted-policy';
    policy: Loyalty;
    power?: Power;
}

export interface ServerPresidentInvestigatingPlayer {
    type: 'president-investigating-player';
    targetNum: PlayerNum;
}

export interface ServerPresidentInvestigationComplete {
    type: 'president-investigation-complete';
}

export interface ServerPresidentPolicyPeekComplete {
    type: 'president-policy-peek-complete';
}

export interface ServerPresidentExecutedPlayer {
    type: 'president-executed-player';
    targetNum: PlayerNum;
}

export interface ServerPresidentCalledSpecialElection {
    type: 'president-called-special-election';
    nextPresidentNum: PlayerNum;
}

export interface ServerRoundStarted {
    type: 'round-started';
    cause: ServerGameStarted | ServerChaos | ServerElectionNein | ServerChancellorEnactedPolicy | ServerPresidentInvestigationComplete | ServerPresidentPolicyPeekComplete | ServerPresidentExecutedPlayer | ServerPresidentCalledSpecialElection | ServerPresidentAcceptedVeto;
}

export interface ServerGameOver {
    type: 'game-over';
    winners: Loyalty;
    cause: ServerElectionJa | ServerChaos | ServerChancellorEnactedPolicy | ServerPresidentExecutedPlayer;
}

export type ServerMessage =
      ServerInit
    | ServerUserConnect
    | ServerUserDisconnect
    | ServerNewUser
    | ServerUserTakeover
    | ServerUserChangedName
    | ServerUserSetStatus
    | ServerGameStarted
    | ServerPresidentChoseChancellor
    | ServerPlayerVoted
    | ServerElectionJa
    | ServerElectionNein
    | ServerChaos
    | ServerPresidentSetAgenda
    | ServerChancellorProposedVeto
    | ServerChancellorRejectedVeto
    | ServerPresidentAcceptedVeto
    | ServerPresidentRejectedVeto
    | ServerChancellorEnactedPolicy
    | ServerPresidentInvestigatingPlayer
    | ServerPresidentInvestigationComplete
    | ServerPresidentPolicyPeekComplete
    | ServerPresidentExecutedPlayer
    | ServerPresidentCalledSpecialElection
    | ServerRoundStarted
    | ServerGameOver
    ;