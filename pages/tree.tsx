import React, { useEffect, useState } from "react";
import TreeNodeDetails from "@/components/Tree/TreeNodeDetails/TreeNodeDetails";
import TreeWithNavigation from "@/components/Tree/TreeWithNavigation/TreeWithNavigation";
import { NavigationContextProvider } from "@/context/navigation";
import { NodeSelectionContextProvider } from "@/context/tree";
import type { GetServerSidePropsContext, NextPage } from "next";
import { useTreeNodeDataContext } from "@/context/data";
import { deleteCookie, getCookie } from "cookies-next";
import { Backdrop, CircularProgress } from "@mui/material";
import s from "@/styles/TreePage.module.css";
import ShowIf from "@/components/show-if";
import { startCase } from "lodash";
import s2 from "@/styles/HomePage.module.css";
import ballS from "@/styles/Ball.module.css";
import Button from "@/components/Button/Button";
import classNames from "classnames";
import { TOKEN_KEY, USER_KEY } from "@/constants/storage-key";

const Tree: NextPage = () => {
  const { node, nodes, nodeMap, loading, initNodes } = useTreeNodeDataContext();

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
          <ShowIf condition={node.isRoot}>
            <div className={s.absoluteContainer}>
              <div className={s.treeRootNameContainer}>
                <span className={s.treeRootTitle}>Tree Root</span>
                <span className={s.treeRootName}>{startCase(nodeMap?.[node.id]?.data?.fullname ?? "")}</span>
              </div>
            </div>
          </ShowIf>
          <TreeWithNavigation rootId={node.id} nodes={nodes} loading={loading.main} />
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
