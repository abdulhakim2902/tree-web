import React, { FC } from "react";
import { AppBar, Box, Toolbar } from "@mui/material";
import Login from "./Login";
import User from "./User";
import Search from "./Search";
import { useMounted } from "@tree/src/hooks/use-mounted.hook";
import ShowIf from "../show-if";
import { useAuthContext } from "@tree/src/context/auth";
import Notifications from "./Notifications";

const Header: FC = () => {
  const { isMounted } = useMounted();
  const { isLoggedIn, user } = useAuthContext();

  if (!isMounted) {
    return null;
  }

  return (
    <AppBar sx={{ backgroundColor: "var(--background-color)" }}>
      <Toolbar>
        <Search />
        <Login />
        <ShowIf condition={isLoggedIn && Boolean(user)}>
          <Notifications />
          <User />
        </ShowIf>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
