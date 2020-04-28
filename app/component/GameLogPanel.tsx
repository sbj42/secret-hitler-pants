import React from 'react';

import './GameLogPanel.scss';

import * as Interface from '../../src/interface';

export interface GameLogPanelProps {
    log: Interface.LogEntry[];
}

export default class GameLogPanel extends React.Component<GameLogPanelProps> {

    private lastItem: HTMLDivElement | null = null;

    constructor(props: GameLogPanelProps) {
        super(props);
    }

    private renderLogEntryPart(p: Interface.LogEntryPart, key: number) {
        let className: string | undefined;
        let text: string;
        if (typeof(p) === 'string') {
            text = p;
        } else {
            text = p.text;
            className = p.style;
        }
        return (<span className={className} key={key}>{text}</span>);
    }

    private renderLogEntry(e: Interface.LogEntry, key: number) {
        return (<div className="entry" key={key}>
            {e.map((e, i) => this.renderLogEntryPart(e, i))}
        </div>);
    }

    componentDidMount() {
        this.scrollToBottom();
    }
    componentDidUpdate() {
        this.scrollToBottom();
    }

    private scrollToBottom() {
        if (this.lastItem) {
            this.lastItem.scrollIntoView({
                behavior: 'smooth',
            });
        }
    }

    render() {
        return (<div className="GameLogPanel">
            <div className="label">Game Log</div>
            <div className="content">
                <div className="outer">
                    {this.props.log.map((e, i) => this.renderLogEntry(e, i))}
                    <div ref={(el) => this.lastItem = el}></div>
                </div>
            </div>
        </div>);
    }
}