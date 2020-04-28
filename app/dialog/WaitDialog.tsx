import React from 'react';

import './WaitDialog.scss';

import * as Interface from '../../src/interface';

export interface WaitDialogProps {
    message: string;
}

export default class WaitDialog extends React.Component<WaitDialogProps> {

    constructor(props: WaitDialogProps) {
        super(props);
    }

    render() {
        return (<div className="WaitDialog">
            <div className="label">Waiting</div>
            <div className="content">{this.props.message}</div>
        </div>);
    }
}