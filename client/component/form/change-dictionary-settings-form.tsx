//

import {
  ReactElement,
  useCallback,
  useState
} from "react";
import {
  AsyncOrSync
} from "ts-essentials";
import Button from "/client/component/atom/button";
import Input from "/client/component/atom/input";
import Radio from "/client/component/atom/radio";
import RadioGroup from "/client/component/atom/radio-group";
import {
  create
} from "/client/component/create";
import {
  invalidateQueries,
  useIntl,
  usePopup,
  useRequest
} from "/client/component/hook";
import {
  DictionarySettings
} from "/client/skeleton/dictionary";


const ChangeDictionarySettingsForm = create(
  require("./change-dictionary-settings-form.scss"), "ChangeDictionarySettingsForm",
  function <N extends keyof DictionarySettings>({
    number,
    currentSettings,
    propertyName,
    onSubmit
  }: {
    number: number,
    currentSettings: DictionarySettings,
    propertyName: N,
    onSubmit?: () => AsyncOrSync<unknown>
  }): ReactElement | null {

    const [value, setValue] = useState<any>(currentSettings[propertyName]);
    const [, {trans}] = useIntl();
    const {request} = useRequest();
    const [, {addInformationPopup}] = usePopup();

    const handleClick = useCallback(async function (): Promise<void> {
      const settings = {[propertyName]: value};
      const response = await request("changeDictionarySettings", {number, settings});
      if (response.status === 200) {
        addInformationPopup(`dictionarySettingsChanged.${propertyName}`);
        await onSubmit?.();
        await invalidateQueries("fetchDictionary", (data) => data.number === number);
      }
    }, [number, propertyName, value, request, onSubmit, addInformationPopup]);

    if (propertyName === "punctuations") {
      return null;
    } else if (propertyName === "pronunciationTitle") {
      const node = (
        <form styleName="root input">
          <Input label={trans("changeDictionarySettingsForm.pronunciationTitle")} value={value} onSet={(value) => setValue(value)}/>
          <Button label={trans("changeDictionarySettingsForm.confirm")} reactive={true} onClick={handleClick}/>
        </form>
      );
      return node;
    } else if (propertyName === "exampleTitle") {
      const node = (
        <form styleName="root input">
          <Input label={trans("changeDictionarySettingsForm.exampleTitle")} value={value} onSet={(value) => setValue(value)}/>
          <Button label={trans("changeDictionarySettingsForm.confirm")} reactive={true} onClick={handleClick}/>
        </form>
      );
      return node;
    } else if (propertyName === "enableMarkdown") {
      const node = (
        <form styleName="root radio">
          <RadioGroup name="enableMarkdown" value={value} onSet={(value) => setValue(value)}>
            <Radio value={true} label={trans("changeDictionarySettingsForm.enableMarkdownTrue")}/>
            <Radio value={false} label={trans("changeDictionarySettingsForm.enableMarkdownFalse")}/>
          </RadioGroup>
          <Button label={trans("changeDictionarySettingsForm.confirm")} reactive={true} onClick={handleClick}/>
        </form>
      );
      return node;
    } else {
      return null;
    }

  }
);


export default ChangeDictionarySettingsForm;