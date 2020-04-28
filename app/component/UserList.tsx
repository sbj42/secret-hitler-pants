import React from 'react';

import './UserList.scss';

import * as Interface from '../../src/interface';

export interface UserListProps {
    users: Interface.UserMap;
    userId: Interface.UserId;
}

function getStatusClass(status: Interface.Status) {
    return status === 'ready' ? 'ready' : status === 'spectator' ? 'spectator' : 'not_ready';
}

export default class UserList extends React.Component<UserListProps> {

    constructor(props: UserListProps) {
        super(props);
    }

    private renderUser(user: Interface.User) {
        const nameText = user.name || `User ${user.userId}`;
        const isMe = user.userId === this.props.userId;
        const meClass = isMe ? 'me' : '';
        const anonClass = !user.name ? 'anonymous' : '';
        const stateText = !user.connected ? 'disconnected' : user.status;
        const stateClass = !user.connected ? 'disconnected' : getStatusClass(user.status);
        return (<tr className="user" key={user.userId}>
            <td className={`name ${meClass} ${anonClass}`}>{nameText}</td>
            <td className={`state ${stateClass}`}>{stateText}</td>
        </tr>);
    }

    render() {
        // sort by name
        const users = [...Object.values(this.props.users)];
        users.sort(Interface.compareUsersByName);
        return (<div className="UserList">
            <div className="label">Users:</div>
            <table className="content">
                <tbody>
                    {users.map((u) => this.renderUser(u))}
                </tbody>
            </table>
        </div>);
    }
}