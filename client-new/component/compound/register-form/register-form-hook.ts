//

import {BaseSyntheticEvent, useMemo} from "react";
import {UseFormReturn} from "react-hook-form";
import {useNavigate} from "react-router-dom";
import {Asserts, boolean, object, string} from "yup";
import {useLoginRequest} from "/client-new/hook/auth";
import {useForm} from "/client-new/hook/form";
import {useRequest} from "/client-new/hook/request";
import {useToast} from "/client-new/hook/toast";
import {IDENTIFIER_REGEXP} from "/client-new/util/validation";
import type {RequestData} from "/server/controller/internal/type";


const SCHEMA = object({
  name: string().matches(IDENTIFIER_REGEXP, "nameInvalid").max(30, "nameTooLong").required("nameRequired"),
  email: string().email("emailInvalid").required("emailRequired"),
  password: string().min(6, "passwordTooShort").max(50, "passwordTooLong").required("passwordRequired"),
  agree: boolean().oneOf([true], "agreeRequired")
});
const DEFAULT_VALUE = {
  name: "",
  email: "",
  password: "",
  agree: false
} satisfies FormValue;
type FormValue = Asserts<typeof SCHEMA>;

export type RegisterFormSpec = {
  form: UseFormReturn<FormValue>,
  handleSubmit: (event: BaseSyntheticEvent) => void
};

export function useRegisterForm(): RegisterFormSpec {
  const form = useForm<FormValue>(SCHEMA, DEFAULT_VALUE, {});
  const request = useRequest();
  const login = useLoginRequest();
  const {dispatchSuccessToast} = useToast();
  const navigate = useNavigate();
  const handleSubmit = useMemo(() => form.handleSubmit(async (value) => {
    const response = await request("registerUser", getQuery(value), {useRecaptcha: true});
    if (response.status === 200 && !("error" in response.data)) {
      const body = response.data;
      const loginResponse = await login({name: body.name, password: value.password});
      if (loginResponse.status === 200) {
        dispatchSuccessToast("register");
        navigate(`/user/${body.name}`);
      }
    }
  }), [request, login, navigate, form, dispatchSuccessToast]);
  return {form, handleSubmit};
}

function getQuery(value: FormValue): Omit<RequestData<"registerUser">, "recaptchaToken"> {
  const query = {
    name: value.name || "",
    email: value.email || "",
    password: value.password || ""
  };
  return query;
}