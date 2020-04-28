import React from 'react';

import './Legislating2Dialog.scss';

import * as Interface from '../../src/interface';
import { rpc } from '..';

let _inputId = 0;
function nextId() {
    return ++_inputId;
}

export interface Legislating2DialogProps {
    agenda: Interface.Cards;
}

export interface Legislating2DialogState {
    checks: boolean[];
}

export default class Legislating2Dialog extends React.Component<Legislating2DialogProps, Legislating2DialogState> {

    private _inputId: number;

    constructor(props: Legislating2DialogProps) {
        super(props);
        this._inputId = nextId();
        this.state = {
            checks: [false, false],
        };
    }

    onCheck(ev: React.ChangeEvent<HTMLInputElement>, index: number) {
        const checks = [...this.state.checks];
        checks[index] = ev.target.checked;
        this.setState({ checks });
    }

    onOk() {
        const index = this.state.checks.indexOf(true);
        const enactPolicy = this.props.agenda[index];
        rpc({ type: 'chancellor-enact-policy', enactPolicy });
    }

    renderCard(card: Interface.Loyalty) {
        return card === 'liberal' ? 'Liberal' : 'Fascist';
    }

    render() {
        const okEnabled = this.state.checks.filter((c) => c).length === 1;
        return (<div className="Legislating2Dialog">
            <div className="label">Choose a Policy Card</div>
            <div className="content">
                <div>As Chancellor you must choose a policy card to enact:</div>
                <div>(Remember: no communication during this phase)</div>
                <input type="checkbox" id={`leg1_${this._inputId}a`} checked={this.state.checks[0]} onChange={(ev) => this.onCheck(ev, 0)}></input><label htmlFor={`leg1_${this._inputId}a`}>{this.renderCard(this.props.agenda[0])}</label><br />
                <input type="checkbox" id={`leg1_${this._inputId}b`} checked={this.state.checks[1]} onChange={(ev) => this.onCheck(ev, 1)}></input><label htmlFor={`leg1_${this._inputId}b`}>{this.renderCard(this.props.agenda[1])}</label><br />
                <input type="button" value="OK" disabled={!okEnabled} onClick={() => this.onOk()}></input>
            </div>
        </div>);
    }
}