//

import {BaseSyntheticEvent, useMemo} from "react";
import {Asserts, object, string} from "yup";
import {UseFormReturn, useForm} from "/client-new/hook/form";
import {useRequest} from "/client-new/hook/request";
import {useToast} from "/client-new/hook/toast";
import {DetailedUser} from "/client-new/skeleton";
import {switchResponse} from "/client-new/util/response";


const SCHEMA = object({
  currentPassword: string().required("currentRequired"),
  newPassword: string().min(6, "tooShort").max(50, "tooLong").required("newRequired")
});
type FormValue = Asserts<typeof SCHEMA>;

export type ChangeMyPasswordSpec = {
  form: UseFormReturn<FormValue>,
  handleSubmit: (event: BaseSyntheticEvent) => void
};

export function useChangeMyPassword(me: DetailedUser): ChangeMyPasswordSpec {
  const form = useForm<FormValue>(SCHEMA, {currentPassword: "", newPassword: ""}, {});
  const request = useRequest();
  const {dispatchSuccessToast} = useToast();
  const handleSubmit = useMemo(() => form.handleSubmit(async (value) => {
    const response = await request("changeUserPassword", {password: value.newPassword});
    await switchResponse(response, async () => {
      dispatchSuccessToast("changeMyPassword");
    });
  }), [request, form, dispatchSuccessToast]);
  return {form, handleSubmit};
}