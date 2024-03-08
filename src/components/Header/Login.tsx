import { useAuthContext } from "@tree/src/context/auth";
import { Box, Button, CircularProgress, IconButton, TextField, useMediaQuery, useTheme } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import React, { ChangeEvent, FC, KeyboardEvent, useEffect, useState } from "react";
import ShowIf from "../show-if";
import { Login as LoginType } from "@tree/src/types/login";
import { green } from "@mui/material/colors";
import { useSnackbar } from "notistack";
import LoginModal from "../Modal/LoginModal";
import { useTreeNodeDataContext } from "@tree/src/context/data";
import { parseJSON } from "@tree/src/helper/parse-json";
import { getCookie } from "cookies-next";
import { UserWithFullname } from "@tree/src/types/user";
import { NODE_KEY, USER_KEY } from "@tree/src/constants/storage-key";
import { useRouter } from "next/router";

export type Error = {
  username: boolean;
  password: boolean;
};

const defaultError = { username: false, password: false };

const Login: FC = () => {
  const { isLoggedIn, login, loading } = useAuthContext();
  const { rootNodes } = useTreeNodeDataContext();
  const { enqueueSnackbar } = useSnackbar();
  const { pathname, replace } = useRouter();

  const [data, setData] = useState<LoginType>({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<Error>(defaultError);
  const [open, setOpen] = useState<boolean>(false);

  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (!mobile) {
      setOpen(false);
      setData({ username: "", password: "" });
    }
  }, [mobile]);

  const handleLogin = async (event?: KeyboardEvent) => {
    if (event && event.key !== "Enter") return;
    if (!Boolean(data.username) || !Boolean(data.password)) {
      return enqueueSnackbar({
        variant: "error",
        message: "Username or password must not be empty",
      });
    }

    if (error.username || error.password) {
      return enqueueSnackbar({
        variant: "error",
        message: "Invalid username or password",
      });
    }

    login(data, () => {
      setData({ username: "", password: "" });
      setOpen(false);
      if (pathname === "/families") replace("/families");
      if (pathname === "/tree") {
        const nodeStr = localStorage.getItem(NODE_KEY)?.toString();
        const node = parseJSON<{ id: string; isRoot: boolean }>(nodeStr);

        let nodeId = node?.id;
        if (!node) {
          const userStr = getCookie(USER_KEY)?.toString();
          const user = parseJSON<UserWithFullname>(userStr);
          nodeId = user?.nodeId;
        }

        rootNodes(nodeId);
      }
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
          onClose={() => setOpen(false)}
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
      <TextField
        required
        error={error.username}
        id="username"
        label="Username"
        size="small"
        value={data.username}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event, "username")}
        onKeyUp={(event) => handleLogin(event)}
        sx={{ mr: "10px", input: { color: "whitesmoke" } }}
        InputLabelProps={{ sx: { color: "grey" } }}
      />
      <TextField
        required
        error={error.password}
        id="password"
        type={showPassword ? "text" : "password"}
        label="Password"
        size="small"
        value={data.password}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event, "password")}
        onKeyUp={(event) => handleLogin(event)}
        sx={{ mr: "10px", input: { color: "whitesmoke" } }}
        InputLabelProps={{ sx: { color: "grey" } }}
        InputProps={{
          endAdornment: (
            <IconButton
              aria-label="toggle password visibility"
              onClick={() => setShowPassword((show) => !show)}
              onMouseDown={(event) => event.preventDefault()}
              sx={{ color: "whitesmoke" }}
              edge="end"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          ),
        }}
      />
      <Box sx={{ m: 1, position: "relative" }}>
        <Button
          color="inherit"
          onClick={() => handleLogin()}
          sx={{ borderColor: "whitesmoke" }}
          variant="outlined"
          disabled={loading}
        >
          Login
        </Button>
        <ShowIf condition={loading}>
          <CircularProgress
            size={10}
            sx={{
              color: green[500],
              position: "absolute",
              top: "50%",
              left: "50%",
              marginTop: "-5px",
              marginLeft: "-5px",
            }}
          />
        </ShowIf>
      </Box>
    </React.Fragment>
  );
};

export default Login;
