//

import {
  ReactElement
} from "react";
import Link from "/client/component/atom/link";
import {
  create
} from "/client/component/create";
import {
  useTrans
} from "/client/component/hook";


const Footer = create(
  require("./footer.scss"), "Footer",
  function ({
  }: {
  }): ReactElement {

    const {trans} = useTrans("footer");

    const date = new Date();
    const yearString = date.getFullYear().toString();
    const node = (
      <footer styleName="root">
        <div styleName="content">
          <div styleName="left">
            <div styleName="copyright">
              © 2020–{yearString} Ziphil<br/>
            </div>
            <div styleName="copyright recaptcha">
              This site is protected by reCAPTCHA.<br/>
              The Google <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Privacy Policy</a> and <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer">Terms of Service</a> apply.
            </div>
          </div>
          <div styleName="right">
            <div>
              <Link styleName="link" href="/notification" style="plane">{trans("notification")}</Link>
            </div>
            <div>
              <Link styleName="link" href="/document" style="plane">{trans("document")}</Link>
            </div>
            <div/>
            <div>
              <Link styleName="link" href="/contact" style="plane">{trans("contact")}</Link>
            </div>
          </div>
        </div>
      </footer>
    );
    return node;

  }
);


export default Footer;