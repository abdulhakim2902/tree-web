import React, { useEffect } from "react";
import TreeNodeDetails from "@tree/src/components/Tree/TreeNodeDetails/TreeNodeDetails";
import TreeWithNavigation from "@tree/src/components/Tree/TreeWithNavigation/TreeWithNavigation";
import { NavigationContextProvider } from "@tree/src/context/navigation";
import { NodeSelectionContextProvider, useNodeSelectionContext } from "@tree/src/context/tree";
import type { GetServerSidePropsContext, NextPage } from "next";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import s from "@tree/styles/TreePage.module.css";
import ShowIf from "@tree/src/components/show-if";
import { TOKEN_KEY, TREE_KEY, USER_KEY } from "@tree/src/constants/storage-key";
import { startCase } from "@tree/src/helper/string";
import { rootNodes, sampleNodes, searchNodes } from "@tree/src/lib/services/node";
import { Root, TreeNode } from "@tree/src/types/tree";
import { me } from "@tree/src/lib/services/user";
import { useTree } from "@tree/src/hooks/use-tree.hook";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";

type TreeProps = {
  root: Root;
  nodes: TreeNode[];
};

const Tree: NextPage<TreeProps> = (props: TreeProps) => {
  const { tree, addNode, removeNode, editNode, editProfileImageNode, expandNode } = useTree(props);
  const { root, nodes, nodeMap } = tree;

  const searchParams = useSearchParams();
  const router = useRouter();
  const search = searchParams.get("search");
  const nodeId = searchParams.get("nodeId");

  useEffect(() => {
    if (search || nodeId) {
      router.replace("/tree", undefined, { shallow: true });
    }
    /* eslint-disable react-hooks/exhaustive-deps */
  }, [search, nodeId])

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
          <TreeNodeDetails
            root={root}
            nodeMap={nodeMap}
            addNode={addNode}
            editNode={editNode}
            removeNode={removeNode}
            expandNode={expandNode}
            editImageNode={editProfileImageNode}
          />
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

    const { search, nodeId } = ctx.query;

    if (nodeId) {
      const id = Array.isArray(nodeId) ? nodeId[0] : nodeId;
      const { root, nodes } = await rootNodes(id, token);

      return {
        props: { root, nodes },
      };
    }

    if (search) {
      const name = Array.isArray(search) ? search[0] : search;
      const { root, nodes } = await searchNodes(name, token);

      return {
        props: { root, nodes },
      };
    }

    const isDataExists = getCookie(TREE_KEY, ctx);
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

  try {
    const { root, nodes } = await sampleNodes();
    if (nodes.length <= 0) {
      throw new Error("Empty nodes");
    }

    return {
      props: { nodes, root },
    };
  } catch {
    // ignore
  }

  return {
    redirect: {
      destination: "/",
      permanent: false,
    },
  };
}
