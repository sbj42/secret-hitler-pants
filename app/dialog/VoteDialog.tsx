import React from 'react';

import './VoteDialog.scss';

import * as Interface from '../../src/interface';
import { rpc } from '..';
import { joinElements } from '../util';

export interface VoteDialogProps {
    users: Interface.UserMap;
    players: Interface.Player[];
    playerNum: Interface.PlayerNum | undefined;
    presidentNum: Interface.PlayerNum;
    chancellorNum: Interface.PlayerNum;
}

export default class VoteDialog extends React.Component<VoteDialogProps> {

    constructor(props: VoteDialogProps) {
        super(props);
    }

    onVote(vote: Interface.Vote) {
        rpc({ type: 'player-vote', vote });
    }

    getPlayerName(playerNum: Interface.PlayerNum | undefined) {
        return typeof(playerNum) !== 'undefined' ? this.props.users[this.props.players[playerNum].userId].name : '';
    }

    render() {
        const eligiblePlayers = this.props.players.filter((p) => !p.isExecuted);
        const votedPlayers = eligiblePlayers.filter((p) => p.playerNum !== this.props.playerNum && p.voted).map((p) => <span key={p.playerNum}>{this.getPlayerName(p.playerNum)}</span>);
        const notVotedPlayers = eligiblePlayers.filter((p) => p.playerNum !== this.props.playerNum && !p.voted).map((p) => <span key={p.playerNum}>{this.getPlayerName(p.playerNum)}</span>);
        const whoHasVoted = votedPlayers.length == 0 ? <div>Nobody has voted yet.</div> :
            votedPlayers.length == 1 ? <div>{votedPlayers[0]} has voted.</div> :
                <div>
                    {joinElements(votedPlayers.slice(0, votedPlayers.length - 1))}
                    {' '} and {votedPlayers[votedPlayers.length - 1]} have voted.</div>;
        const whoHasntVoted = notVotedPlayers.length == 0 ? null :
            notVotedPlayers.length == 1 ? <div>{notVotedPlayers[0]} has not voted.</div> :
                <div>
                    {joinElements(notVotedPlayers.slice(0, notVotedPlayers.length - 1))}
                    {' '} and {notVotedPlayers[notVotedPlayers.length - 1]} have not voted.</div>;
        const player = typeof(this.props.playerNum) !== 'undefined' ? this.props.players[this.props.playerNum] : undefined;
        const showVoteButtons = player && !player.isExecuted && !player.voted;
        return (<div className="VoteDialog">
            <div className="label">Election:</div>
            <div className="content">
                {showVoteButtons && <div>
                    <div>You must vote on the government of <b>President {this.getPlayerName(this.props.presidentNum)} and Chancellor {this.getPlayerName(this.props.chancellorNum)}</b>:</div>
                    <input type="button" value="Ja!" onClick={() => this.onVote('ja')}></input>
                    <input type="button" value="Nein!" onClick={() => this.onVote('nein')}></input>
                </div>}
                {!showVoteButtons && player && <div>
                    Waiting for others to vote:
                </div>}
                {!showVoteButtons && !player && <div>
                    Waiting for votes:
                </div>}
                {whoHasVoted}
                {votedPlayers.length > 0 && (whoHasntVoted || <div>You&apos;re the last player to vote.</div>)}
            </div>
        </div>);
    }
}