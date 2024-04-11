import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import React, { FC, useRef, useState } from "react";
import { TreeNodeDataWithRelations } from "@tree/src/types/tree";
import { ScaleLoader } from "react-spinners";
import { connectNode } from "@tree/src/lib/services/user";

/* Icons */
import CheckIcon from "@mui/icons-material/Check";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HubIcon from "@mui/icons-material/Hub";

type ConnectNodeModalProps = {
  node: TreeNodeDataWithRelations;
  open: boolean;
  onClose: () => void;
};

const ConnectNodeModal: FC<ConnectNodeModalProps> = ({ node, open, onClose }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<string>("");
  const [error, setError] = useState<string>("");

  const onConnect = async () => {
    if (buttonRef.current && !buttonRef.current.disabled) {
      buttonRef.current.disabled = true;

      try {
        setLoading(true);
        await connectNode({ nodeId: node.id });
        setError("");
        setSuccess("Connect request is sent");
      } catch (error: any) {
        setSuccess("");
        setError(error.message);
      } finally {
        setLoading(false);
      }

      buttonRef.current.disabled = false;
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError("");
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        style: {
          width: "400px",
          backgroundColor: "var(--background-color)",
          color: "whitesmoke",
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <HubIcon sx={{ color: "whitesmoke", mr: "10px" }} />
          <Typography sx={{ fontSize: "20px" }}>Connect Request</Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <DialogContentText sx={{ color: "whitesmoke" }}>
          <Typography id="modal-modal-description" sx={{ fontSize: "15px" }}>
            You are about to connect this people.
          </Typography>
        </DialogContentText>
        <TextField
          value={node.fullname}
          inputProps={{ style: { textAlign: "center", fontSize: "16px" } }}
          type="text"
          disabled
          fullWidth
          sx={{
            mt: 2,
            "& .MuiInputBase-input.Mui-disabled": {
              WebkitTextFillColor: "whitesmoke",
            },
            "& .MuiInputLabel-root.Mui-disabled": {
              WebkitTextFillColor: "grey",
            },
          }}
        />
        {success && (
          <TextField
            disabled
            value={success}
            fullWidth
            sx={{
              marginTop: 2,
              "& .MuiInputBase-input.Mui-disabled": {
                WebkitTextFillColor: "whitesmoke",
              },
              backgroundColor: "#2f2f5e",
            }}
            InputProps={{
              startAdornment: <CheckIcon sx={{ marginRight: 1 }} color="success" />,
            }}
          />
        )}
        {error && (
          <TextField
            disabled
            fullWidth
            value={error}
            sx={{
              marginTop: 2,
              "& .MuiInputBase-input.Mui-disabled": {
                WebkitTextFillColor: "whitesmoke",
              },
              backgroundColor: "#2f2f5e",
            }}
            InputProps={{
              startAdornment: <ErrorOutlineIcon sx={{ marginRight: 1 }} color="error" />,
            }}
          />
        )}
      </DialogContent>
      <DialogActions sx={{ marginBottom: 3, marginRight: 2 }}>
        {loading ? (
          <React.Fragment />
        ) : (
          <Button variant="outlined" onClick={handleClose}>
            Cancel
          </Button>
        )}

        <Button ref={buttonRef} variant="contained" onClick={onConnect} autoFocus>
          {loading ? <ScaleLoader color="whitesmoke" height={10} /> : "Connect"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConnectNodeModal;
