//

import {BaseSyntheticEvent, useMemo} from "react";
import {UseFormReturn} from "react-hook-form";
import {Asserts, object, string} from "yup";
import {useForm} from "/client-new/hook/form";
import {invalidateResponses, useRequest} from "/client-new/hook/request";
import {useToast} from "/client-new/hook/toast";
import {Dictionary} from "/client-new/skeleton";
import {switchResponse} from "/client-new/util/response";


const SCHEMA = object({
  name: string().required()
});
type FormValue = Asserts<typeof SCHEMA>;

export type ChangeDictionaryNameSpec = {
  form: UseFormReturn<FormValue>,
  handleSubmit: (event: BaseSyntheticEvent) => void
};

export function useChangeDictionaryName(dictionary: Dictionary): ChangeDictionaryNameSpec {
  const form = useForm<FormValue>(SCHEMA, {name: dictionary.name}, {});
  const request = useRequest();
  const {dispatchSuccessToast} = useToast();
  const handleSubmit = useMemo(() => form.handleSubmit(async (value) => {
    const response = await request("changeDictionaryName", {number: dictionary.number, name: value.name});
    await switchResponse(response, async () => {
      dispatchSuccessToast("changeDictionaryName");
      await invalidateResponses("fetchDictionary", (data) => data.number === dictionary.number);
    });
  }), [dictionary.number, request, form, dispatchSuccessToast]);
  return {form, handleSubmit};
}