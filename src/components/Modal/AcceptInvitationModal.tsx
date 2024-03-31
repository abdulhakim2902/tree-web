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
import { Role } from "@tree/src/types/user";
import React, { FC } from "react";
import { ScaleLoader } from "react-spinners";
import { startCase } from "lodash";

type AcceptInvitationModalProps = {
  open: boolean;
  email: string;
  role: Role;
  loading: boolean;

  onClose: () => void;
  onAccept: () => void;
};

const permission = {
  [Role.GUEST]: ["View tree"],
  [Role.CONTRIBUTOR]: ["View tree", "Add and edit photos", "Edit people"],
  [Role.EDITOR]: ["View tree", "Add and edit photos", "Add and edit people"],
  [Role.SUPERADMIN]: [],
};

const AcceptInvitationModal: FC<AcceptInvitationModalProps> = ({ open, onClose, role, email, loading, onAccept }) => {
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
      <DialogTitle marginTop={2}>Accept Invitation</DialogTitle>
      <DialogContent dividers>
        <DialogContentText>
          <Typography sx={{ color: "whitesmoke" }}>
            Your email (
            <b>
              <i>{email}</i>
            </b>
            ) will have access to the <b>Family Tree</b> as {["a", "i", "u", "e", "o"].includes(role[0]) ? "an" : "a"}{" "}
          </Typography>
          <TextField
            value={startCase(role)}
            size="small"
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
          <Typography sx={{ color: "whitesmoke" }} textAlign="center">
            Here’s what you can do as {["a", "i", "u", "e", "o"].includes(role[0]) ? "an" : "a"} {role}:
          </Typography>

          {permission[role].map((e, i) => {
            return (
              <Typography key={i} sx={{ color: "whitesmoke" }} textAlign="center">
                + {e}
              </Typography>
            );
          })}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ display: "flex", justifyContent: "center", marginBottom: 2, marginTop: 1, paddingX: 3 }}>
        <Button variant="contained" color="primary" onClick={onAccept} fullWidth>
          {loading ? <ScaleLoader color="whitesmoke" height={10} /> : "Accept"}
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

export default AcceptInvitationModal;
