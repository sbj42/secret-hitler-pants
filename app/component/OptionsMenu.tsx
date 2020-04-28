import React from 'react';

import './OptionsMenu.scss';

import * as Interface from '../../src/interface';

export interface OptionsMenuProps {
    canChangeName: boolean;
    onChangeName: () => void;
}

export interface OptionsMenuState {
    open: boolean;
}

export default class OptionsMenu extends React.Component<OptionsMenuProps, OptionsMenuState> {

    constructor(props: OptionsMenuProps) {
        super(props);
        this.state = {
            open: false,
        };
    }

    toggleMenu() {
        this.setState({ open: !this.state.open });
    }

    render() {
        const showChangeName = this.props.canChangeName;
        if (!showChangeName) {
            return null;
        }
        return (<div className="OptionsMenu">
            <a onClick={() => this.toggleMenu()}>Options</a><br/>
            {this.state.open && <div id="options_menu" className="item_list">
                {showChangeName && <a onClick={this.props.onChangeName}>Change name</a>}
            </div>}
        </div>);
    }
}