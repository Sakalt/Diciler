//

import {faCheck} from "@fortawesome/sharp-regular-svg-icons";
import {ReactElement} from "react";
import {AdditionalProps, Button, ButtonIconbag, ControlContainer, GeneralIcon, Textarea, useTrans} from "zographia";
import {create} from "/client-new/component/create";
import {Dictionary} from "/client-new/skeleton";
import {useChangeDictionarySource} from "./change-dictionary-source-form-hook";


export const ChangeDictionarySourceForm = create(
  require("../common.scss"), "ChangeDictionarySourceForm",
  function ({
    dictionary,
    language,
    ...rest
  }: {
    dictionary: Dictionary,
    language: "akrantiain" | "zatlin",
    className?: string
  } & AdditionalProps): ReactElement {

    const {trans} = useTrans("changeDictionarySourceForm");

    const {form, handleSubmit} = useChangeDictionarySource(dictionary, language);
    const {register} = form;

    return (
      <form styleName="root" {...rest}>
        <ControlContainer>
          <Textarea styleName="textarea" fontFamily="monospace" {...register("source")}/>
        </ControlContainer>
        <div>
          <Button variant="light" type="submit" onClick={handleSubmit}>
            <ButtonIconbag><GeneralIcon icon={faCheck}/></ButtonIconbag>
            {trans(":commonForm.button.change")}
          </Button>
        </div>
      </form>
    );

  }
);