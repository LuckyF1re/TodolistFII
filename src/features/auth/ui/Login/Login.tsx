import { selectThemeMode, setIsLoggedInAC } from "@/app/app-slice"
import { AUTH_TOKEN } from "@/common/constants"
import { ResultCode } from "@/common/enums"
import { useAppDispatch, useAppSelector } from "@/common/hooks"
import { getTheme } from "@/common/theme"
import { useGetCaptchaUrlQuery, useLoginMutation } from "@/features/auth/api/authApi"
import { type LoginInputs, loginSchema } from "@/features/auth/lib/schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import Button from "@mui/material/Button"
import Checkbox from "@mui/material/Checkbox"
import FormControl from "@mui/material/FormControl"
import FormControlLabel from "@mui/material/FormControlLabel"
import FormGroup from "@mui/material/FormGroup"
import FormLabel from "@mui/material/FormLabel"
import Grid from "@mui/material/Grid"
import TextField from "@mui/material/TextField"
import { Controller, type SubmitHandler, useForm } from "react-hook-form"
import styles from "./Login.module.css"
import { useEffect, useState } from "react"

export const Login = () => {
  const themeMode = useAppSelector(selectThemeMode)

  const [login, {error: loginError, isLoading}] = useLoginMutation()
  // captcha
  const { data: captchaData, refetch: refetchCaptcha, isLoading: isCaptchaLoading } = useGetCaptchaUrlQuery(undefined)
  const [captchaError, setCaptchaError] = useState<string | null>(null)
  // captcha

  const dispatch = useAppDispatch()

  const theme = getTheme(themeMode)

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue, //captcha
    formState: { errors },
  } = useForm<LoginInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false, captcha: "" },
  })

  // captcha
  useEffect(() => {
    refetchCaptcha()
  }, [refetchCaptcha])

  useEffect(() => {
    if (loginError && 'data' in loginError) {
      const errorData = loginError.data as { resultCode?: number; messages?: string[] }
      if (errorData?.resultCode === ResultCode.CaptchaError) {
        // Обновляем капчу при ошибке
        refetchCaptcha()
        setCaptchaError(errorData.messages?.[0] || "Invalid captcha")
      }
    }
  }, [loginError, refetchCaptcha])
  // captcha


  const onSubmit: SubmitHandler<LoginInputs> = (data) => {
    //captcha
    setCaptchaError(null)
    if (!data.captcha) {
      setCaptchaError("Captcha is required")
      return
    }
    //captcha



    login(data).then((res) => {
      if (res.data?.resultCode === ResultCode.Success) {
        dispatch(setIsLoggedInAC({ isLoggedIn: true }))
        localStorage.setItem(AUTH_TOKEN, res.data.data.token)
        reset()
        //captcha
        refetchCaptcha()
        setValue("captcha", "")
        //captcha
      } else if (res.data?.resultCode === ResultCode.CaptchaError) {
        //captcha
        refetchCaptcha()
        setValue("captcha", "")
        setCaptchaError(res.data.messages?.[0] || "Invalid captcha")
        //captcha
      }
    })
  }

  //captcha

  const refreshCaptcha = () => {
    refetchCaptcha()
    setValue("captcha", "")
    setCaptchaError(null)
  }

  //captcha

  return (
    <Grid container justifyContent={"center"}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormControl>
          <FormLabel>
            <p>
              To login get registered
              <a
                style={{ color: theme.palette.primary.main, marginLeft: "5px" }}
                href="https://social-network.samuraijs.com"
                target="_blank"
                rel="noreferrer"
              >
                here
              </a>
            </p>
            <p>or use common test account credentials:</p>
            <p>
              <b>Email:</b> free@samuraijs.com
            </p>
            <p>
              <b>Password:</b> free
            </p>
          </FormLabel>
          <FormGroup>
            <TextField label="Email" margin="normal" error={!!errors.email} {...register("email")} />
            {errors.email && <span className={styles.errorMessage}>{errors.email.message}</span>}
            <TextField
              type="password"
              label="Password"
              margin="normal"
              error={!!errors.email}
              {...register("password")}
            />
            {errors.password && <span className={styles.errorMessage}>{errors.password.message}</span>}
            <FormControlLabel
              label={"Remember me"}
              control={
                <Controller
                  name={"rememberMe"}
                  control={control}
                  render={({ field: { value, ...field } }) => <Checkbox {...field} checked={value} />}
                />
              }
            />

            {/**/}

            {/* Отображение капчи */}

            <div style={{ margin: "16px 0" }}>
              {isCaptchaLoading ? (
                <div>Loading captcha...</div>
              ) : captchaData ? (
                <>
                  <img
                    src={captchaData.url}
                    alt="Captcha"
                    style={{
                      marginBottom: "8px",
                      cursor: "pointer",
                      border: "1px solid #ccc",
                      borderRadius: "4px"
                    }}
                    onClick={refreshCaptcha}
                    title="Click to refresh"
                  />
                  <TextField
                    label="Enter captcha"
                    margin="normal"
                    fullWidth
                    error={!!errors.captcha || !!captchaError}
                    {...register("captcha")}
                    disabled={isLoading}
                  />
                  {(errors.captcha || captchaError) && (
                    <span className={styles.errorMessage}>
                      {errors.captcha?.message || captchaError}
                    </span>
                  )}
                  <Button
                    type="button"
                    variant="outlined"
                    size="small"
                    onClick={refreshCaptcha}
                    style={{ marginTop: "8px" }}
                    disabled={isLoading || isCaptchaLoading}
                  >
                    Refresh Captcha
                  </Button>
                </>
              ) : (
                <div>Failed to load captcha</div>
              )}
            </div>

            {/**/}

            <Button type="submit" variant="contained" color="primary">
              Login
            </Button>
          </FormGroup>
        </FormControl>
      </form>
    </Grid>
  )
}
