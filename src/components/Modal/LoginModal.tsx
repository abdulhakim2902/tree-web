import { useAuthContext } from "@tree/src/context/auth";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { ChangeEvent, FC, KeyboardEvent, useRef } from "react";
import LoginForm from "../Form/LoginForm";
import { Login as LoginType } from "@tree/src/types/auth";
import { Error } from "../Header/Login";
import { ScaleLoader } from "react-spinners";

type LoginModalProps = {
  open: boolean;
  value: LoginType;
  error: Error;

  login: (event?: KeyboardEvent, cb?: () => void) => void;
  onClose: () => void;
  onChange: (event: ChangeEvent<HTMLInputElement>, types: string) => void;
};

const LoginModal: FC<LoginModalProps> = ({ open, onClose, value, login, onChange, error }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { loading } = useAuthContext();

  const onLogin = () => {
    if (buttonRef.current && !buttonRef.current.disabled) {
      buttonRef.current.disabled = true;
      login(undefined, () => {
        if (buttonRef.current) {
          buttonRef.current.disabled = false;
        }
      });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : () => onClose()}
      PaperProps={{
        style: {
          backgroundColor: "var(--background-color)",
          color: "whitesmoke",
          width: "300px",
        },
      }}
    >
      <DialogTitle>Log in to Family Tree</DialogTitle>
      <DialogContent dividers>
        <LoginForm value={value} login={login} onChange={onChange} error={error} />
      </DialogContent>
      <DialogActions sx={{ marginBottom: 2, marginTop: 1, paddingX: 3 }}>
        <Button ref={buttonRef} variant="contained" onClick={onLogin} color="primary" fullWidth>
          {loading ? <ScaleLoader color="whitesmoke" height={10} /> : "Log in"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoginModal;
