import React from 'react';

import './NameDialog.scss';

import * as Interface from '../../src/interface';
import { rpc } from '..';

export interface NameDialogProps {
    users: Interface.UserMap;
    userId: Interface.UserId;
    onNameChanged: () => void;
}

export interface NameDialogState {
    name: string;
}

export default class NameDialog extends React.Component<NameDialogProps, NameDialogState> {

    constructor(props: NameDialogProps) {
        super(props);
        this.state = {
            name: props.users[props.userId].name,
        };
    }

    private nameCheck() {
        const name = this.state.name.trim();
        if (name === this.props.users[this.props.userId].name) {
            return name;
        }
        const otherUsers = Interface.enumerateUsers(this.props.users).filter((u) => u.connected && u.userId !== this.props.userId);
        if (name.length < Interface.MIN_NAME || name.length > Interface.MAX_NAME || otherUsers.findIndex((u) => u.name.toLowerCase() == name.toLowerCase()) >= 0) {
            return null;
        }
        return name;
    }

    private onOk() {
        const name = this.nameCheck();
        if (name) {
            rpc({ type: 'user-set-name', name });
            this.props.onNameChanged();
        }
    }

    private onFocus(ev: React.FocusEvent<HTMLInputElement>) {
        ev.target.select();
    }

    private onKeyUp(ev: React.KeyboardEvent<HTMLInputElement>) {
        if (ev.keyCode === 13) {
            this.onOk();
        }
    }

    private onChange(ev: React.ChangeEvent<HTMLInputElement>) {
        this.setState({ name: ev.target.value });
    }

    render() {
        // todo: select when this becomes visible
        return (<div className="NameDialog">
            <div className="label">Enter your name:</div>
            <input type="text"
                value={this.state.name}
                autoFocus
                onFocus={(ev) => this.onFocus(ev)}
                onKeyUp={(ev) => this.onKeyUp(ev)}
                onChange={(ev) => this.onChange(ev)}
            />
            <input type="button" value="OK"
                onClick={() => this.onOk()}
                disabled={!this.nameCheck()}
            />
        </div>);
    }
}