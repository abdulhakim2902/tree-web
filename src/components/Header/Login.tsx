import { useAuthContext } from "@tree/src/context/auth";
import { Box, Button, useMediaQuery, useTheme } from "@mui/material";
import React, { ChangeEvent, FC, KeyboardEvent, useEffect, useState } from "react";
import { Login as LoginType, Register } from "@tree/src/types/auth";
import { useSnackbar } from "notistack";
import LoginModal from "../Modal/LoginModal";
import { useTreeNodeDataContext } from "@tree/src/context/data";
import { parseJSON } from "@tree/src/helper/parse-json";
import { getCookie } from "cookies-next";
import { UserWithFullname } from "@tree/src/types/user";
import { TREE_KEY, USER_KEY } from "@tree/src/constants/storage-key";
import { useRouter } from "next/router";
import { useCacheContext } from "@tree/src/context/cache";
import { Tree } from "@tree/src/types/tree";
import LoginForm from "../Form/LoginForm";
import RegisterModal from "../Modal/RegisterModal";
import { Bio, defaultBio, defaultError as defaultErrorBio, Error as ErrorBio } from "../Form/Form";
import * as isEmail from "email-validator";

export type Error = {
  username: boolean;
  password: boolean;
};

const defaultLoginData = { username: "", password: "" };
const defaultRegisterData = { username: "", password: "", email: "" };

const defaultErrorLogin = { username: false, password: false };
const defaultErrorRegister = { username: false, password: false, email: false };

