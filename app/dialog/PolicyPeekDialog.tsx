import React from 'react';

import './PolicyPeekDialog.scss';

import * as Interface from '../../src/interface';
import { rpc } from '..';

export interface PolicyPeekDialogProps {
    cards: Interface.Cards;
}

export default class PolicyPeekDialog extends React.Component<PolicyPeekDialogProps> {

    constructor(props: PolicyPeekDialogProps) {
        super(props);
    }

    onOk() {
        rpc({ type: 'president-policy-peek-complete' });
    }

    renderCard(card: Interface.Loyalty) {
        return card === 'liberal' ? 'Liberal' : 'Fascist';
    }

    render() {
        return (<div className="PolicyPeekDialog">
            <div className="label">Peek at the Policies</div>
            <div className="content">
                <div>As President you may look at the next three cards of the policy deck:</div>
                <div>{this.renderCard(this.props.cards[0])}</div>
                <div>{this.renderCard(this.props.cards[1])}</div>
                <div>{this.renderCard(this.props.cards[2])}</div>
                <input type="button" value="OK" onClick={() => this.onOk()}></input>
            </div>
        </div>);
    }
}