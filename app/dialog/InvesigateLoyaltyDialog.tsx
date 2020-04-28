import React from 'react';

import './InvestigateLoyaltyDialog.scss';

import * as Interface from '../../src/interface';
import { rpc } from '..';

export interface InvestigateLoyaltyDialogProps {
    users: Interface.UserMap;
    players: Interface.Player[];
    playerNum: Interface.PlayerNum;
}

export default class InvestigateLoyaltyDialog extends React.Component<InvestigateLoyaltyDialogProps> {

    constructor(props: InvestigateLoyaltyDialogProps) {
        super(props);
    }

    onChoose(player: Interface.Player) {
        rpc({ type: 'president-investigate-player', targetNum: player.playerNum });
    }

    getPlayerName(playerNum: Interface.PlayerNum | undefined) {
        return typeof(playerNum) !== 'undefined' ? this.props.users[this.props.players[playerNum].userId].name : '';
    }

    render() {
        const eligiblePlayers = this.props.players
            .filter((player) => !player.isExecuted && player.playerNum !== this.props.playerNum && !player.isInvestigated);
        const ineligiblePlayers = this.props.players
            .filter((player) => !player.isExecuted && player.playerNum !== this.props.playerNum && player.isInvestigated);
        return (<div className="InvestigateLoyaltyDialog">
            <div className="label">Choose Someone to Investigate</div>
            <div className="content">
                <div>As President, you must investigate someone&apos;s loyalty:</div>
                {ineligiblePlayers.map((p) => <div key={p.playerNum}>{this.getPlayerName(p.playerNum)} is not eligible because they have already been investigated.</div>)}
                {eligiblePlayers.map((p) => <div key={p.playerNum}><input type="button" value={this.getPlayerName(p.playerNum)} onClick={() => this.onChoose(p)}></input></div>)}
            </div>
        </div>);
    }
}