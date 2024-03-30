import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Role } from "@tree/src/types/user";
import { startCase } from "lodash";
import React, { FC, useEffect, useState } from "react";
import ShowIf from "../show-if";
import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckIcon from '@mui/icons-material/Check';
import * as isEmail from "email-validator";

type Person = {
  email: string;
  role: Role;
  error: boolean;
};

type InvitePeopleModalProps = {
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

const InvitePeopleModal: FC<InvitePeopleModalProps> = ({ open, onClose }) => {
  const classes = useStyles();

  const [error, setError] = useState<boolean>(false);
  const [inviting, setInviting] = useState<boolean>(false);
  const [people, setPeople] = useState<Person[]>([{ email: "", role: Role.GUEST, error: false }]);

  useEffect(() => {
    if (!open) setPeople([{ email: "", role: Role.GUEST, error: false }]);
  }, [open]);

  const handleInvite = () => {
    const isEmailNotValid = people.some((person) => isEmail.validate(person.email) === false);
    setError(isEmailNotValid);
    if (isEmailNotValid) return;
    setInviting(true);
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
      <DialogTitle>Invite to Family Tree</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: "whitesmoke" }}>
          Give others permission to view, contribute, or edit your tree. We’ll let you know when it’s been accessed.
        </DialogContentText>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: "whitesmoke", paddingLeft: 0 }}>Email</TableCell>
                <TableCell sx={{ color: "whitesmoke", paddingLeft: 0 }}>Role</TableCell>
                <ShowIf condition={people.length > 1}>
                  <TableCell sx={{ paddingLeft: 0, paddingRight: 0 }} />
                </ShowIf>
              </TableRow>
            </TableHead>
            <TableBody>
              {people.map((person, index) => {
                return (
                  <React.Fragment key={index}>
                    <TableRow>
                      <TableCell
                        sx={{
                          color: "whitesmoke",
                          borderBottom: "none",
                          paddingLeft: 0,
                          paddingBottom: 0,
                          width: "60%",
                        }}
                      >
                        <TextField
                          error={person.error}
                          value={person.email}
                          fullWidth
                          type="text"
                          variant="outlined"
                          size="medium"
                          sx={{
                            input: { color: "whitesmoke" },
                          }}
                          onChange={(event) => {
                            setInviting(false);
                            setPeople((prev) => {
                              prev[index].error = !isEmail.validate(event.target.value);
                              prev[index].email = event.target.value;
                              return [...prev];
                            });
                          }}
                        />
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "whitesmoke",
                          borderBottom: "none",
                          paddingLeft: 0,
                          paddingBottom: 0,
                          paddingRight: 0,
                          width: "30%",
                        }}
                      >
                        <Select
                          value={person.role}
                          fullWidth
                          onChange={(event) => {
                            setInviting(false);
                            setPeople((prev) => {
                              prev[index].role = event.target.value as Role;
                              return [...prev];
                            });
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
                      </TableCell>
                      <ShowIf condition={people.length > 1}>
                        <TableCell
                          align="center"
                          sx={{ borderBottom: "none", paddingLeft: 0, paddingBottom: 0, paddingRight: 0 }}
                        >
                          <IconButton
                            sx={{ color: "whitesmoke" }}
                            onClick={() => {
                              setInviting(false);
                              setPeople((prev) => {
                                prev.splice(index, 1);
                                return [...prev];
                              });
                            }}
                          >
                            <CloseIcon />
                          </IconButton>
                        </TableCell>
                      </ShowIf>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        sx={{ color: "whitesmoke", padding: 0, paddingTop: 1, borderBottom: "none" }}
                      >
                        This person will be able to{" "}
                        <ShowIf condition={person.role === Role.GUEST}>
                          <b>
                            <i>view this tree</i>
                          </b>
                          .
                        </ShowIf>
                        <ShowIf condition={person.role === Role.CONTRIBUTOR}>
                          <b>
                            <i>view this tree and add photos</i>
                          </b>
                          .
                        </ShowIf>
                        <ShowIf condition={person.role === Role.EDITOR}>
                          <b>
                            <i>view this tree and add photos and people</i>
                          </b>
                          .
                        </ShowIf>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <Button
          variant="outlined"
          onClick={() => {
            setInviting(false);
            setPeople((prev) => {
              return [...prev, { email: "", role: Role.GUEST, error: false }];
            });
          }}
          sx={{ marginTop: 3 }}
        >
          Add another email
        </Button>
        {error && (
          <TextField
            disabled
            value="Please enter valid email address"
            fullWidth
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
        {inviting && (
          <TextField
            disabled
            value="Invites sent successfully."
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
            setPeople([{ email: "", role: Role.GUEST, error: false }]);
            setError(false);
            setInviting(false);
          }}
        >
          Cancel
        </Button>
        <Button onClick={handleInvite} variant="contained" autoFocus disabled={inviting}>
          Send invites
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvitePeopleModal;
