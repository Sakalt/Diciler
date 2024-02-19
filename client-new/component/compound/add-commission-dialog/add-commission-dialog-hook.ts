//

import {BaseSyntheticEvent, useMemo} from "react";
import {UseFormReturn} from "react-hook-form";
import {Asserts, object, string} from "yup";
import {useForm} from "/client-new/hook/form";
import {invalidateResponses, useRequest} from "/client-new/hook/request";
import {useToast} from "/client-new/hook/toast";
import {Dictionary} from "/client-new/skeleton";
import {switchResponse} from "/client-new/util/response";
import type {RequestData} from "/server/controller/internal/type";


const SCHEMA = object({
  name: string().required("nameRequired"),
  comment: string()
});
const DEFAULT_VALUE = {
  name: ""
} satisfies FormValue;
type FormValue = Asserts<typeof SCHEMA>;

export type AddCommissionSpec = {
  form: UseFormReturn<FormValue>,
  handleSubmit: (event: BaseSyntheticEvent) => Promise<void>
};

export function useAddCommission(dictionary: Dictionary, onSubmit?: () => unknown): AddCommissionSpec {
  const form = useForm<FormValue>(SCHEMA, DEFAULT_VALUE, {});
  const request = useRequest();
  const {dispatchSuccessToast} = useToast();
  const handleSubmit = useMemo(() => form.handleSubmit(async (value) => {
    const response = await request("addCommission", getQuery(dictionary, value), {useRecaptcha: true});
    await switchResponse(response, async (body) => {
      await invalidateResponses("fetchCommissions", (query) => query.number === dictionary.number);
      await onSubmit?.();
      dispatchSuccessToast("addCommission");
    });
  }), [dictionary, onSubmit, request, form, dispatchSuccessToast]);
  return {form, handleSubmit};
}

function getQuery(dictionary: Dictionary, value: FormValue): Omit<RequestData<"addCommission">, "recaptchaToken"> {
  const query = {
    number: dictionary.number,
    name: value.name,
    comment: value.comment
  } satisfies Omit<RequestData<"addCommission">, "recaptchaToken">;
  return query;
}