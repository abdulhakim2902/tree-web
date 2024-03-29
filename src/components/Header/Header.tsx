import React, { FC } from "react";
import { AppBar, Toolbar } from "@mui/material";
import Login from "./Login";
import User from "./User";
import Search from "./Search";
import { useAuthContext } from "@tree/src/context/auth";

const Header: FC = () => {
  const { isLoggedIn } = useAuthContext();
  const sx = isLoggedIn ? {} : { display: "flex", justifyContent: "flex-end" };

  return (
    <AppBar sx={{ backgroundColor: "var(--background-color)" }}>
      <Toolbar>
        <Search />
        <Login />
        <User />
      </Toolbar>
    </AppBar>
  );
};

export default Header;
