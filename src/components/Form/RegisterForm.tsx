import { IconButton, TextField } from "@mui/material";
import { Register } from "@tree/src/types/auth";
import React, { ChangeEvent, FC, useState } from "react";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Error } from "../Header/Login";

type RegisterFormProps = {
  value: Register;
  error: Error & { email: boolean };

  onChange: (event: ChangeEvent<HTMLInputElement>, types: string) => void;
};

const RegisterForm: FC<RegisterFormProps> = ({ value, onChange, error }) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  return (
    <React.Fragment>
      <TextField
        required
        error={error.username}
        id="username"
        label="Username"
        type="text"
        variant="outlined"
        value={value.username}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event, "username")}
        // onKeyUp={(event) => login(event)}
        fullWidth
        sx={{
          mb: "9px",
          input: { color: "whitesmoke" },
        }}
        InputLabelProps={{ sx: { color: "grey" } }}
      />
      <TextField
        required
        error={error.email}
        id="email"
        label="Email"
        type="text"
        variant="outlined"
        value={value.email}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event, "email")}
        // onKeyUp={(event) => login(event)}
        fullWidth
        sx={{
          mb: "9px",
          input: { color: "whitesmoke" },
        }}
        InputLabelProps={{ sx: { color: "grey" } }}
      />
      <TextField
        error={error.password}
        id="password"
        type={showPassword ? "text" : "password"}
        label="Password"
        value={value.password}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event, "password")}
        // onKeyUp={(event) => login(event)}
        fullWidth
        sx={{ input: { color: "whitesmoke" } }}
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

export default RegisterForm;
