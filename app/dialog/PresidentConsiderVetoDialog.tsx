import React from 'react';

import './PresidentConsiderVetoDialog.scss';

import * as Interface from '../../src/interface';
import { rpc } from '..';

export interface PresidentConsiderVetoDialogProps {
    agenda: Interface.Cards;
}

export default class PresidentConsiderVetoDialog extends React.Component<PresidentConsiderVetoDialogProps> {

    constructor(props: PresidentConsiderVetoDialogProps) {
        super(props);
    }

    onPropose() {
        rpc({ type: 'president-accept-veto' });
    }

    onReject() {
        rpc({ type: 'president-reject-veto' });
    }

    renderCard(card: Interface.Loyalty) {
        return card === 'liberal' ? 'Liberal' : 'Fascist';
    }

    render() {
        return (<div className="PresidentConsiderVetoDialog">
            <div className="label">Consider a Veto</div>
            <div className="content">
                <div>The Chancellor has proposed to veto this agenda.  As President you may decide:</div>
                <div>(Remember: no communication during this phase)</div>
                <input type="button" value="Accept Veto" onClick={() => this.onPropose()}></input>
                <input type="button" value="Reject Veto" onClick={() => this.onReject()}></input>
                <div>(The agenda is: {this.renderCard(this.props.agenda[0])}, {this.renderCard(this.props.agenda[1])})</div>
            </div>
        </div>);
    }
}