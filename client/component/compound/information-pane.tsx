//

import * as react from "react";
import {
  ReactNode
} from "react";
import {
  Component
} from "/client/component/component";
import {
  applyStyle
} from "/client/component/decorator";


@applyStyle(require("./information-pane.scss"))
export class InformationPane extends Component<Props, State> {

  public render(): ReactNode {
    let itemNodes = this.props.texts.map((text, index) => {
      return <li key={index}>{text}</li>;
    });
    let styleNames = ["root", this.props.style];
    let node = (
      <ul styleName={styleNames.join(" ")}>
        {itemNodes}
      </ul>
    );
    return node;
  }

}


type Props = {
  texts: Array<string>,
  style: "error" | "information"
};
type State = {
};