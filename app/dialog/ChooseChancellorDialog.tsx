import React from 'react';

import './ChooseChancellorDialog.scss';

import * as Interface from '../../src/interface';
import { rpc } from '..';

export interface ChooseChancellorDialogProps {
    users: Interface.UserMap;
    players: Interface.Player[];
    playerNum: Interface.PlayerNum;
    lastPresidentNum: Interface.PlayerNum | undefined;
    lastChancellorNum: Interface.PlayerNum | undefined;
}

export default class ChooseChancellorDialog extends React.Component<ChooseChancellorDialogProps> {

    constructor(props: ChooseChancellorDialogProps) {
        super(props);
    }

    onChoose(player: Interface.Player) {
        rpc({ type: 'president-choose-chancellor', chancellorNum: player.playerNum });
    }

    getPlayerName(playerNum: Interface.PlayerNum | undefined) {
        return typeof(playerNum) !== 'undefined' ? this.props.users[this.props.players[playerNum].userId].name : '';
    }

    render() {
        const playersRemaining = Interface.getPlayersRemaining(this.props.players);
        const eligiblePlayers = this.props.players
            .filter((player) => (playersRemaining <= Interface.MAX_PLAYERS_WHERE_LAST_PRESIDENT_CAN_BE_CHANCELLOR || player.playerNum !== this.props.lastPresidentNum)
                                 && !player.isExecuted
                                 && player.playerNum !== this.props.lastChancellorNum
                                 && player.playerNum !== this.props.playerNum);
        const showPresidentIneligible = playersRemaining > Interface.MAX_PLAYERS_WHERE_LAST_PRESIDENT_CAN_BE_CHANCELLOR && typeof(this.props.lastPresidentNum) !== 'undefined' && this.props.lastPresidentNum !== this.props.playerNum && !this.props.players[this.props.lastPresidentNum].isExecuted;
        const showChancellorIneligible = typeof(this.props.lastChancellorNum) !== 'undefined' && this.props.lastChancellorNum !== this.props.playerNum && !this.props.players[this.props.lastChancellorNum].isExecuted;
        return (<div className="ChooseChancellorDialog">
            <div className="label">Choose a Chancellor</div>
            <div className="content">
                <div>As Presidential Candidate, you must choose a Chancellor Candidate:</div>
                {showPresidentIneligible && <div>{this.getPlayerName(this.props.lastPresidentNum)} is not eligible because they were the last President.</div>}
                {showChancellorIneligible && <div>{this.getPlayerName(this.props.lastChancellorNum)} is not eligible because they were the last Chancellor.</div>}
                {eligiblePlayers.map((p) => <div key={p.playerNum}><input type="button" value={this.getPlayerName(p.playerNum)} onClick={() => this.onChoose(p)}></input></div>)}
            </div>
        </div>);
    }
}