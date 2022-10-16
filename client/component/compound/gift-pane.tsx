//

import {
  ReactElement,
  useCallback
} from "react";
import Button from "/client/component/atom/button";
import {
  create
} from "/client/component/create";
import {
  useIntl
} from "/client/component/hook";


const GiftPane = create(
  require("./gift-pane.scss"), "GiftPane",
  function ({
  }: {
  }): ReactElement {

    const [, {trans}] = useIntl();

    const jumpAmazon = useCallback(function (): void {
      const url = "https://www.amazon.jp/hz/wishlist/ls/2WIWDYWRY374L?ref_=wl_share";
      window.open(url);
    }, []);

    const node = (
      <div styleName="root">
        <div styleName="information">
          {trans("giftPane.information")}
        </div>
        <div styleName="button">
          <Button label={trans("giftPane.sendGift")} iconName="gift" onClick={jumpAmazon}/>
        </div>
      </div>
    );
    return node;

  }
);


export default GiftPane;