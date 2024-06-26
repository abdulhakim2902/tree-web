import React, { ChangeEvent, FC, useRef } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { Register } from "@tree/src/types/auth";
import RegisterForm from "../Form/RegisterForm";
import { Error } from "../Header/Login";
import { ScaleLoader } from "react-spinners";

type RegisterModalProps = {
  open: boolean;
  value: Register;
  error: Error & { name: boolean; email: boolean };
  loading: boolean;

  register: (cb?: () => void) => void;
  onChange: (event: ChangeEvent<HTMLInputElement>, types: string) => void;
  onClose: () => void;
};

const RegisterModal: FC<RegisterModalProps> = ({ open, value, register, onChange, error, loading, onClose }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const onRegister = () => {
    if (buttonRef.current && !buttonRef.current.disabled) {
      buttonRef.current.disabled = true;

      register(() => {
        if (buttonRef.current) {
          buttonRef.current.disabled = false;
        }
      });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={!value?.token ? () => onClose() : undefined}
      PaperProps={{
        style: {
          backgroundColor: "var(--background-color)",
          color: "whitesmoke",
          width: "300px",
        },
      }}
    >
      <DialogTitle textAlign="center" marginTop={2}>
        Create a new account
      </DialogTitle>
      <DialogContent dividers>
        <RegisterForm value={value} onChange={onChange} error={error} />
      </DialogContent>
      <DialogActions sx={{ display: "flex", justifyContent: "center", marginBottom: 2, marginTop: 1, paddingX: 3 }}>
        <Button ref={buttonRef} variant="contained" onClick={onRegister} color="primary" fullWidth>
          {loading ? <ScaleLoader color="whitesmoke" height={10} /> : "Sign Up"}
        </Button>
        {loading ? (
          <React.Fragment />
        ) : (
          <Button variant="outlined" onClick={onClose} fullWidth>
            Cancel
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default RegisterModal;
