import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";
import React, { FC, useRef, useState } from "react";
import WarningIcon from "@mui/icons-material/Warning";
import { ScaleLoader } from "react-spinners";
import { useSnackbar } from "notistack";
import { disconnectNode } from "@tree/src/lib/services/user";
import { useAuthContext } from "@tree/src/context/auth";

type DisconnectNodeModal = {
  nodeId: string;
  open: boolean;
  onClose: () => void;
};

const DisconnectNodeModal: FC<DisconnectNodeModal> = ({ nodeId, open, onClose }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { enqueueSnackbar } = useSnackbar();
  const { logout } = useAuthContext();

  const [loading, setLoading] = useState<boolean>(false);

  const onDisconnect = async () => {
    if (buttonRef.current && !buttonRef.current.disabled) {
      buttonRef.current.disabled = true;

      try {
        setLoading(true);

        await disconnectNode(nodeId);

        logout();
        enqueueSnackbar({
          variant: "success",
          message: "Successfully disconnect node",
        });
      } catch (err: any) {
        enqueueSnackbar({
          variant: "error",
          message: err.message,
        });
      } finally {
        setLoading(false);
      }

      buttonRef.current.disabled = false;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      PaperProps={{
        style: {
          backgroundColor: "var(--background-color)",
          color: "whitesmoke",
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <WarningIcon fontSize="large" sx={{ mr: "10px" }} />
          <Typography fontSize="17px">Are your sure to disconnect?</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          <Typography fontSize="15px" sx={{ color: "whitesmoke" }}>
            You are about to disconnect to this people.
          </Typography>
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ marginBottom: 3, marginRight: 2 }}>
        {loading ? (
          <React.Fragment />
        ) : (
          <Button variant="outlined" onClick={onClose} color="primary">
            Cancel
          </Button>
        )}

        <Button ref={buttonRef} onClick={onDisconnect} variant="contained" color="error" autoFocus>
          {loading ? <ScaleLoader color="whitesmoke" height={10} /> : "Disconnect"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DisconnectNodeModal;
