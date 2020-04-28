import React from 'react';

import './ChancellorConsiderVetoDialog.scss';

import * as Interface from '../../src/interface';
import { rpc } from '..';

export interface ChancellorConsiderVetoDialogProps {
    agenda: Interface.Cards;
}

export default class ChancellorConsiderVetoDialog extends React.Component<ChancellorConsiderVetoDialogProps> {

    constructor(props: ChancellorConsiderVetoDialogProps) {
        super(props);
    }

    onPropose() {
        rpc({ type: 'chancellor-propose-veto' });
    }

    onReject() {
        rpc({ type: 'chancellor-reject-veto' });
    }

    renderCard(card: Interface.Loyalty) {
        return card === 'liberal' ? 'Liberal' : 'Fascist';
    }

    render() {
        return (<div className="ChancellorConsiderVetoDialog">
            <div className="label">Consider a Veto</div>
            <div className="content">
                <div>The President has passed you this agenda:</div>
                <div>{this.renderCard(this.props.agenda[0])}</div>
                <div>{this.renderCard(this.props.agenda[1])}</div>
                <div>As Chancellor you may propose to veto it:</div>
                <div>(Remember: no communication during this phase)</div>
                <input type="button" value="Propose Veto" onClick={() => this.onPropose()}></input>
                <input type="button" value="Enact a Policy" onClick={() => this.onReject()}></input>
            </div>
        </div>);
    }
}