//

import dayjs from "dayjs";
import {ReactElement, useMemo} from "react";
import {AdditionalProps, Link, MultiLineText} from "zographia";
import {create} from "/client-new/component/create";


export const Footer = create(
  require("./footer.scss"), "Footer",
  function ({
    ...rest
  }: {
    className?: string
  } & AdditionalProps): ReactElement {

    const yearString = useMemo(() => dayjs().get("year").toString(), []);

    return (
      <footer styleName="root" {...rest}>
        <div styleName="left">
          <div styleName="copyright">
            © 2020–{yearString} Ziphil<br/>
          </div>
          <MultiLineText styleName="recaptcha" lineHeight="short">
            This site is protected by reCAPTCHA.<br/>
            The Google <Link href="https://policies.google.com/privacy" scheme="gray" variant="underline" target="_blank">Privacy Policy</Link> and <Link href="https://policies.google.com/terms" scheme="gray" variant="underline" target="_blank">Terms of Service</Link> apply.
          </MultiLineText>
        </div>
        <div styleName="right">
        </div>
      </footer>
    );

  }
);