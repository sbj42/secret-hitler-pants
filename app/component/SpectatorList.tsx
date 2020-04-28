import React from 'react';

import './SpectatorList.scss';

import * as Interface from '../../src/interface';

export interface SpectatorListProps {
    users: Interface.UserMap;
    userId: Interface.UserId;
}

export default class SpectatorList extends React.Component<SpectatorListProps> {

    constructor(props: SpectatorListProps) {
        super(props);
    }

    private renderSpectator(spectator: Interface.User) {
        if (!spectator.connected) {
            return null;
        }
        const nameText = spectator.name || `User ${spectator.userId}`;
        const isMe = spectator.userId === this.props.userId;
        const meClass = isMe ? 'me' : '';
        const anonClass = !spectator.name ? 'anonymous' : '';
        return (<tr className="spectator" key={spectator.userId}>
            <td className={`name ${meClass} ${anonClass}`}>{nameText}</td>
        </tr>);
    }

    render() {
        // sort by name
        const spectators = [...Object.values(this.props.users).filter((u) => u.status === 'spectator')];
        spectators.sort(Interface.compareUsersByName);
        return (<div className="SpectatorList">
            <div className="label">Spectators:</div>
            <table className="content">
                <tbody>
                    {spectators.map((p) => this.renderSpectator(p))}
                </tbody>
            </table>
        </div>);
    }
}