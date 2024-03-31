import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import React, { FC } from "react";
import { ScaleLoader } from "react-spinners";

type AccountVerificationProps = {
  open: boolean;
  email: string;
  loading: boolean;

  onClose: () => void;
  verify: () => void;
};

const AccountVerification: FC<AccountVerificationProps> = ({ open, onClose, email, loading, verify }) => {
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
        <DialogContentText>
          <Typography sx={{ color: "whitesmoke" }}>
            Please verify your email by clicking on the button below.
          </Typography>
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
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ display: "flex", justifyContent: "center", marginBottom: 2, marginTop: 1, paddingX: 3 }}>
        <Button variant="contained" color="primary" onClick={verify} fullWidth>
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
