import React from 'react';

import './Ui.scss';

import * as Interface from '../src/interface';

import UserList from './component/UserList';
import NameDialog from './dialog/NameDialog';
import { MessageListener, DisconnectedMessage } from '.';
import OptionsMenu from './component/OptionsMenu';
import ReadyDialog from './dialog/ReadyDialog';
import PlayerList from './component/PlayerList';
import SpectatorList from './component/SpectatorList';
import LoyaltyPanel from './component/LoyaltyPanel';
import ChooseChancellorDialog from './dialog/ChooseChancellorDialog';
import VoteDialog from './dialog/VoteDialog';
import FactsPanel from './component/FactsPanel';
import WaitDialog from './dialog/WaitDialog';
import GameLogPanel from './component/GameLogPanel';
import Legislating1Dialog from './dialog/Legislating1Dialog';
import Legislating2Dialog from './dialog/Legislating2Dialog';
import InvestigateLoyaltyDialog from './dialog/InvesigateLoyaltyDialog';
import InvestigateLoyalty2Dialog from './dialog/InvesigateLoyalty2Dialog';
import PolicyPeekDialog from './dialog/PolicyPeekDialog';
import ExecuteDialog from './dialog/ExecuteDialog';
import ChooseSpecialPresidentDialog from './dialog/ChooseSpecialPresidentDialog';
import ChancellorConsiderVetoDialog from './dialog/ChancellorConsiderVetoDialog';
import PresidentConsiderVetoDialog from './dialog/PresidentConsiderVetoDialog';
import FascistTrackPanel from './component/FascistTrackPanel';

export interface UiProps {
    connect: (listener: MessageListener) => void;
}

export interface UiState {
    changingName: boolean;
    client?: Interface.ClientState;
    disconnected: boolean;
}

export default class Ui extends React.Component<UiProps, UiState> {

    constructor(props: UiProps) {
        super(props);
        this.props.connect((message, state) => this.onMessage(message, state));
        this.state = {
            changingName: false,
            disconnected: false,
        };
    }

    onMessage(message: Interface.ServerMessage | DisconnectedMessage, state: Interface.ClientState | null) {
        this.setState({ ...this.state, client: state || undefined, disconnected: !state }); // TODO handle specific events and don't rewrite the entire state object
    }

    onChangeName() {
        const {client} = this.state;
        if (client) {
            const user = client.users[client.userId];
            if (user.status === 'ready') {
                return;
            }
            this.setState({ ...this.state, changingName: true });
        }
    }

    onNameChanged() {
        this.setState({ ...this.state, changingName: false });
    }

    onReconnect() {
        window.location.reload();
    }

