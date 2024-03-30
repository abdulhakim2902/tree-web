import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Role } from "@tree/src/types/user";
import { startCase } from "lodash";
import React, { FC, useState } from "react";
import ShowIf from "../show-if";
import { useAuthContext } from "@tree/src/context/auth";
import CheckIcon from '@mui/icons-material/Check';

type RequestRoleModalProps = {
  open: boolean;

  onClose: () => void;
};

const useStyles = makeStyles(() => ({
  paper: {
    background: "var(--background-color)",
    color: "whitesmoke",
  },
  noOptions: {
    color: "whitesmoke",
  },
}));

const RequestRoleModal: FC<RequestRoleModalProps> = ({ open, onClose }) => {
  const classes = useStyles();

  const { user } = useAuthContext();

  const [asking, setAsking] = useState<boolean>(false);
  const [role, setRole] = useState<Role>(user?.role || Role.GUEST);

  const handleInvite = () => {
    if (!user) return;
    setAsking(true);
    const people = { email: user.email, role };
    console.log(people);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        style: {
          backgroundColor: "var(--background-color)",
          color: "whitesmoke",
        },
      }}
    >
      <DialogTitle>Request to Family Tree</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: "whitesmoke" }}>
          Ask permission to view, contribute, or edit your tree. We’ll let you know when it’s been accessed.
        </DialogContentText>
        <TableContainer>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell
                  sx={{
                    color: "whitesmoke",
                    borderBottom: "none",
                    paddingLeft: 0,
                    paddingBottom: 0,
                    paddingRight: 0,
                  }}
                >
                  <FormControl fullWidth>
                    <InputLabel id="role" sx={{ color: "grey" }}>
                      Role
                    </InputLabel>
                    <Select
                      value={role}
                      fullWidth
                      label="role"
                      onChange={(event) => {
                        setRole(event.target.value as Role);
                        setAsking(false);
                      }}
                      sx={{
                        color: "whitesmoke",
                        "& .MuiInputBase-input.Mui-disabled": {
                          WebkitTextFillColor: "whitesmoke",
                        },
                      }}
                      MenuProps={{ classes }}
                    >
                      {[Role.GUEST, Role.CONTRIBUTOR, Role.EDITOR].map((role) => {
                        return (
                          <MenuItem key={role} value={role}>
                            {startCase(role)}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={2} sx={{ color: "whitesmoke", padding: 0, paddingTop: 1, borderBottom: "none" }}>
                  This person will be able to{" "}
                  <ShowIf condition={role === Role.GUEST}>
                    <b>
                      <i>view this tree</i>
                    </b>
                    .
                  </ShowIf>
                  <ShowIf condition={role === Role.CONTRIBUTOR}>
                    <b>
                      <i>view this tree and add photos</i>
                    </b>
                    .
                  </ShowIf>
                  <ShowIf condition={role === Role.EDITOR}>
                    <b>
                      <i>view this tree and add photos and people</i>
                    </b>
                    .
                  </ShowIf>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        {asking && (
          <TextField
            disabled
            value="Request sent successfully."
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
      </DialogContent>
      <DialogActions sx={{ marginBottom: 3, marginRight: 2 }}>
        <Button
          variant="outlined"
          onClick={() => {
            onClose();
            setAsking(false);
          }}
        >
          Cancel
        </Button>
        <Button onClick={handleInvite} variant="contained" autoFocus disabled={asking}>
          Ask role
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RequestRoleModal;
