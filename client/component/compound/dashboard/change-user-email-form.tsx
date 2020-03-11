//

import {
  inject,
  observer
} from "mobx-react";
import * as react from "react";
import {
  MouseEvent,
  ReactNode
} from "react";
import {
  withRouter
} from "react-router-dom";
import {
  Button,
  Input
} from "/client/component/atom";
import {
  ComponentBase
} from "/client/component/component";
import {
  GlobalStore
} from "/client/component/store";
import {
  applyStyle
} from "/client/util/decorator";
import * as http from "/client/util/http";


@inject("store") @observer
@applyStyle(require("./change-user-email-form.scss"))
class ChangeUserEmailFormBase extends ComponentBase<{store?: GlobalStore} & Props, State> {

  public state: State = {
    email: ""
  };

  public constructor(props: any) {
    super(props);
    let email = this.props.currentEmail;
    this.state = {email};
  }

  private async click(event: MouseEvent<HTMLElement>): Promise<void> {
    let email = this.state.email;
    let response = await http.post("changeUserEmail", {email});
    this.props.store!.sendInformation("emailChanged");
    if (this.props.onSubmit) {
      this.props.onSubmit();
    }
  }

  public render(): ReactNode {
    let node = (
      <form styleName="root">
        <Input label="メールアドレス" initialValue={this.props.currentEmail} onSet={(value) => this.setState({email: value})}/>
        <Button label="変更" onClick={this.click.bind(this)}/>
      </form>
    );
    return node;
  }

}


type Props = {
  currentEmail: string,
  onSubmit?: () => void
};
type State = {
  email: string
};

export let ChangeUserEmailForm = withRouter(ChangeUserEmailFormBase);