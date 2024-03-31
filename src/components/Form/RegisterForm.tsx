import { IconButton, TextField } from "@mui/material";
import { Register } from "@tree/src/types/auth";
import React, { ChangeEvent, FC, useState } from "react";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Error } from "../Header/Login";
import ShowIf from "../show-if";
import { startCase } from "lodash";

type RegisterFormProps = {
  value: Register;
  error: Error & { name: boolean; email: boolean };

  onChange: (event: ChangeEvent<HTMLInputElement>, type: string) => void;
};

const RegisterForm: FC<RegisterFormProps> = ({ value, onChange, error }) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  return (
    <React.Fragment>
      <TextField
        required
        error={error.name}
        id="name"
        label="Name"
        type="text"
        variant="outlined"
        value={value.name}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event, "name")}
        fullWidth
        sx={{
          mb: "11px",
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
        disabled={Boolean(value?.token)}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event, "email")}
        fullWidth
        sx={{
          mb: "11px",
          input: { color: "whitesmoke" },
          "& .MuiInputBase-input.Mui-disabled": {
            WebkitTextFillColor: "whitesmoke",
          },
          "& .MuiInputLabel-root.Mui-disabled": {
            WebkitTextFillColor: "grey",
          },
        }}
        InputLabelProps={{ sx: { color: "grey" } }}
      />
      <TextField
        required
        error={error.username}
        id="username"
        label="Username"
        type="text"
        variant="outlined"
        value={value.username}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event, "username")}
        fullWidth
        sx={{
          mb: "11px",
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
        fullWidth
        sx={{ input: { color: "whitesmoke" }, mb: "11px" }}
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
      <TextField
        required
        id="role"
        label="Role"
        type="text"
        variant="outlined"
        value={startCase(value.role)}
        disabled
        fullWidth
        sx={{
          mb: "11px",
          "& .MuiInputBase-input.Mui-disabled": {
            WebkitTextFillColor: "whitesmoke",
          },
          "& .MuiInputLabel-root.Mui-disabled": {
            WebkitTextFillColor: "grey",
          },
        }}
        InputLabelProps={{ sx: { color: "grey" } }}
      />
    </React.Fragment>
  );
};

export default RegisterForm;
