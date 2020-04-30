import React from 'react';

import './PolicyTrackPanel.scss';

import * as Interface from '../../src/interface';

export interface PolicyTrackPanelProps {
    numPlayers: number;
    liberalPolicies: number;
    fascistPolicies: number;
}

type FascistSlot = Interface.Power | 'victory';

export default class PolicyTrackPanel extends React.Component<PolicyTrackPanelProps> {

    constructor(props: PolicyTrackPanelProps) {
        super(props);
    }

    renderLiberalSlot(p: null | 'victory', i: number) {
        const titleText = p || '';
        return (<div key={i} title={titleText} className={`liberal slot ${p || 'none'} ${i <= this.props.liberalPolicies ? 'token' : ''}`}>
        </div>);
    }

    renderFascistSlot(p: FascistSlot, i: number) {
        const titleText = p || '';
        return (<div key={i} title={titleText} className={`fascist slot ${p || 'none'} ${i <= this.props.fascistPolicies ? 'token' : ''}`}>
        </div>);
    }

    render() {
        const {numPlayers} = this.props;
        const fascistTrack = Interface.PRESIDENTIAL_POWERS_MAP[numPlayers] || [];
        const liberalTrack = new Array(Interface.MAX_LIBERAL_POLICIES_ENACTED).fill(null);
        return (<div className="PolicyTrackPanel">
            <div className="label">Policy Tracks:</div>
            <div className="content">
                <div className="liberal track">
                    {liberalTrack.slice(1).concat('victory').map((p, i) => this.renderLiberalSlot(p, i + 1))}
                </div>
                <div className="fascist track">
                    {(fascistTrack.slice(1) as FascistSlot[]).concat('victory').map((p, i) => this.renderFascistSlot(p, i + 1))}
                </div>
            </div>
        </div>);
    }
}