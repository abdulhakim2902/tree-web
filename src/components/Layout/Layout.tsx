import React, { FC, ReactNode } from "react";
import { PageHead } from "../Head/Head";
import dynamic from "next/dynamic";

const Header = dynamic(() => import("../Header/Header"), {
  ssr: false,
});

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
