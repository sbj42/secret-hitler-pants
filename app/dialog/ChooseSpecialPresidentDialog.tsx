import React from 'react';

import './ChooseSpecialPresidentDialog.scss';

import * as Interface from '../../src/interface';
import { rpc } from '..';

export interface ChooseSpecialPresidentDialogProps {
    users: Interface.UserMap;
    players: Interface.Player[];
    playerNum: Interface.PlayerNum;
}

export default class ChooseSpecialPresidentDialog extends React.Component<ChooseSpecialPresidentDialogProps> {

    constructor(props: ChooseSpecialPresidentDialogProps) {
        super(props);
    }

    onChoose(player: Interface.Player) {
        rpc({ type: 'president-call-special-election', nextPresidentNum: player.playerNum });
    }

    getPlayerName(playerNum: Interface.PlayerNum | undefined) {
        return typeof(playerNum) !== 'undefined' ? this.props.users[this.props.players[playerNum].userId].name : '';
    }

    render() {
        const eligiblePlayers = this.props.players
            .filter((player) => !player.isExecuted && player.playerNum !== this.props.playerNum);
        return (<div className="ChooseSpecialPresidentDialog">
            <div className="label">Nominate the Next Presidential Candidate</div>
            <div className="content">
                <div>As President, you must nominate the Presidential Candidate for a special election:</div>
                {eligiblePlayers.map((p) => <div key={p.playerNum}><input type="button" value={this.getPlayerName(p.playerNum)} onClick={() => this.onChoose(p)}></input></div>)}
            </div>
        </div>);
    }
}