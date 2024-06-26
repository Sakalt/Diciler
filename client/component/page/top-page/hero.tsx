//

import {faBook, faSignInAlt, faUser} from "@fortawesome/sharp-regular-svg-icons";
import {ReactElement} from "react";
import {AdditionalProps, GeneralIcon, LinkIconbag, MultiLineText, useTrans} from "zographia";
import {Link} from "/client/component/atom/link";
import {Logo} from "/client/component/atom/logo";
import {create} from "/client/component/create";
import {useMe} from "/client/hook/auth";


export const Hero = create(
  require("./hero.scss"), "Hero",
  function ({
    ...rest
  }: {
    className?: string
  } & AdditionalProps): ReactElement {

    const {trans, transNode} = useTrans("topPage");

    const me = useMe();

    return (
      <div styleName="root" {...rest}>
        <Logo styleName="logo"/>
        <MultiLineText styleName="catch" is="p" lineHeight="narrowFixed">
          {transNode("catch", {
            line: (parts) => <span styleName="catch-line">{parts}</span>,
            wbr: <wbr/>
          })}
        </MultiLineText>
        <div styleName="button-group">
          {(me !== null) ? (
            <Link styleName="button" href={`/user/${me.name}`} scheme="secondary" variant="light">
              <LinkIconbag><GeneralIcon icon={faUser}/></LinkIconbag>
              {trans("button.userPage")}
            </Link>
          ) : (
            <Link styleName="button" href="/login" scheme="secondary" variant="light">
              <LinkIconbag><GeneralIcon icon={faSignInAlt}/></LinkIconbag>
              {trans("button.login")}
            </Link>
          )}
          <Link styleName="link" href="/dictionary" variant="simple">
            <LinkIconbag><GeneralIcon icon={faBook}/></LinkIconbag>
            {trans("button.dictionary")}
          </Link>
        </div>
      </div>
    );

  }
);
