import "@tree/styles/globals.css";
import Layout from "@tree/src/components/Layout/Layout";
import { IconButton, useMediaQuery, useTheme } from "@mui/material";
import type { AppProps } from "next/app";
import { SnackbarProvider, closeSnackbar } from "notistack";
import CloseIcon from "@mui/icons-material/Close";
import { AuthContextProvider } from "@tree/src/context/auth";
import React from "react";
import { CacheContextProvider } from "@tree/src/context/cache";
import { LoadingBarContextProvider } from "@tree/src/context/loading";
import { SocketContextProvider } from "@tree/src/context/socket";

const App = ({ Component, pageProps }: AppProps) => {
  const theme = useTheme();
  const match = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <CacheContextProvider>
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
        <LoadingBarContextProvider>
          <AuthContextProvider>
            <SocketContextProvider>
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </SocketContextProvider>
          </AuthContextProvider>
        </LoadingBarContextProvider>
      </SnackbarProvider>
    </CacheContextProvider>
  );
};

export default App;
