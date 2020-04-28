import React from 'react';

import './PlayerList.scss';

import * as Interface from '../../src/interface';

export interface PlayerListProps {
    users: Interface.UserMap;
    players: Interface.Player[];
    playerNum: Interface.PlayerNum | undefined;
    presidentNum: Interface.PlayerNum;
    chancellorNum: Interface.PlayerNum | undefined;
}

export default class PlayerList extends React.Component<PlayerListProps> {

    constructor(props: PlayerListProps) {
        super(props);
    }

    private renderPlayer(player: Interface.Player) {
        const user = this.props.users[player.userId];
        const nameText = user.name;
        const isConnected = user.connected;
        const isMe = player.playerNum === this.props.playerNum;
        const meClass = isMe ? 'me' : '';
        const isPresident = player.playerNum === this.props.presidentNum;
        const isChancellor = player.playerNum === this.props.chancellorNum;
        const roleText = !isConnected ? 'disconnected' : player.isExecuted ? 'executed' : isPresident ? 'President' : isChancellor ? 'Chancellor' : '';
        const roleClass = !isConnected ? 'disconnected' : player.isExecuted ? 'executed' : isPresident ? 'president' : isChancellor ? 'chancellor' : '';
        return (<tr className="player" key={player.playerNum}>
            <td className={`name ${meClass}`}>{nameText}</td>
            <td className={`role ${roleClass}`}>{roleText}</td>
        </tr>);
    }

    render() {
        return (<div className="PlayerList">
            <div className="label">Players:</div>
            <table className="content">
                <tbody>
                    {this.props.players.map((p) => this.renderPlayer(p))}
                </tbody>
            </table>
        </div>);
    }
}