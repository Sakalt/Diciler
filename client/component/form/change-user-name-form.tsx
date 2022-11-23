//

import {
  Fragment,
  ReactElement
} from "react";
import Button from "/client/component/atom/button";
import Input from "/client/component/atom/input";
import {
  create
} from "/client/component/create";
import {
  useTrans
} from "/client/component/hook";


const ChangeUserNameForm = create(
  require("./change-user-name-form.scss"), "ChangeUserNameForm",
  function ({
    currentName,
    onSubmit
  }: {
    currentName: string | undefined,
    onSubmit?: () => void
  }): ReactElement {

    const {trans} = useTrans("changeUserNameForm");

    const node = (
      <Fragment>
        <form styleName="root">
          <Input label={trans("name")} value={currentName} disabled={true}/>
          <Button label={trans("confirm")} disabled={true}/>
        </form>
      </Fragment>
    );
    return node;

  }
);


export default ChangeUserNameForm;