    render() {
        const {client} = this.state;
        if (!client) {
            if (this.state.disconnected) {
                return (<div className="Ui">
                    Disconnected... <input type="button" value="Refresh" onClick={() => this.onReconnect()}></input>
                </div>);
            } else {
                return (<div className="Ui">
                    Connecting...
                </div>);
            }
        }
        const {users, playerNum, userId, game, playerSecrets} = client;
        const {players} = game;
        const playerUsers = players.map((p) => users[p.userId]);
        const user = users[userId];
        const {presidentNum, chancellorNum} = game;

        const started = game.phase !== 'pregame';
        const finished = game.phase === 'game-over';
        const showUserList = !(started && !finished);
        const showPlayerList = started && !finished;
        const showSpectatorList = started && !finished;
        const showGameLog = started;
        const showNameDialog = !user.name || (user.status !== 'ready' && this.state.changingName);
        const showReadyDialog = !showNameDialog && !(started && !finished);
        const showFactsPanel = started;
        const showFascistTrackPanel = started;
        const showLoyaltyPanel = started;

        let actionPanel: JSX.Element | undefined;
        if (started) {
            if (game.phase === 'game-over') {
                // no action panel
            } else if (game.phase === 'president-choose-chancellor') {
                if (typeof(playerNum) !== 'undefined' && presidentNum === user.playerNum) {
                    actionPanel = <ChooseChancellorDialog users={users} players={players} playerNum={playerNum} lastPresidentNum={game.lastPresidentNum} lastChancellorNum={game.lastChancellorNum} />;
                } else {
                    actionPanel = <WaitDialog message={`Waiting for Presidential Candidate ${playerUsers[game.presidentNum].name} to choose a Chancellor.`} />;
                }
            } else if (game.phase === 'players-vote' && typeof(game.chancellorNum) !== 'undefined') {
                actionPanel = <VoteDialog users={users} players={players} playerNum={playerNum} presidentNum={game.presidentNum} chancellorNum={game.chancellorNum} />;
            } else if (game.phase === 'president-set-agenda') {
                if (presidentNum === user.playerNum && playerSecrets) {
                    actionPanel = <Legislating1Dialog cards={playerSecrets.cards} />;
                } else {
                    actionPanel = <WaitDialog message={`Waiting for President ${playerUsers[game.presidentNum].name} to choose two policy cards.`} />;
                }
            } else if (game.phase === 'chancellor-consider-veto' && typeof(game.chancellorNum) !== 'undefined') {
                if (chancellorNum === user.playerNum && playerSecrets) {
                    actionPanel = <ChancellorConsiderVetoDialog agenda={playerSecrets.cards} />;
                } else {
                    actionPanel = <WaitDialog message={`Waiting for Chancellor ${playerUsers[game.chancellorNum].name} to consider vetoing the agenda.`} />;
                }
            } else if (game.phase === 'president-consider-veto') {
                if (presidentNum === user.playerNum && playerSecrets) {
                    actionPanel = <PresidentConsiderVetoDialog agenda={playerSecrets.cards} />;
                } else {
                    actionPanel = <WaitDialog message={`Waiting for President ${playerUsers[game.presidentNum].name} to consider vetoing the agenda.`} />;
                }
            } else if (game.phase === 'chancellor-enact-policy' && typeof(game.chancellorNum) !== 'undefined') {
                if (chancellorNum === user.playerNum && playerSecrets) {
                    actionPanel = <Legislating2Dialog agenda={playerSecrets.cards} />;
                } else {
                    actionPanel = <WaitDialog message={`Waiting for Chancellor ${playerUsers[game.chancellorNum].name} to choose a policy card.`} />;
                }
            } else if (game.phase === 'president-investigate-player') {
                if (typeof(playerNum) !== 'undefined' && presidentNum === user.playerNum) {
                    actionPanel = <InvestigateLoyaltyDialog users={users} players={players} playerNum={playerNum} />;
                } else {
                    actionPanel = <WaitDialog message={`Waiting for President ${playerUsers[game.presidentNum].name} to investigate someone's loyalty.`} />;
                }
            } else if (game.phase === 'president-investigating-player') {
                if (presidentNum === user.playerNum && playerSecrets && playerSecrets.investigation) {
                    actionPanel = <InvestigateLoyalty2Dialog users={users} players={players} investigation={playerSecrets.investigation} />;
                } else {
                    actionPanel = <WaitDialog message={`Waiting for President ${playerUsers[game.presidentNum].name} to finish their investigation.`} />;
                }
            } else if (game.phase === 'president-policy-peek') {
                if (presidentNum === user.playerNum && playerSecrets) {
                    actionPanel = <PolicyPeekDialog cards={playerSecrets.cards} />;
                } else {
                    actionPanel = <WaitDialog message={`Waiting for President ${playerUsers[game.presidentNum].name} to peek at the top three policy cards.`} />;
                }
            } else if (game.phase === 'president-execute-player') {
                if (typeof(playerNum) !== 'undefined' && presidentNum === user.playerNum) {
                    actionPanel = <ExecuteDialog users={users} players={players} playerNum={playerNum} />;
                } else {
                    actionPanel = <WaitDialog message={`Waiting for President ${playerUsers[game.presidentNum].name} to execute someone.`} />;
                }
            } else if (game.phase === 'president-call-special-election') {
                if (typeof(playerNum) !== 'undefined' && presidentNum === user.playerNum) {
                    actionPanel = <ChooseSpecialPresidentDialog users={users} players={players} playerNum={playerNum} />;
                } else {
                    actionPanel = <WaitDialog message={`Waiting for President ${playerUsers[game.presidentNum].name} to nominate someone for a special election.`} />;
                }
            }
        }

        return (<div className="Ui">
            <div className="left">
                <OptionsMenu canChangeName={user.status !== 'ready'} onChangeName={() => this.onChangeName()}/>
                {showUserList && <UserList users={users} userId={userId} />}
                {showPlayerList && <PlayerList users={users} players={players} playerNum={playerNum} presidentNum={presidentNum} chancellorNum={chancellorNum} />}
                {showSpectatorList && <SpectatorList users={users} userId={userId} />}
            </div>
            <div className="center">
                {showGameLog && <GameLogPanel log={game.log} />}
            </div>
            <div className="right">
                {showFactsPanel && <FactsPanel numPlayers={playerUsers.length} electionTracker={game.electionTracker} policyCards={game.policyCards} policiesEnacted={game.policiesEnacted}/>}
                {showFascistTrackPanel && <FascistTrackPanel numPlayers={playerUsers.length} fascistPolicies={game.policiesEnacted.fascist} />}
                {showLoyaltyPanel && playerSecrets && <LoyaltyPanel users={users} players={players} playerSecrets={playerSecrets} />}
            </div>
            <div className="bottom">
                {showNameDialog && <NameDialog users={users} userId={userId} onNameChanged={() => this.onNameChanged()} />}
                {showReadyDialog && <ReadyDialog users={users} userId={userId} />}
                {actionPanel}
            </div>
        </div>);
    }
}