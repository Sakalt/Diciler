//

import * as react from "react";
import {
  ReactNode
} from "react";
import {
  Button,
  Input
} from "/client/component/atom";
import {
  StoreComponent
} from "/client/component/component";
import {
  InformationPane
} from "/client/component/compound";
import {
  applyStyle,
  inject,
  route
} from "/client/component/decorator";
import {
  getMessage
} from "/client/component/message";
import {
  createValidate
} from "/client/util/misc";
import {
  EMAIL_REGEXP,
  IDENTIFIER_REGEXP,
  validatePassword as rawValidatePassword
} from "/server/model/validation";


@route @inject
@applyStyle(require("./login-form.scss"))
export class RegisterForm extends StoreComponent<Props, State> {

  public state: State = {
    name: "",
    email: "",
    password: "",
    errorType: null
  };

  private async performRegister(): Promise<void> {
    let name = this.state.name;
    let email = this.state.email;
    let password = this.state.password;
    let response = await this.requestPost("registerUser", {name, email, password}, true);
    let body = response.data;
    if (response.status === 200) {
      let loginResponse = await this.login({name, password});
      if (loginResponse.status === 200) {
        this.replacePath("/dashboard");
      } else {
        this.setState({errorType: "loginFailed"});
      }
    } else if (response.status === 400 && "error" in body) {
      this.setState({errorType: body.type});
    } else {
      this.setState({errorType: "unexpected"});
    }
  }

  public render(): ReactNode {
    let errorType = this.state.errorType;
    let errorNode = (errorType !== null) && (
      <div styleName="error">
        <InformationPane texts={[getMessage(errorType)]} style="error" onClose={() => this.setState({errorType: null})}/>
      </div>
    );
    let validateName = createValidate(IDENTIFIER_REGEXP, getMessage("invalidUserName"));
    let validateEmail = createValidate(EMAIL_REGEXP, getMessage("invalidEmail"));
    let validatePassword = createValidate(rawValidatePassword, getMessage("invalidPassword"));
    let node = (
      <div>
        {errorNode}
        <form styleName="root">
          <Input label="ユーザー名" value={this.state.name} validate={validateName} onSet={(name) => this.setState({name})}/>
          <Input label="メールアドレス" value={this.state.email} validate={validateEmail} onSet={(email) => this.setState({email})}/>
          <Input label="パスワード" type="flexible" value={this.state.password} validate={validatePassword} onSet={(password) => this.setState({password})}/>
          <div styleName="button-group">
            <Button label="新規登録" reactive={true} onClick={this.performRegister.bind(this)}/>
          </div>
        </form>
      </div>
    );
    return node;
  }

}


type Props = {
};
type State = {
  name: string,
  email: string,
  password: string,
  errorType: string | null
};