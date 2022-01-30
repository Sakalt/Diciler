//

import * as react from "react";
import {
  Fragment,
  MouseEvent,
  ReactElement,
  Suspense,
  lazy,
  useCallback,
  useState
} from "react";
import {
  AsyncOrSync
} from "ts-essentials";
import Alert from "/client/component/atom/alert";
import Button from "/client/component/atom/button";
import WhitePane from "/client/component/compound/white-pane";
import {
  create
} from "/client/component/create";
import {
  useIntl,
  usePopup,
  useRequest
} from "/client/component/hook";
import {
  Commission
} from "/client/skeleton/commission";
import {
  EditableWord,
  EnhancedDictionary
} from "/client/skeleton/dictionary";


let WordEditor = lazy(() => import("/client/component/compound/word-editor-beta"));


const CommissionPane = create(
  require("./commission-pane.scss"), "CommissionPane",
  function ({
    commission,
    dictionary,
    onDiscardConfirm,
    onAddConfirm
  }: {
    commission: Commission,
    dictionary: EnhancedDictionary,
    onDiscardConfirm?: (event: MouseEvent<HTMLButtonElement>) => AsyncOrSync<void>,
    onAddConfirm?: (word: EditableWord, event: MouseEvent<HTMLButtonElement>) => AsyncOrSync<void>
  }): ReactElement {

    let [alertOpen, setAlertOpen] = useState(false);
    let [editorOpen, setEditorOpen] = useState(false);
    let [, {trans}] = useIntl();
    let {request} = useRequest();
    let [, {addInformationPopup}] = usePopup();

    let discardCommission = useCallback(async function (event: MouseEvent<HTMLButtonElement>, showPopup?: boolean): Promise<void> {
      let number = dictionary.number;
      let id = commission.id;
      let response = await request("discardCommission", {number, id});
      if (response.status === 200) {
        if (showPopup === undefined || showPopup) {
          addInformationPopup("commissionDiscarded");
        }
        await onDiscardConfirm?.(event);
      }
    }, [dictionary.number, commission, request, onDiscardConfirm, addInformationPopup]);

    let handleEditConfirm = useCallback(async function (word: EditableWord, event: MouseEvent<HTMLButtonElement>): Promise<void> {
      await discardCommission(event, false);
      await onAddConfirm?.(word, event);
    }, [onAddConfirm, discardCommission]);

    let name = commission.name;
    let comment = commission.comment;
    let commentNode = (comment !== undefined && comment !== "") && (
      <div styleName="comment">
        {comment}
      </div>
    );
    let node = (
      <Fragment>
        <WhitePane clickable={false}>
          <div>
            <div styleName="name">{name}</div>
            {commentNode}
          </div>
          <div styleName="button">
            <Button label={trans("commissionPane.discard")} iconName="trash-alt" style="simple" onClick={() => setAlertOpen(true)}/>
            <Button label={trans("commissionPane.add")} iconName="plus" style="simple" onClick={() => setEditorOpen(true)}/>
          </div>
        </WhitePane>
        <Alert
          text={trans("commissionPane.alert")}
          confirmLabel={trans("commissionPane.discard")}
          open={alertOpen}
          outsideClosable={true}
          onClose={() => setAlertOpen(false)}
          onConfirm={discardCommission}
        />
        <Suspense fallback="">
          <WordEditor
            dictionary={dictionary}
            word={null}
            defaultEquivalentName={commission.name}
            open={editorOpen}
            onClose={() => setEditorOpen(false)}
            onEditConfirm={handleEditConfirm}
          />
        </Suspense>
      </Fragment>
    );
    return node;

  }
);


export default CommissionPane;