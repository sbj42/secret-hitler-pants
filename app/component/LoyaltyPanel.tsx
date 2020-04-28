import React from 'react';

import './LoyaltyPanel.scss';

import * as Interface from '../../src/interface';
import { joinElements } from '../util';

export interface LoyaltyPanelProps {
    users: Interface.UserMap;
    players: Interface.Player[];
    playerSecrets: Interface.PlayerSecrets;
}

export default class LoyaltyPanel extends React.Component<LoyaltyPanelProps> {

    constructor(props: LoyaltyPanelProps) {
        super(props);
    }

    getPlayerName(playerNum: Interface.PlayerNum | undefined) {
        return typeof(playerNum) !== 'undefined' ? this.props.users[this.props.players[playerNum].userId].name : '';
    }

    render() {
        const {loyalty, isHitler, knownFascistNums, knownHitlerNum} = this.props.playerSecrets;
        const loyaltyClass = isHitler ? 'hitler' : loyalty;
        const loyaltyText = isHitler ? 'HITLER' : loyalty === 'fascist' ? 'a FASCIST' : 'a LIBERAL';
        const showHitler = typeof(knownHitlerNum) !== 'undefined';
        const hitlerText = typeof(knownHitlerNum) !== 'undefined' ? this.getPlayerName(knownHitlerNum) : '';
        const knownFascistsSpans = knownFascistNums.map((p) => <span key={p} className="fascist">
            {this.getPlayerName(p)}
        </span>);
        return (<div className={`LoyaltyPanel ${loyaltyClass}-face`}>
            <div className="label">Loyalty:</div>
            <div className="content">
                <div>You are <span className={loyaltyClass}>{loyaltyText}</span>.</div>
                {showHitler && <div className="knownHitler"><span className="hitler">{hitlerText}</span> is Hitler.</div>}
                {knownFascistNums.length == 0 ? null :
                    knownFascistNums.length == 1 ? <div className="knownFascists">{knownFascistsSpans[0]} is the other fascist.</div> :
                        <div className="knownFascists">
                            {joinElements(knownFascistsSpans.slice(0, knownFascistsSpans.length - 1))}
                            {' '} and {knownFascistsSpans[knownFascistsSpans.length - 1]} are also fascists.</div>}
            </div>
        </div>);
    }
}