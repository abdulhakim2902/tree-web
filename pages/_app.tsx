import Layout from "@/components/Layout/Layout";
import { TreeNodeDataContextProvider } from "@/context/data";
import "@/styles/globals.css";
import { IconButton, createTheme, useMediaQuery, useTheme } from "@mui/material";
import type { AppProps } from "next/app";
import { SnackbarProvider, closeSnackbar } from "notistack";
import CloseIcon from "@mui/icons-material/Close";
import { AuthContextProvider } from "@/context/auth";
import React from "react";

const MyApp = ({ Component, pageProps }: AppProps) => {
  const theme = useTheme();
  const match = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <SnackbarProvider
      style={{ width: match ? "80%" : "100%" }}
      autoHideDuration={5000}
      preventDuplicate
      action={(snackbarId) => {
        if (match) return <React.Fragment />;
        return (
          <IconButton
            aria-label="close-notification"
            onClick={() => closeSnackbar(snackbarId)}
            onMouseDown={(event) => event.preventDefault()}
            sx={{ color: "whitesmoke", mr: "10px", alignItems: "center" }}
            edge="end"
          >
            <CloseIcon />
          </IconButton>
        );
      }}
    >
      <AuthContextProvider>
        <TreeNodeDataContextProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </TreeNodeDataContextProvider>
      </AuthContextProvider>
    </SnackbarProvider>
  );
};

export default MyApp;
