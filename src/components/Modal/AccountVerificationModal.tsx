import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import React, { FC, useRef } from "react";
import { ScaleLoader } from "react-spinners";
import ShowIf from "../show-if";

type AccountVerificationProps = {
  open: boolean;
  email: string;
  loading: boolean;
  currentEmail?: string;

  onClose: () => void;
  verify: (cb?: () => void) => void;
};

const AccountVerification: FC<AccountVerificationProps> = ({ open, onClose, email, loading, verify, currentEmail }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const onVerify = () => {
    if (buttonRef.current && !buttonRef.current.disabled) {
      buttonRef.current.disabled = true;

      verify(() => {
        if (buttonRef.current) {
          buttonRef.current.disabled = false;
        }
      });
    }
  };

  return (
    <Dialog
      open={open}
      PaperProps={{
        style: {
          backgroundColor: "var(--background-color)",
          color: "whitesmoke",
          width: "280px",
        },
      }}
    >
      <DialogTitle marginTop={2}>Account Verification</DialogTitle>
      <DialogContent dividers>
        <DialogContentText sx={{ color: "whitesmoke" }}>
          {currentEmail
            ? "You are changing your email address from:"
            : "Please verify your email by clicking on the button below."}
        </DialogContentText>
        <ShowIf condition={Boolean(currentEmail)}>
          <TextField
            value={currentEmail}
            size="medium"
            disabled
            type="text"
            fullWidth
            inputProps={{ style: { textAlign: "center" } }}
            sx={{
              marginTop: "20px",
              marginBottom: "10px",
              "& .MuiInputBase-input.Mui-disabled": {
                WebkitTextFillColor: "whitesmoke",
              },
              "& .MuiInputLabel-root.Mui-disabled": {
                WebkitTextFillColor: "grey",
              },
            }}
          />
          <DialogContentText sx={{ color: "whitesmoke" }} textAlign="center">
            to
          </DialogContentText>
        </ShowIf>
        <TextField
          value={email}
          size="medium"
          disabled
          type="text"
          fullWidth
          inputProps={{ style: { textAlign: "center" } }}
          sx={{
            marginY: "10px",
            "& .MuiInputBase-input.Mui-disabled": {
              WebkitTextFillColor: "whitesmoke",
            },
            "& .MuiInputLabel-root.Mui-disabled": {
              WebkitTextFillColor: "grey",
            },
          }}
        />
        <ShowIf condition={Boolean(currentEmail)}>
          <DialogContentText sx={{ color: "whitesmoke" }}>
            Please verify your email by clicking on the button below.
          </DialogContentText>
        </ShowIf>
      </DialogContent>
      <DialogActions sx={{ display: "flex", justifyContent: "center", marginBottom: 2, marginTop: 1, paddingX: 3 }}>
        <Button ref={buttonRef} variant="contained" color="primary" onClick={onVerify} fullWidth>
          {loading ? <ScaleLoader color="whitesmoke" height={10} /> : "Verify"}
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

export default AccountVerification;
