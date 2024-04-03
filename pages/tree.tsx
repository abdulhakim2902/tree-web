import React, { useEffect } from "react";
import TreeNodeDetails from "@tree/src/components/Tree/TreeNodeDetails/TreeNodeDetails";
import TreeWithNavigation from "@tree/src/components/Tree/TreeWithNavigation/TreeWithNavigation";
import { NavigationContextProvider } from "@tree/src/context/navigation";
import { NodeSelectionContextProvider } from "@tree/src/context/tree";
import type { GetServerSidePropsContext, NextPage } from "next";
import { useTreeNodeDataContext } from "@tree/src/context/data";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import s from "@tree/styles/TreePage.module.css";
import ShowIf from "@tree/src/components/show-if";
import { TOKEN_KEY, TREE_KEY, USER_KEY } from "@tree/src/constants/storage-key";
import { startCase } from "@tree/src/helper/string";
import { sampleNodes } from "@tree/src/lib/services/node";
import { Root, TreeNode } from "@tree/src/types/tree";
import { me } from "@tree/src/lib/services/user";

type TreeProps = {
  root: Root;
  nodes: TreeNode[];
};

const Tree: NextPage<TreeProps> = (props: TreeProps) => {
  const { tree, initNodes } = useTreeNodeDataContext();
  const { root, nodes, nodeMap } = tree;

  useEffect(() => {
    initNodes(props);
  }, [props]);

  return (
    <React.Fragment>
      <NodeSelectionContextProvider>
        <NavigationContextProvider>
          <ShowIf condition={root.isRoot}>
            <div className={s.absoluteContainer}>
              <div className={s.treeRootNameContainer}>
                <span className={s.treeRootTitle}>Tree Root</span>
                <span className={s.treeRootName}>{startCase(nodeMap?.[root.id]?.data?.fullname ?? "")}</span>
              </div>
            </div>
          </ShowIf>
          <TreeWithNavigation rootId={root.id} nodes={nodes} />
          <TreeNodeDetails nodeMap={nodeMap} />
        </NavigationContextProvider>
      </NodeSelectionContextProvider>
    </React.Fragment>
  );
};

export default Tree;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const token = getCookie(TOKEN_KEY, ctx)?.toString();

  try {
    if (!token) throw new Error("Token not found");

    const user = await me(token);
    setCookie(USER_KEY, user, ctx);

    const isDataExists = getCookie(TREE_KEY, ctx)?.toString();
    if (!isDataExists) {
      return {
        redirect: {
          destination: "/families",
          permanent: false,
        },
      };
    }

    return {
      props: {},
    };
  } catch {
    // ignore
  }

  deleteCookie(USER_KEY, ctx);
  deleteCookie(TOKEN_KEY, ctx);

  const result = await sampleNodes();
  if (result.nodes.length <= 0) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: result,
  };
}
