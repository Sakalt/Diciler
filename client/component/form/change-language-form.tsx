//

import * as react from "react";
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
import Radio from "/client/component/atom/radio";
import RadioGroup from "/client/component/atom/radio-group";
import {
  create
} from "/client/component/create";
import {
  useIntl,
  useLocale
} from "/client/component/hook";
import {
  LANGUAGES
} from "/client/language";


const ChangeLanguageForm = create(
  require("./change-language-form.scss"), "ChangeLanguageForm",
  function ({
    onSubmit
  }: {
    onSubmit?: () => AsyncOrSync<unknown>
  }): ReactElement {

    const [currentLocale, changeCurrentLocale] = useLocale();
    const [locale, setLocale] = useState(currentLocale);
    const [, {trans}] = useIntl();

    const handleClick = useCallback(async function (): Promise<void> {
      changeCurrentLocale(locale);
      await onSubmit?.();
    }, [locale, changeCurrentLocale, onSubmit]);

    const node = (
      <Fragment>
        <form styleName="root">
          <RadioGroup name="theme" value={locale} onSet={setLocale}>
            {LANGUAGES.map((language) => <Radio key={language.locale} value={language.locale} label={language.name}/>)}
          </RadioGroup>
          <Button label={trans("changeLanguageForm.confirm")} reactive={true} onClick={handleClick}/>
        </form>
        <p styleName="caution">
          {trans("changeLanguageForm.caution")}
        </p>
      </Fragment>
    );
    return node;

  }
);


export default ChangeLanguageForm;