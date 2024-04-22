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
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
} from "@mui/material";
import { Role } from "@tree/src/types/user";
import { startCase } from "lodash";
import React, { FC, useRef, useState } from "react";
import ShowIf from "../show-if";
import { useAuthContext } from "@tree/src/context/auth";
import CheckIcon from "@mui/icons-material/Check";
import { createRoleRequest } from "@tree/src/lib/services/user";
import { ScaleLoader } from "react-spinners";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

type RequestRoleModalProps = {
  open: boolean;

  onClose: () => void;
};

const RequestRoleModal: FC<RequestRoleModalProps> = ({ open, onClose }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { user } = useAuthContext();

  const [asking, setAsking] = useState<boolean>(false);
  const [role, setRole] = useState<Role>(user?.role || Role.GUEST);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const onRequest = async () => {
    if (buttonRef.current && !buttonRef.current.disabled) {
      buttonRef.current.disabled = true;

      try {
        setLoading(true);
        await createRoleRequest({ role });
        setAsking(true);
        setError("");
      } catch (err: any) {
        setAsking(false);
        setError(err.message);
      } finally {
        setLoading(false);
      }

      buttonRef.current.disabled = false;
    }
  };

  const onReset = () => {
    if (!loading) {
      onClose();
      setAsking(false);
      setRole(Role.GUEST);
    }
  };

  const onChangeRole = (event: SelectChangeEvent) => {
    if (!loading) {
      setRole(event.target.value as Role);
      setAsking(false);
      setError("");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onReset}
      PaperProps={{
        style: {
          backgroundColor: "var(--background-color)",
          color: "whitesmoke",
        },
      }}
    >
      <DialogTitle>Request Permissions to Family Tree</DialogTitle>
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
                      disabled={loading}
                      label="role"
                      onChange={onChangeRole}
                      sx={{
                        color: "whitesmoke",
                        "& .MuiInputBase-input.Mui-disabled": {
                          WebkitTextFillColor: "whitesmoke",
                        },
                      }}
                      MenuProps={{
                        sx: {
                          "& .MuiMenu-paper": {
                            backgroundColor: "var(--background-color)",
                            color: "whitesmoke",
                          },
                        },
                      }}
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
        {error && (
          <TextField
            disabled
            value={error}
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
      </DialogContent>
      <DialogActions sx={{ marginBottom: 3, marginRight: 2 }}>
        {loading ? (
          <React.Fragment />
        ) : (
          <Button
            variant="outlined"
            onClick={() => {
              onClose();
              setAsking(false);
            }}
          >
            Cancel
          </Button>
        )}

        <Button ref={buttonRef} onClick={onRequest} variant="contained" autoFocus disabled={asking}>
          {loading ? <ScaleLoader color="whitesmoke" height={10} /> : "Ask Role"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RequestRoleModal;
