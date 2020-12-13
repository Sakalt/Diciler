//

import * as react from "react";
import {
  FocusEvent,
  MouseEvent,
  ReactNode
} from "react";
import Component from "/client/component/component";
import {
  style
} from "/client/component/decorator";


@style(require("./dropdown.scss"), {clickOutside: true})
export default class Dropdown<V> extends Component<Props<V>, State<V>> {

  public static defaultProps: DefaultProps = {
    open: false,
    autoMode: "focus"
  };
  public state: State<V> = {
    open: false
  };

  private handleMouseDown(value: V, event: MouseEvent<HTMLDivElement>): void {
    if (this.props.onClick) {
      this.props.onClick(event);
    }
    if (this.props.onSet) {
      this.props.onSet(value);
    }
  }

  private handleClick(event: MouseEvent<HTMLDivElement>): void {
    if (this.props.autoMode === "click") {
      this.setState({open: true});
      if (this.props.onOpen) {
        this.props.onOpen(event);
      }
    }
  }

  private handleClickOutside(event: MouseEvent<unknown>): void {
    if (this.props.autoMode === "click") {
      this.setState({open: false});
      if (this.props.onClose) {
        this.props.onClose(event);
      }
    }
  }

  private handleFocus(event: FocusEvent<HTMLDivElement>): void {
    if (this.props.autoMode === "focus") {
      this.setState({open: true});
      if (this.props.onOpen) {
        this.props.onOpen(event);
      }
    }
  }

  private handleBlur(event: FocusEvent<HTMLDivElement>): void {
    if (this.props.autoMode === "focus") {
      this.setState({open: false});
      if (this.props.onClose) {
        this.props.onClose(event);
      }
    }
  }

  public render(): ReactNode {
    let open = (this.props.autoMode !== null) ? this.state.open : this.props.open;
    let itemNodes = this.props.specs.map((spec, index) => {
      let itemNode = (
        <div styleName="suggestion-item" key={index} tabIndex={0} onMouseDown={(event) => this.handleMouseDown(spec.value, event)}>
          {spec.node}
        </div>
      );
      return itemNode;
    });
    let suggestionNode = (open && this.props.specs.length > 0) && (
      <div styleName="suggestion">
        {itemNodes}
      </div>
    );
    let node = (
      <div styleName="root" className={this.props.className}>
        <div onClick={this.handleClick.bind(this)} onFocus={this.handleFocus.bind(this)} onBlur={this.handleBlur.bind(this)}>
          {this.props.children}
        </div>
        {suggestionNode}
      </div>
    );
    return node;
  }

}


type Props<V> = {
  specs: Array<DropdownSpec<V>>,
  open: boolean,
  autoMode: "focus" | "click" | null,
  onClick?: (event: MouseEvent<HTMLDivElement>) => void,
  onOpen?: (event: FocusEvent<HTMLDivElement> | MouseEvent<HTMLDivElement>) => void,
  onClose?: (event: FocusEvent<HTMLDivElement> | MouseEvent<unknown>) => void,
  onSet?: (value: V) => void,
  className?: string
};
type DefaultProps = {
  open: boolean,
  autoMode: "focus" | "click" | null
};
type State<V> = {
  open: boolean
};

export type DropdownSpec<V> = {value: V, node: ReactNode};