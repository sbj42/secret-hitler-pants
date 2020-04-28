import React from 'react';

import './Legislating1Dialog.scss';

import * as Interface from '../../src/interface';
import { rpc } from '..';

let _inputId = 0;
function nextId() {
    return ++_inputId;
}

export interface Legislating1DialogProps {
    cards: Interface.Cards;
}

export interface Legislating1DialogState {
    checks: boolean[];
}

export default class Legislating1Dialog extends React.Component<Legislating1DialogProps, Legislating1DialogState> {

    private _inputId: number;

    constructor(props: Legislating1DialogProps) {
        super(props);
        this._inputId = nextId();
        this.state = {
            checks: [false, false, false],
        };
    }

    onCheck(ev: React.ChangeEvent<HTMLInputElement>, index: number) {
        const checks = [...this.state.checks];
        checks[index] = ev.target.checked;
        this.setState({ checks });
    }

    onOk() {
        const index = this.state.checks.indexOf(false);
        const discardPolicy = this.props.cards[index];
        rpc({ type: 'president-set-agenda', discardPolicy });
    }

    renderCard(card: Interface.Loyalty) {
        return card === 'liberal' ? 'Liberal' : 'Fascist';
    }

    render() {
        const okEnabled = this.state.checks.filter((c) => c).length === 2;
        return (<div className="Legislating1Dialog">
            <div className="label">Choose Two Policy Cards</div>
            <div className="content">
                <div>As President you must choose two policy cards out of these three:</div>
                <div>(Remember: no communication during this phase)</div>
                <input type="checkbox" id={`leg1_${this._inputId}a`} checked={this.state.checks[0]} onChange={(ev) => this.onCheck(ev, 0)}></input><label htmlFor={`leg1_${this._inputId}a`}>{this.renderCard(this.props.cards[0])}</label><br />
                <input type="checkbox" id={`leg1_${this._inputId}b`} checked={this.state.checks[1]} onChange={(ev) => this.onCheck(ev, 1)}></input><label htmlFor={`leg1_${this._inputId}b`}>{this.renderCard(this.props.cards[1])}</label><br />
                <input type="checkbox" id={`leg1_${this._inputId}c`} checked={this.state.checks[2]} onChange={(ev) => this.onCheck(ev, 2)}></input><label htmlFor={`leg1_${this._inputId}c`}>{this.renderCard(this.props.cards[2])}</label><br />
                <input type="button" value="OK" disabled={!okEnabled} onClick={() => this.onOk()}></input>
            </div>
        </div>);
    }
}