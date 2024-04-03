import { Login } from "@tree/src/types/auth";
import { IconButton, TextField, useMediaQuery, useTheme } from "@mui/material";
import React, { ChangeEvent, FC, KeyboardEvent, useState } from "react";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Error } from "../Header/Login";

type LoginFormProps = {
  value: Login;
  error: Error;

  login: (event?: KeyboardEvent) => void;
  onChange: (event: ChangeEvent<HTMLInputElement>, types: string) => void;
};

const LoginForm: FC<LoginFormProps> = ({ value, login, onChange, error }) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <React.Fragment>
      <TextField
        required
        error={error.username}
        id="username"
        label="Username"
        size="small"
        type="text"
        value={value.username}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event, "username")}
        onKeyUp={(event) => login(event)}
        fullWidth={mobile}
        sx={{
          mb: mobile ? "9px" : "0px",
          mr: mobile ? "0px" : "10px",
          input: { color: "whitesmoke" },
        }}
        InputLabelProps={{ sx: { color: "grey" } }}
      />
      <TextField
        required
        error={error.password}
        id="password"
        type={showPassword ? "text" : "password"}
        label="Password"
        size="small"
        value={value.password}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event, "password")}
        onKeyUp={(event) => login(event)}
        fullWidth={mobile}
        sx={{ input: { color: "whitesmoke" }, mr: mobile ? "0px" : "10px" }}
        InputLabelProps={{ sx: { color: "grey" } }}
        InputProps={{
          endAdornment: (
            <IconButton
              aria-label="toggle password visibility"
              onClick={() => setShowPassword((show) => !show)}
              onMouseDown={(event) => event.preventDefault()}
              edge="end"
              sx={{ color: "whitesmoke" }}
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          ),
        }}
      />
    </React.Fragment>
  );
};

export default LoginForm;
