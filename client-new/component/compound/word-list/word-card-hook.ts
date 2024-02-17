//

import {faTrashAlt} from "@fortawesome/sharp-regular-svg-icons";
import {useCallback} from "react";
import {useTrans} from "zographia";
import {useCommonAlert} from "/client-new/hook/alert";
import {invalidateResponses, useRequest} from "/client-new/hook/request";
import {useToast} from "/client-new/hook/toast";
import {Dictionary, Word} from "/client-new/skeleton";
import {switchResponse} from "/client-new/util/response";


export function useDiscardWord(dictionary: Dictionary, word: Word): () => void {
  const {trans} = useTrans("wordList");
  const request = useRequest();
  const openAlert = useCommonAlert();
  const {dispatchSuccessToast} = useToast();
  const doRequest = useCallback(async function (): Promise<void> {
    const number = dictionary.number;
    const wordNumber = word.number;
    const response = await request("discardWord", {number, wordNumber});
    await switchResponse(response, async () => {
      await invalidateResponses("searchWord", (query) => query.number === dictionary.number);
      dispatchSuccessToast("discardWord");
    });
  }, [dictionary.number, word.number, request, dispatchSuccessToast]);
  const execute = useCallback(function (): void {
    openAlert({
      message: trans("dialog.discard.message"),
      confirmLabel: trans("dialog.discard.confirm"),
      confirmIcon: faTrashAlt,
      onConfirm: doRequest
    });
  }, [doRequest, openAlert, trans]);
  return execute;
}