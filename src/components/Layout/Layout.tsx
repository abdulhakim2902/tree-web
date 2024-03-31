import React, { FC, ReactNode } from "react";
import { PageHead } from "../Head/Head";
import Header from "../Header/Header";

type LayoutProps = {
  children: ReactNode;
};

const Layout: FC<LayoutProps> = ({ children }) => (
  <React.Fragment>
    <PageHead />
    <Header />
    {children}
  </React.Fragment>
);

export default Layout;
