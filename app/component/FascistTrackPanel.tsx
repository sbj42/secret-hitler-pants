import React from 'react';

import './FascistTrackPanel.scss';

import * as Interface from '../../src/interface';

export interface FascistTrackPanelProps {
    numPlayers: number;
    fascistPolicies: number;
}

type Slot = Interface.Power | 'victory';

export default class FascistTrackPanel extends React.Component<FascistTrackPanelProps> {

    constructor(props: FascistTrackPanelProps) {
        super(props);
    }

    renderSlot(p: Slot, i: number) {
        const titleText = p || '';
        return (<div key={i} title={titleText} className={`power ${p || 'none'} ${i <= this.props.fascistPolicies ? 'token' : ''}`}>
        </div>);
    }

    render() {
        const {numPlayers} = this.props;
        const powers = Interface.PRESIDENTIAL_POWERS_MAP[numPlayers] || [];
        return (<div className="FascistTrackPanel">
            <div className="label">Fascist Track:</div>
            <div className="content">
                {(powers.slice(1) as Slot[]).concat('victory').map((p, i) => this.renderSlot(p, i + 1))}
            </div>
        </div>);
    }
}