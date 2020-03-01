//

import * as react from "react";
import {
  ReactNode
} from "react";
import {
  withRouter
} from "react-router-dom";
import {
  DictionaryListBody
} from "../../../server/type/dictionary";
import {
  applyStyle
} from "../../util/decorator";
import * as http from "../../util/http";
import {
  ComponentBase
} from "../component";
import {
  DictionaryList,
  Header,
  Menu
} from "../compound";


@applyStyle(require("./dashboard-page.scss"))
class DashboardPageBase extends ComponentBase<Props, State, Params> {

  public state: State = {
    dictionaries: []
  };

  protected async fetch(): Promise<void> {
    let response = await http.get<DictionaryListBody>("/api/dictionary/list");
    let dictionaries = response.data;
    this.setState({dictionaries});
  }

  public render(): ReactNode {
    let mode = this.props.match?.params.mode || "dictionary";
    let contentNode;
    if (mode === "dictionary") {
      contentNode = <DictionaryList dictionaries={this.state.dictionaries}/>;
    } else {
      contentNode = "Nothing";
    }
    let node = (
      <div styleName="dashboard-page">
        <Header/>
        <div styleName="content-wrapper">
          <Menu mode={mode}/>
          <div styleName="content">
            {contentNode}
          </div>
        </div>
      </div>
    );
    return node;
  }

}


type Props = {
};
type State = {
  dictionaries: DictionaryListBody;
};
type Params = {
  mode: string
};

export let DashboardPage = withRouter(DashboardPageBase);