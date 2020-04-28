import React from 'react';

import './FactsPanel.scss';

import * as Interface from '../../src/interface';

export interface FactsPanelProps {
    numPlayers: number;
    electionTracker: number;
    policyCards: number;
    policiesEnacted: {
        liberal: number;
        fascist: number;
    };
}

export default class FactsPanel extends React.Component<FactsPanelProps> {

    constructor(props: FactsPanelProps) {
        super(props);
    }

    render() {
        const {numPlayers, electionTracker, policyCards, policiesEnacted} = this.props;
        const numLiberals = Interface.NUM_LIBERALS_MAP[numPlayers];
        const numFascists = Interface.NUM_FASCISTS_MAP[numPlayers];
        return (<div className="FactsPanel">
            <div className="label">Game status:</div>
            <div className="content">
                <div>There are <span className="liberal">{numLiberals} liberals</span> and <span className="fascist">{numFascists} fascists</span> (one of whom is Hitler).</div>
                <div>The election tracker is at {electionTracker}/{Interface.MAX_ELECTION_TRACKER}.</div>
                <div><span className="liberal">{policiesEnacted.liberal}/{Interface.MAX_LIBERAL_POLICIES_ENACTED} liberal policies</span> and <span className="fascist">{policiesEnacted.fascist}/{Interface.MAX_FASCIST_POLICIES_ENACTED} fascist policies</span> have been enacted.</div>
                {policyCards === 1 ? <div>There is 1 card left in the policy deck.</div> : <div>There are {policyCards} cards left in the policy deck.</div>}
            </div>
        </div>);
    }
}