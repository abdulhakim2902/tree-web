import { useAuthContext } from "@tree/src/context/auth";
import { Box, Modal, Typography, useMediaQuery, useTheme } from "@mui/material";
import { ChangeEvent, FC, KeyboardEvent } from "react";
import LoginForm from "../Form/LoginForm";
import { Login as LoginType } from "@tree/src/types/auth";
import { Error } from "../Header/Login";

type LoginModalProps = {
  open: boolean;
  value: LoginType;
  error: Error;

  login: (event?: KeyboardEvent) => void;
  onClose: () => void;
  onChange: (event: ChangeEvent<HTMLInputElement>, types: string) => void;
};

const LoginModal: FC<LoginModalProps> = ({ open, onClose, value, login, onChange, error }) => {
  const { loading } = useAuthContext();

  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Modal
      open={open}
      onClose={(event, reason) => {
        if (loading && reason === "backdropClick") return;
        if (loading && reason === "escapeKeyDown") return;
        onClose();
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: mobile ? "80%" : 400,
          bgcolor: "var(--background-color)",
          borderRadius: "10px",
          p: 4,
        }}
      >
        <Typography sx={{ mb: "20px", fontWeight: "bold" }} variant="h4" component="h2">
          Login
        </Typography>

        <LoginForm value={value} login={login} onChange={onChange} error={error} />
      </Box>
    </Modal>
  );
};

export default LoginModal;
