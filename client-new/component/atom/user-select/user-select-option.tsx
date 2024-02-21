/* eslint-disable no-useless-computed-key */

import {ReactElement} from "react";
import {AsyncSelectOption, SingleLineText} from "zographia";
import {UserAvatar} from "/client-new/component/atom/user-avatar";
import {create} from "/client-new/component/create";
import {User} from "/client-new/skeleton";


export const UserSelectOption = create(
  require("./user-select-option.scss"), "UserSelectOption",
  function ({
    user,
    ...rest
  }: {
    user: User,
    className?: string
  }): ReactElement {

    return (
      <AsyncSelectOption styleName="root" {...rest}>
        <div styleName="avatar">
          <UserAvatar user={user}/>
        </div>
        <div styleName="name-container">
          <SingleLineText styleName="screen-name">{user.screenName}</SingleLineText>
          <SingleLineText styleName="name">@{user.name}</SingleLineText>
        </div>
      </AsyncSelectOption>
    );

  }
);