import { useAuthContext } from "@tree/src/context/auth";
import { Box, Button, useMediaQuery, useTheme } from "@mui/material";
import React, { ChangeEvent, FC, KeyboardEvent, useEffect, useRef, useState } from "react";
import { Login as LoginType } from "@tree/src/types/auth";
import LoginModal from "../Modal/LoginModal";
import { TREE_ROOT_KEY } from "@tree/src/constants/storage-key";

import { Root } from "@tree/src/types/tree";
import LoginForm from "../Form/LoginForm";
import { ScaleLoader } from "react-spinners";

/* Hooks */
import { useRouter } from "next/router";
import { useSnackbar } from "notistack";
import { useCacheContext } from "@tree/src/context/cache";

export type Error = {
  username: boolean;
  password: boolean;
};

const Login: FC = () => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { get } = useCacheContext();
  const { enqueueSnackbar } = useSnackbar();
  const { pathname, replace } = useRouter();
  const { isLoggedIn, login, loading } = useAuthContext();

  const [data, setData] = useState<LoginType>({ username: "", password: "" });
  const [error, setError] = useState<Error>({ username: false, password: false });
  const [open, setOpen] = useState<boolean>(false);

  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (!mobile) {
      setOpen(false);
      setData({ username: "", password: "" });
    }
  }, [mobile]);

  const handleLogin = async (event?: KeyboardEvent, cb?: () => void) => {
    if (event && event.key !== "Enter") return;

    const res: Record<string, any> = data;
    for (const key in res) {
      if (!res[key]) {
        return enqueueSnackbar({
          variant: "error",
          message: "Username or password must not be empty",
        });
      }
    }

    if (Object.values(error).find((e) => e)) {
      return enqueueSnackbar({
        variant: "error",
        message: "Invalid username or password",
      });
    }

    login(data, (success) => {
      if (success) {
        setData({ username: "", password: "" });
        setOpen(false);

        if (pathname === "/families") replace("/families");
        if (pathname === "/tree") {
          const root = get<Root>(TREE_ROOT_KEY);
          const nodeId = root?.id;
          if (!nodeId) replace("/families");
          else replace(`/tree?nodeId=${nodeId}`);
        }
      }

      cb && cb();
    });
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>, types: string) => {
    if (types === "username") {
      let error = false;
      if (!event.target.value) {
        error = true;
      } else {
        if (event.target.value.split(" ").length > 1) {
          error = true;
        }
      }

      setError((prev) => ({ ...prev, username: error }));
      setData((prev) => ({ ...prev, username: event.target.value.toLowerCase() }));
    }

    if (types === "password") {
      let error = false;
      if (!event.target.value) {
        error = true;
      }

      setError((prev) => ({ ...prev, password: error }));
      setData((prev) => ({ ...prev, password: event.target.value }));
    }
  };

  if (isLoggedIn) return <React.Fragment />;
  if (mobile) {
    return (
      <Box sx={{ m: 1, position: "relative" }}>
        <Button color="inherit" onClick={() => setOpen(true)} sx={{ borderColor: "whitesmoke" }} variant="outlined">
          Login
        </Button>
        <LoginModal
          open={open}
          onClose={() => {
            setOpen(false);
            setData({ username: "", password: "" });
          }}
          login={handleLogin}
          value={data}
          onChange={onChange}
          error={error}
        />
      </Box>
    );
  }

  return (
    <React.Fragment>
      <LoginForm login={handleLogin} value={data} onChange={onChange} error={error} />
      <Button
        ref={buttonRef}
        color="inherit"
        onClick={async () => {
          if (buttonRef.current && !buttonRef.current.disabled) {
            buttonRef.current.disabled = true;
            handleLogin(undefined, () => {
              if (buttonRef.current) {
                buttonRef.current.disabled = false;
              }
            });
          }
        }}
        sx={{ borderColor: "whitesmoke" }}
        variant="outlined"
      >
        {loading ? <ScaleLoader color="whitesmoke" height={10} width={2} /> : "Log in"}
      </Button>
    </React.Fragment>
  );
};

export default Login;
