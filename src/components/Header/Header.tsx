import React, { FC } from "react";
import { AppBar, Toolbar } from "@mui/material";
import Login from "./Login";
import User from "./User";
import Search from "./Search";

const Header: FC = () => {
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
