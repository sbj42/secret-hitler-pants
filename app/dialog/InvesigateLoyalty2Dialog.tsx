import React from 'react';

import './InvestigateLoyalty2Dialog.scss';

import * as Interface from '../../src/interface';
import { rpc } from '..';

export interface InvestigateLoyalty2DialogProps {
    users: Interface.UserMap;
    players: Interface.Player[];
    investigation: Interface.Investigation;
}

export default class InvestigateLoyalty2Dialog extends React.Component<InvestigateLoyalty2DialogProps> {

    constructor(props: InvestigateLoyalty2DialogProps) {
        super(props);
    }

    onOk() {
        rpc({ type: 'president-investigation-complete' });
    }

    getPlayerName(playerNum: Interface.PlayerNum | undefined) {
        return typeof(playerNum) !== 'undefined' ? this.props.users[this.props.players[playerNum].userId].name : '';
    }

    render() {
        return (<div className="InvestigateLoyalty2Dialog">
            <div className="label">Investigation Results</div>
            <div className="content">
                <div>{this.getPlayerName(this.props.investigation.targetNum)} is {this.props.investigation.loyalty === 'liberal' ? 'a LIBERAL' : 'a FASCIST'}.</div>
                <input type="button" value="OK" onClick={() => this.onOk()} />
            </div>
        </div>);
    }
}