const Login: FC = () => {
  const { isLoggedIn, login } = useAuthContext();
  const { rootNodes } = useTreeNodeDataContext();
  const { get } = useCacheContext();
  const { enqueueSnackbar } = useSnackbar();
  const { pathname, replace } = useRouter();

  const [loginData, setLoginData] = useState<LoginType>(defaultLoginData);
  const [registerData, setRegisterData] = useState<Register>(defaultRegisterData);
  const [bioData, setBioData] = useState<Bio>(defaultBio);

  const [errorBio, setErrorBio] = useState<ErrorBio>(defaultErrorBio);
  const [errorLogin, setErrorLogin] = useState<Error>(defaultErrorLogin);
  const [errorRegister, setErrorRegister] = useState<Error & { email: boolean }>(defaultErrorRegister);

  const [openLogin, setOpenLogin] = useState<boolean>(false);
  const [openRegister, setOpenRegister] = useState<boolean>(false);

  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (!mobile) {
      setOpenLogin(false);
      setLoginData(defaultLoginData);
    }
  }, [mobile]);

  const handleLogin = async (event?: KeyboardEvent) => {
    if (event && event.key !== "Enter") return;

    const data: Record<string, any> = loginData;
    for (const key in data) {
      if (!data[key]) {
        return enqueueSnackbar({
          variant: "error",
          message: "Username or password must not be empty",
        });
      }
    }

    if (Object.values(errorLogin).find((e) => e)) {
      return enqueueSnackbar({
        variant: "error",
        message: "Invalid username or password",
      });
    }

    login(loginData, (success) => {
      if (!success) {
        setOpenRegister(true);
        setOpenLogin(false);
        setRegisterData((prev) => {
          return {
            ...prev,
            username: isEmail.validate(loginData.username) ? "" : loginData.username,
            password: loginData.password,
            email: isEmail.validate(loginData.username) ? loginData.username : "",
          };
        });
        setLoginData(defaultLoginData);
        return;
      }

      setLoginData(defaultLoginData);
      setOpenLogin(false);
      if (pathname === "/families") replace("/families");
      if (pathname === "/tree") {
        const tree = get<Tree>(TREE_KEY);

        let nodeId = tree?.root?.id;
        if (!nodeId) {
          const userStr = getCookie(USER_KEY)?.toString();
          const user = parseJSON<UserWithFullname>(userStr);
          nodeId = user?.nodeId;
        }

        rootNodes(nodeId);
      }
    });
  };

  const handleRegister = async () => {
    const data: Record<string, any> = { ...registerData, ...bioData };
    for (const key in data) {
      if (!data[key]) {
        return enqueueSnackbar({
          variant: "error",
          message: "All data must not be empty",
        });
      }
    }

    if (Object.values(errorRegister).find((e) => e) || Object.values(errorBio).find((e) => e)) {
      return enqueueSnackbar({
        variant: "error",
        message: "Invalid data",
      });
    }

    const { name, gender, birthDate, birthCountry, birthCity } = bioData;

    const names = name.replace(/\s+/g, " ").trim().split(" ");
    const profile: Record<string, any> = {
      name: { first: names[0] },
      gender: gender,
      birth: {
        day: birthDate?.date() ?? 0,
        month: birthDate?.month() ? birthDate.month() + 1 : 0,
        year: birthDate?.year() ?? -1,
        place: {
          country: birthCountry,
          city: birthCity,
        },
      },
    };

    if (names.length > 1) Object.assign(profile.name, { last: names[names.length - 1] });
    if (names.length > 2) Object.assign(profile.name, { middle: names.slice(1, names.length - 1).join(" ") });

    const payload = { ...registerData, profile };

    console.log(payload);

    setRegisterData(defaultRegisterData);
    setOpenRegister(false);
  };

  const onChangeLogin = (event: ChangeEvent<HTMLInputElement>, types: string) => {
    if (types === "username") {
      let error = false;
      if (!event.target.value) {
        error = true;
      } else {
        if (event.target.value.split(" ").length > 1) {
          error = true;
        }
      }

      setErrorLogin((prev) => ({ ...prev, username: error }));
      setLoginData((prev) => ({ ...prev, username: event.target.value.toLowerCase() }));
    }

    if (types === "password") {
      let error = false;
      if (!event.target.value) {
        error = true;
      }

      setErrorLogin((prev) => ({ ...prev, password: error }));
      setLoginData((prev) => ({ ...prev, password: event.target.value }));
    }
  };

  const onChangeRegister = (event: ChangeEvent<HTMLInputElement>, types: string) => {
    if (types === "username") {
      let error = false;
      if (!event.target.value) {
        error = true;
      } else {
        if (event.target.value.split(" ").length > 1) {
          error = true;
        }
      }

      setErrorRegister((prev) => ({ ...prev, username: error }));
      setRegisterData((prev) => ({ ...prev, username: event.target.value.toLowerCase() }));
    }

    if (types === "password") {
      let error = false;
      if (!event.target.value) {
        error = true;
      }

      setErrorRegister((prev) => ({ ...prev, password: error }));
      setRegisterData((prev) => ({ ...prev, password: event.target.value }));
    }

    if (types === "email") {
      const error = !isEmail.validate(event.target.value);

      setErrorRegister((prev) => ({ ...prev, email: error }));
      setRegisterData((prev) => ({ ...prev, email: event.target.value.toLowerCase() }));
    }
  };

  if (isLoggedIn) return <React.Fragment />;
  if (mobile) {
    return (
      <Box sx={{ m: 1, position: "relative" }}>
        <Button
          color="inherit"
          onClick={() => setOpenLogin(true)}
          sx={{ borderColor: "whitesmoke" }}
          variant="outlined"
        >
          Login
        </Button>
        <LoginModal
          open={openLogin}
          onClose={() => setOpenLogin(false)}
          login={handleLogin}
          value={loginData}
          onChange={onChangeLogin}
          error={errorLogin}
        />
        <RegisterModal
          open={openRegister}
          onClose={() => {
            setOpenRegister(false);
            setRegisterData(defaultRegisterData);
          }}
          value={registerData}
          error={errorRegister}
          register={handleRegister}
          bioValue={bioData}
          bioError={errorBio}
          onChange={onChangeRegister}
          onChangeBio={setBioData}
          onChangeBioError={setErrorBio}
        />
      </Box>
    );
  }

  return (
    <React.Fragment>
      <LoginForm login={handleLogin} value={loginData} onChange={onChangeLogin} error={errorLogin} />
      <RegisterModal
        open={openRegister}
        onClose={() => {
          setOpenRegister(false);
          setRegisterData(defaultRegisterData);
        }}
        value={registerData}
        error={errorRegister}
        register={handleRegister}
        bioValue={bioData}
        bioError={errorBio}
        onChange={onChangeRegister}
        onChangeBio={setBioData}
        onChangeBioError={setErrorBio}
      />
    </React.Fragment>
  );
};

export default Login;
