import { baseApi } from "@/app/baseApi.ts"
import type { BaseResponse } from "@/common/types"
import type { LoginInputs } from "@/features/auth/lib/schemas"

//captcha
export interface CaptchaResponse {
  url: string
}
//captcha

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<BaseResponse<{ userId: number; token: string }>, LoginInputs>({
      query: (body) => ({ method: "post", url: "auth/login", body }),
    }),
    logout: builder.mutation<BaseResponse, void>({
      query: () => ({ method: "delete", url: "auth/login" }),
    }),
    me: builder.query<BaseResponse<{ id: number; email: string; login: string }>, void>({
      query: () => "auth/me",
    }),
    //captcha
    getCaptchaUrl: builder.query({
      query: () => "security/get-captcha-url",
    }),
    //captcha
  }),
})

export const { useLoginMutation, useLogoutMutation, useMeQuery, useGetCaptchaUrlQuery} = authApi
