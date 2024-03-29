import { ChangeEvent, FC } from "react";
import { useAuthContext } from "@tree/src/context/auth";
import { Box, Button, CircularProgress, Modal, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Register } from "@tree/src/types/auth";
import RegisterForm from "../Form/RegisterForm";
import Form, { Bio, Error as BioError } from "../Form/Form";
import ShowIf from "../show-if";
import { green } from "@mui/material/colors";
import { Error } from "../Header/Login";

type RegisterModalProps = {
  open: boolean;
  value: Register;
  error: Error & { email: boolean };
  bioValue: Bio;
  bioError: BioError;

  register: () => void;
  onClose: () => void;
  onChangeBio: (bio: Bio) => void;
  onChangeBioError: (error: BioError) => void;
  onChange: (event: ChangeEvent<HTMLInputElement>, types: string) => void;
};

const RegisterModal: FC<RegisterModalProps> = ({
  open,
  onClose,
  value,
  error,
  register,
  onChange,
  bioValue,
  bioError,
  onChangeBio,
  onChangeBioError,
}) => {
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
          Register
        </Typography>

        <RegisterForm value={value} onChange={onChange} error={error} />

        <Form bio={bioValue} setBio={onChangeBio} error={bioError} setError={onChangeBioError} />

        <Box
          sx={{
            marginTop: 2,
            position: "relative",
            display: "flex",
            justifyContent: "end",
          }}
        >
          <Box position="relative">
            <Button variant={"contained"} onClick={() => register()} disabled={loading} color="primary">
              Register
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
        </Box>
      </Box>
    </Modal>
  );
};

export default RegisterModal;
