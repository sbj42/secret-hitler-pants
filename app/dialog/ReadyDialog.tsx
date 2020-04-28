import React from 'react';

import './ReadyDialog.scss';

import * as Interface from '../../src/interface';
import { rpc } from '..';

export interface ReadyDialogProps {
    users: Interface.UserMap;
    userId: Interface.UserId;
}

export default class ReadyDialog extends React.Component<ReadyDialogProps> {

    constructor(props: ReadyDialogProps) {
        super(props);
    }

    onClick(status: Interface.Status) {
        const user = this.props.users[this.props.userId];
        if (status !== user.status) {
            rpc({ type: 'user-set-status', status });
        }
    }

    render() {
        const user = this.props.users[this.props.userId];
        const eligibleUsers = Interface.enumerateUsers(this.props.users).filter((u) => u.status !== 'spectator' && u.connected);
        const readyUsers = Interface.enumerateUsers(this.props.users).filter((u) => u.status === 'ready');
        let msg: string;
        if (eligibleUsers.length < Interface.MIN_PLAYERS) {
            msg = `Cannot start with fewer than ${Interface.MIN_PLAYERS} players.  Waiting for ${Interface.MIN_PLAYERS - eligibleUsers.length} new users to join.`;
        } else if (eligibleUsers.length > Interface.MAX_PLAYERS) {
            msg = `Cannot start with more than ${Interface.MAX_PLAYERS} players.  Waiting for ${eligibleUsers.length - Interface.MAX_PLAYERS} non-players to click SPECTATE.`;
        } else {
            msg = `We can start a ${eligibleUsers.length}-player game.  Waiting for ${eligibleUsers.length - readyUsers.length} players to click READY.`;
        }
        const readyActive = user.status === 'ready' ? 'active' : '';
        const spectateActive = user.status === 'spectator' ? 'active' : '';
        const notReadyActive = user.status === 'not ready' ? 'active' : '';
        return (<div className="ReadyDialog">
            <div className="label">Getting Ready</div>
            <div className="content">
                <div>{msg}</div>
                <input type="button" className={`button ready ${readyActive}`} value="READY" onClick={() => this.onClick('ready')}/>
                <input type="button" className={`button not_ready ${notReadyActive}`} value="NOT READY" onClick={() => this.onClick('not ready')}/>
                <input type="button" className={`button spectator ${spectateActive}`} value="SPECTATE" onClick={() => this.onClick('spectator')}/>
            </div>
        </div>);
    }
}