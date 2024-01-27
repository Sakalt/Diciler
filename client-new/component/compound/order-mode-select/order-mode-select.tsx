//

import {ReactElement} from "react";
import {AdditionalProps, Select, SelectOption, useTrans} from "zographia";
import {create} from "/client-new/component/create";


export const OrderModeSelect = create(
  require("./order-mode-select.scss"), "OrderModeSelect",
  function <M extends OrderMode>({
    orderMode,
    orderModeOptions,
    unicodeAlt = "unicode",
    onSet,
    ...rest
  }: {
    orderMode: M,
    orderModeOptions: ReadonlyArray<M>,
    unicodeAlt?: "unicode" | "dictionaryName" | "wordName",
    onSet?: (orderMode: M) => unknown,
    className?: string
  } & AdditionalProps): ReactElement {

    const {trans} = useTrans("orderModeSelect");

    return (
      <Select styleName="root" value={orderMode} onSet={onSet} {...rest}>
        {(orderModeOptions.includes("unicode" as M)) && (
          <SelectOption value="unicode" label={trans(unicodeAlt)}>
            {trans(unicodeAlt)}
          </SelectOption>
        )}
        {(orderModeOptions.includes("custom" as M)) && (
          <SelectOption value="custom" label={trans("custom")}>
            {trans("custom")}
          </SelectOption>
        )}
        {(orderModeOptions.includes("updatedDate" as M)) && (
          <SelectOption value="updatedDate" label={trans("updatedDate")}>
            {trans("updatedDate")}
          </SelectOption>
        )}
        {(orderModeOptions.includes("createdDate" as M)) && (
          <SelectOption value="createdDate" label={trans("createdDate")}>
            {trans("createdDate")}
          </SelectOption>
        )}
      </Select>
    );

  }
);


export type OrderMode = "unicode" | "custom" | "createdDate" | "updatedDate";