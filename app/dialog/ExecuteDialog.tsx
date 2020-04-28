import React from 'react';

import './ExecuteDialog.scss';

import * as Interface from '../../src/interface';
import { rpc } from '..';

export interface ExecuteDialogProps {
    users: Interface.UserMap;
    players: Interface.Player[];
    playerNum: Interface.PlayerNum;
}

export default class ExecuteDialog extends React.Component<ExecuteDialogProps> {

    constructor(props: ExecuteDialogProps) {
        super(props);
    }

    onChoose(player: Interface.Player) {
        rpc({ type: 'president-execute-player', targetNum: player.playerNum as number });
    }

    getPlayerName(playerNum: Interface.PlayerNum | undefined) {
        return typeof(playerNum) !== 'undefined' ? this.props.users[this.props.players[playerNum].userId].name : '';
    }

    render() {
        const eligiblePlayers = this.props.players
            .filter((player) => !player.isExecuted && player.playerNum !== this.props.playerNum);
        return (<div className="ExecuteDialog">
            <div className="label">Choose Someone to Investigate</div>
            <div className="content">
                <div>As President, you must execute someone:</div>
                {eligiblePlayers.map((p) => <div key={p.playerNum}><input type="button" value={this.getPlayerName(p.playerNum)} onClick={() => this.onChoose(p)}></input></div>)}
            </div>
        </div>);
    }
}