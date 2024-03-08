import { useAuthContext } from "@tree/src/context/auth";
import {
  Avatar,
  Badge,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { deepOrange } from "@mui/material/colors";
import React, { FC } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import LogoutIcon from "@mui/icons-material/Logout";
import { useTreeNodeDataContext } from "@tree/src/context/data";
import { useRouter } from "next/router";
import { makeStyles } from "@mui/styles";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Diversity1Icon from "@mui/icons-material/Diversity1";

const useStyles = makeStyles(() => ({
  paper: {
    background: "var(--background-color)",
    color: "whitesmoke",
  },
}));

const User: FC = () => {
  const classes = useStyles();

  const { isLoggedIn, user, logout } = useAuthContext();
  const { clearNodes, rootNodes } = useTreeNodeDataContext();
  const { replace, push } = useRouter();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!isLoggedIn) return <React.Fragment />;
  return (
    <React.Fragment>
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={{ cursor: "pointer" }}
        badgeContent={
          <KeyboardArrowDownIcon
            sx={{
              backgroundColor: "grey",
              borderRadius: "100%",
              borderColor: "var(--background-color)",
              borderWidth: "1px",
              borderStyle: "solid",
            }}
          />
        }
      >
        <Avatar
          sx={{
            bgcolor: deepOrange[500],
            opacity: 1,
            ":hover": { opacity: 0.9 },
            height: mobile ? "30px" : "35px",
            width: mobile ? "30px" : "35px",
          }}
        >
          <Typography sx={{ color: "whitesmoke" }}>{getNameSymbol(user?.fullname)}</Typography>
        </Avatar>
      </Badge>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        sx={{ marginTop: "5px" }}
        onClose={() => setAnchorEl(null)}
        classes={classes}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <MenuItem onClick={() => rootNodes(user?.nodeId)}>
          <ListItemIcon>
            <AccountCircleIcon sx={{ color: "whitesmoke" }} />
          </ListItemIcon>
          <ListItemText>{user?.fullname ?? ""}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => push("/families")}>
          <ListItemIcon>
            <Diversity1Icon sx={{ color: "whitesmoke" }} />
          </ListItemIcon>
          <ListItemText>Families</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={async () => {
            await replace("/");
            logout();
            clearNodes();
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <LogoutIcon sx={{ color: "whitesmoke" }} />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
};

export default User;

function getNameSymbol(name?: string): string {
  if (!name) return "U";
  const names = name.split(" ");
  if (names.length === 1) {
    return names[0][0];
  }

  return `${names[0][0]}${names[1][0]}`;
}
