//

import * as react from "react";
import {
  Fragment,
  ReactElement,
  ReactNode,
  useState
} from "react";
import HotkeyHelp from "/client/component/compound/hotkey-help";
import {
  create
} from "/client/component/create";
import {
  useHotkey,
  usePath
} from "/client/component/hook";


const InnerRoot = create(
  null, "InnerRoot",
  function ({
    children
  }: {
    children?: ReactNode
  }): ReactElement {

    let [hotkeyHelpOpen, setHotkeyHelpOpen] = useState(false);
    let {pushPath} = usePath();

    useHotkey("jumpDictionaryListPage", "globalNavigation", ["g d"], () => pushPath("/list"));
    useHotkey("jumpNotificationListPage", "globalNavigation", ["g n"], () => pushPath("/notification"));
    useHotkey("jumpDocumentPage", "globalNavigation", ["g h"], () => pushPath("/document"));
    useHotkey("jumpContactPage", "globalNavigation", ["g c"], () => pushPath("/contact"));
    useHotkey("jumpLanguagePage", "globalNavigation", ["g l"], () => pushPath("/language"));
    useHotkey("showHotkeyHelp", "general", ["?"], () => {
      setHotkeyHelpOpen(true);
    });
    useHotkey("unfocus", "general", ["esc"], () => {
      let activeElement = document.activeElement;
      if (activeElement instanceof HTMLElement) {
        activeElement.blur();
      }
    });

    let node = (
      <Fragment>
        {children}
        <HotkeyHelp open={hotkeyHelpOpen} onClose={() => setHotkeyHelpOpen(false)}/>
      </Fragment>
    );
    return node;

  }
);


export default InnerRoot;