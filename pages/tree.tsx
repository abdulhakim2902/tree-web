import React, { useEffect, useState } from "react";
import TreeNodeDetails from "@tree/src/components/Tree/TreeNodeDetails/TreeNodeDetails";
import TreeWithNavigation from "@tree/src/components/Tree/TreeWithNavigation/TreeWithNavigation";
import { NavigationContextProvider } from "@tree/src/context/navigation";
import { NodeSelectionContextProvider } from "@tree/src/context/tree";
import type { GetServerSidePropsContext, NextPage } from "next";
import { useTreeNodeDataContext } from "@tree/src/context/data";
import { deleteCookie, getCookie } from "cookies-next";
import { Backdrop, CircularProgress } from "@mui/material";
import s from "@tree/styles/TreePage.module.css";
import ShowIf from "@tree/src/components/show-if";
import s2 from "@tree/styles/HomePage.module.css";
import ballS from "@tree/styles/Ball.module.css";
import Button from "@tree/src/components/Button/Button";
import classNames from "classnames";
import { TOKEN_KEY, USER_KEY } from "@tree/src/constants/storage-key";

const Tree: NextPage = () => {
  const { tree, loading, initNodes } = useTreeNodeDataContext();
  const { root, nodes, nodeMap } = tree;

  useEffect(() => {
    initNodes();
  }, []);

  return (
    <React.Fragment>
      <Backdrop open={loading.main} sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <NodeSelectionContextProvider>
        <NavigationContextProvider>
          <ShowIf condition={root.isRoot}>
            <div className={s.absoluteContainer}>
              <div className={s.treeRootNameContainer}>
                <span className={s.treeRootTitle}>Tree Root</span>
                <span className={s.treeRootName}>{nodeMap?.[root.id]?.data?.fullname ?? ""}</span>
              </div>
            </div>
          </ShowIf>
          <TreeWithNavigation rootId={root.id} nodes={nodes} loading={loading.main} />
          <TreeNodeDetails nodeMap={nodeMap} />
        </NavigationContextProvider>
      </NodeSelectionContextProvider>
    </React.Fragment>
  );
};

export default Tree;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  try {
    const token = getCookie(TOKEN_KEY, ctx)?.toString();
    if (!token) {
      throw new Error("Not logged in");
    }
  } catch {
    deleteCookie(USER_KEY, ctx);
    deleteCookie(TOKEN_KEY, ctx);
  }

  return {
    props: {},
  };
}
