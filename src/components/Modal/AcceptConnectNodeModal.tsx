import {
  Box,
  Button,
  ButtonGroup,
  ClickAwayListener,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grow,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  TextField,
  Typography,
} from "@mui/material";
import React, { FC, RefObject, useRef, useState } from "react";
import ShowIf from "../show-if";
import { TreeNodeData } from "@tree/src/types/tree";
import { ScaleLoader } from "react-spinners";
import { startCase } from "lodash";
import { getDate } from "@tree/src/helper/date";
import { Gender } from "@tree/src/lib/relatives-tree/types";
import { ArrowDropDownIcon } from "@mui/x-date-pickers";

type AcceptConnectNodeModalProps = {
  ref?: RefObject<HTMLButtonElement>;
  node?: TreeNodeData;
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onConnectRequest: (action: string) => void;
};

const options = ["Accept", "Reject"];

const AcceptConnectNodeModal: FC<AcceptConnectNodeModalProps> = ({
  ref,
  node,
  open,
  loading,
  onClose,
  onConnectRequest,
}) => {
  const anchorRef = useRef<HTMLDivElement>(null);

  const [openAction, setOpenAction] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const birth = node?.birth;
  const birthDate = getDate(birth?.year, birth?.month, birth?.day);

  const placeCountry = () => {
    const country = birth?.place?.country;
    const city = birth?.place?.city;
    if (country && city) {
      return `${startCase(country)}, ${startCase(city)}`;
    }

    if (country && !city) {
      return startCase(country);
    }

    if (!country && city) {
      return startCase(city);
    }

    return "";
  };

  const handleMenuItemClick = (event: React.MouseEvent<HTMLLIElement, MouseEvent>, index: number) => {
    setSelectedIndex(index);
    setOpenAction(false);
  };

  const handleCloseAction = (event: Event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }

    setOpenAction(false);
  };

  return (
    <React.Fragment>
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
            <Typography sx={{ fontSize: "20px" }}>Accept Connect Request</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            value={node?.fullname}
            inputProps={{ style: { textAlign: "center", fontSize: "16px" } }}
            label="Fullname"
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
          <TextField
            value={startCase(node?.gender)}
            inputProps={{ style: { textAlign: "center", fontSize: "16px" } }}
            type="text"
            label="Gender"
            disabled
            fullWidth
            sx={{
              mt: 2,
              "& .MuiInputBase-input.Mui-disabled": {
                WebkitTextFillColor: node?.gender === Gender.female ? "crimson" : "#1976d2",
              },
              "& .MuiInputLabel-root.Mui-disabled": {
                WebkitTextFillColor: "grey",
              },
            }}
          />
          <Box display="flex" justifyContent="space-between">
            <ShowIf condition={Boolean(birth?.place?.country) || Boolean(birth?.place?.city)}>
              <TextField
                value={placeCountry()}
                inputProps={{ style: { textAlign: "center", fontSize: "16px" } }}
                type="text"
                label="Birth Place"
                disabled
                fullWidth
                sx={{
                  mt: 2,
                  mr: 1,
                  "& .MuiInputBase-input.Mui-disabled": {
                    WebkitTextFillColor: "whitesmoke",
                  },
                  "& .MuiInputLabel-root.Mui-disabled": {
                    WebkitTextFillColor: "grey",
                  },
                }}
              />
            </ShowIf>
            <ShowIf condition={Boolean(birthDate)}>
              <TextField
                value={birthDate}
                inputProps={{ style: { textAlign: "center", fontSize: "16px" } }}
                type="text"
                label="Birth Date"
                disabled
                fullWidth
                sx={{
                  mt: 2,
                  ml: 1,
                  "& .MuiInputBase-input.Mui-disabled": {
                    WebkitTextFillColor: "whitesmoke",
                  },
                  "& .MuiInputLabel-root.Mui-disabled": {
                    WebkitTextFillColor: "grey",
                  },
                }}
              />
            </ShowIf>
          </Box>
          <ShowIf condition={Boolean(node?.profileImageURL)}>
            <Box display="flex" justifyContent="center" marginTop={2}>
              <img src={node?.profileImageURL ?? ""} width={150} alt={node?.profileImageURL ?? ""} loading="lazy" />
            </Box>
          </ShowIf>
        </DialogContent>
        <DialogActions sx={{ marginBottom: 3, marginRight: 2 }}>
          {loading ? (
            <React.Fragment />
          ) : (
            <Button variant="outlined" onClick={handleClose}>
              Cancel
            </Button>
          )}

          <ButtonGroup
            ref={anchorRef}
            variant="contained"
            color={options[selectedIndex] === "Accept" ? "primary" : "error"}
          >
            <Button
              ref={ref}
              onClick={() => {
                onConnectRequest(options[selectedIndex].toLowerCase());
                onClose();
                setOpenAction(false);
              }}
            >
              {loading ? <ScaleLoader color="whitesmoke" height={10} /> : options[selectedIndex]}
            </Button>
            <Button size="small" onClick={loading ? undefined : () => setOpenAction((prevOpen) => !prevOpen)}>
              <ArrowDropDownIcon />
            </Button>
          </ButtonGroup>
          <Popper
            sx={{ zIndex: 10000 }}
            open={openAction}
            anchorEl={anchorRef.current}
            transition
            placement="bottom-end"
          >
            {({ TransitionProps }) => (
              <Grow {...TransitionProps}>
                <Paper sx={{ color: "whitesmoke", backgroundColor: "var(--background-color)", width: "150px" }}>
                  <ClickAwayListener onClickAway={handleCloseAction}>
                    <MenuList id="split-button-menu" autoFocusItem>
                      {options.map((option, index) => (
                        <MenuItem
                          key={option}
                          selected={index === selectedIndex}
                          onClick={(event) => handleMenuItemClick(event, index)}
                        >
                          {option}
                        </MenuItem>
                      ))}
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Popper>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default AcceptConnectNodeModal;
