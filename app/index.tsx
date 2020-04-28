import React from 'react';
import ReactDOM from 'react-dom';

import * as Interface from '../src/interface';
import Ui from './Ui';

{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const m = module as any;
    if (m.hot) {
        m.hot.accept();
    }
}

export function log(msg: string) {
    if (process.env.NODE_ENV === 'development') {
        console.log(msg);
    }
}

export interface DisconnectedMessage {
    type: 'disconnected';
}

export type MessageListener = (message: Interface.ServerMessage | DisconnectedMessage, state: Interface.ClientState | null) => void;

let LISTENER: MessageListener;
let SOCKET: WebSocket;

export function rpc(message: Interface.ClientMessage) {
    log(`sending "${message.type}" ${JSON.stringify(message)}`);
    const msg = JSON.stringify(message);
    SOCKET.send(msg);
}

const HEARTBEAT_INTERVAL = 45 * 1000;

function heartbeat() {
    SOCKET.send('');
}

export function connect(listener: MessageListener) {
    SOCKET = new WebSocket((window.location.protocol === 'https:' ? 'wss:' : 'ws:') + '//' + window.location.host + window.location.pathname);
    LISTENER = listener;

    let heartbeatInterval = setInterval(heartbeat, HEARTBEAT_INTERVAL);

    SOCKET.addEventListener('open', () => {
        log(`connected`);
    });
    SOCKET.addEventListener('message', (e) => {
        clearInterval(heartbeatInterval);
        heartbeatInterval = setInterval(heartbeat, HEARTBEAT_INTERVAL);
        const {message, state} = JSON.parse(e.data);
        log(`got: "${message.type}" ${JSON.stringify(message)}`);
        LISTENER(message, state);
    });
    SOCKET.addEventListener('close', () => {
        clearInterval(heartbeatInterval);
        log(`disconnected`);
        LISTENER({ type: 'disconnected' }, null);
    });
}

ReactDOM.render(<Ui connect={connect} />, document.getElementById('ui'));