//

import * as react from "react";
import {
  ChangeEvent,
  ReactElement,
  useCallback
} from "react";
import {
  create
} from "/client/component/create";


export const Radio = create(
  require("./radio.scss"), "Radio",
  function ({
    name,
    value,
    label,
    checked,
    onSet,
    onChange,
    className
  }: {
    name: string,
    value: string,
    label: string,
    checked: boolean,
    onSet?: (checked: boolean) => void,
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void,
    className?: string
  }): ReactElement {

    const handleChange = useCallback(function (event: ChangeEvent<HTMLInputElement>): void {
      onSet?.(event.target.checked);
      onChange?.(event);
    }, [onSet, onChange]);

    const node = (
      <label styleName="root" className={className}>
        <input styleName="original" type="radio" name={name} value={value} checked={checked} onChange={handleChange}/>
        <div styleName="box">
          <div styleName="icon"/>
        </div>
        <span styleName="label">{label}</span>
      </label>
    );
    return node;

  }
);


export default Radio;