//

import {
  Fragment,
  ReactElement,
  useCallback,
  useState
} from "react";
import {
  AsyncOrSync
} from "ts-essentials";
import Button from "/client/component/atom/button";
import Input from "/client/component/atom/input";
import {
  ValidationSpec
} from "/client/component/atom/input";
import {
  create
} from "/client/component/create";
import {
  invalidateQueries,
  useIntl,
  usePopup,
  useRequest,
  useTrans
} from "/client/component/hook";
import {
  PopupUtil
} from "/client/util/popup";
import {
  IDENTIFIER_REGEXP
} from "/server/model/validation";


const ChangeDictionaryParamNameForm = create(
  require("./change-dictionary-param-name-form.scss"), "ChangeDictionaryParamNameForm",
  function ({
    number,
    currentParamName,
    onSubmit
  }: {
    number: number,
    currentParamName: string | undefined,
    onSubmit?: () => AsyncOrSync<unknown>
  }): ReactElement {

    const [paramName, setParamName] = useState(currentParamName ?? "");
    const intl = useIntl();
    const {trans} = useTrans("changeDictionaryParamNameForm");
    const {request} = useRequest();
    const {addInformationPopup} = usePopup();

    const handleClick = useCallback(async function (): Promise<void> {
      const response = await request("changeDictionaryParamName", {number, paramName});
      if (response.status === 200) {
        addInformationPopup("dictionaryParamNameChanged");
        await onSubmit?.();
        await invalidateQueries("fetchDictionary", (data) => data.number === number);
      }
    }, [number, paramName, request, onSubmit, addInformationPopup]);

    const validate = useCallback(function (value: string): ValidationSpec | null {
      if (value === "" || value.match(IDENTIFIER_REGEXP)) {
        return null;
      } else {
        const message = PopupUtil.getMessage(intl, "invalidDictionaryParamName");
        return {scheme: "red", iconName: "exclamation-triangle", message};
      }
    }, [intl]);

    const nextUrl = "http://zpdic.ziphil.com/dictionary/" + (paramName || number);
    const node = (
      <Fragment>
        <form styleName="root">
          <Input label={trans("paramName")} value={paramName} validate={validate} onSet={(paramName) => setParamName(paramName)}/>
          <Button label={trans("confirm")} reactive={true} onClick={handleClick}/>
        </form>
        <p styleName="url">
          {nextUrl}
        </p>
      </Fragment>
    );
    return node;

  }
);


export default ChangeDictionaryParamNameForm;