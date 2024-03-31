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
import { startCase, uniqBy } from "lodash";
import React, { FC, useEffect, useState } from "react";
import ShowIf from "../show-if";
import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckIcon from "@mui/icons-material/Check";
import * as isEmail from "email-validator";
import { invites } from "@tree/src/lib/services/user";
import { useSnackbar } from "notistack";

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

  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [inviting, setInviting] = useState<boolean>(false);
  const [people, setPeople] = useState<Person[]>([{ email: "", role: Role.GUEST, error: false }]);

  useEffect(() => {
    if (!open) setPeople([{ email: "", role: Role.GUEST, error: false }]);
  }, [open]);

  const handleInvite = async () => {
    if (loading) return;
    const isPersonNotValid = people.some((person) => isEmail.validate(person.email) === false || person.error === true);
    setError(isPersonNotValid);
    if (isPersonNotValid) return;
    const uniquePeople = uniqBy(people, "email");
    try {
      setLoading(true);
      await invites(uniquePeople);
      setInviting(true);
    } catch (err: any) {
      enqueueSnackbar({
        variant: "error",
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    if (loading) return;
    onClose();
    setPeople([{ email: "", role: Role.GUEST, error: false }]);
    setError(false);
    setInviting(false);
  };

  const onChangeEmail = (index: number, value: string) => {
    if (loading) return;
    setInviting(false);
    setPeople((prev) => {
      const isDuplicateEmail = prev.filter((e) => e.email === value).length > 1;
      prev[index].error = !isEmail.validate(value) || isDuplicateEmail;
      prev[index].email = value;
      return [...prev];
    });
  };

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (loading && reason === "backdropClick") return;
        if (loading && reason === "escapeKeyDown") return;
        onReset();
      }}
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
                          onPaste={(event) => onChangeEmail(index, event.clipboardData.getData("text"))}
                          onChange={(event) => onChangeEmail(index, event.target.value)}
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
                            if (loading) return;
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
                              if (loading) return;
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
            if (loading) return;
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
        <Button variant="outlined" onClick={onReset}>
          Cancel
        </Button>
        <Button onClick={handleInvite} variant="contained" autoFocus disabled={inviting}>
          {loading ? "Inviting..." : "Send invites"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvitePeopleModal;
