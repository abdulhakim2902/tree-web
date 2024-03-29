import { Bio } from "@tree/src/components/Form/Form";
import {
  addChild,
  addParent,
  addSibling,
  addSpouse,
  parentAndChildNodes as parentAndChildNodesAPI,
  spouseAndChildNodes as spouseAndChildNodesAPI,
  rootNodes as rootNodesAPI,
  searchNodes as searchNodesAPI,
  updateNode as updateNodeAPI,
  deleteNode as deleteNodeAPI,
} from "@tree/src/lib/services/node";
import { Tree, TreeNode } from "@tree/src/types/tree";
import { useSnackbar } from "notistack";
import { FC, KeyboardEvent, createContext, useContext, useState } from "react";
import { useAuthContext } from "./auth";
import { useRouter } from "next/router";
import { NODE_FAMILIES_KEY, TREE_KEY } from "@tree/src/constants/storage-key";
import { useCacheContext } from "./cache";
import { DAY } from "../helper/date";
import { File, remove } from "../lib/services/file";

type Loading = {
  main: boolean;
  expanded: {
    parent: boolean;
    spouse: boolean;
  };
  updated: boolean;
  added: boolean;
  deleted: boolean;
};

const defaultLoading = {
  main: false,
  expanded: {
    parent: false,
    spouse: false,
  },
  updated: false,
  added: false,
  deleted: false,
};

const defaultTree = {
  root: {
    id: "",
    isRoot: false,
  },
  nodes: [] as TreeNode[],
  nodeMap: {},
};

type TreeNodeDataContextValue = {
  loading: Loading;
  query: string;
  tree: Tree;
  init: boolean;

  setInit: (value: boolean) => void;
  initNodes: () => void;
  setQuery: (query: string) => void;
  searchNodes: (event?: KeyboardEvent) => void;
  rootNodes: (id?: string) => void;
  expandNode: (id: string, type: string, cb?: () => void) => void;
  updateNode: (id: string, data: Bio, cb?: (success: boolean, error?: string) => void) => void;
  updateNodeProfile: (id: string, data?: File) => void;
  addNode: (id: string, data: any, type: string, cb?: (success: boolean, error?: string) => void) => void;
  deleteNode: (id: string, cb?: (success: boolean, error?: string) => void) => void;
  clearNodes: () => void;
};

const TreeNodeDataContext = createContext<TreeNodeDataContextValue | null>(null);

export const TreeNodeDataContextProvider: FC = ({ children }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { get, set, del, clear } = useCacheContext();
  const { setUser } = useAuthContext();
  const { pathname, push } = useRouter();

  const [init, setInit] = useState<boolean>(true);
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<Loading>(defaultLoading);
  const [tree, setTree] = useState<Tree>(defaultTree);

  const clearNodes = () => {
    clear();
    setTree(defaultTree);
  };

  const initNodes = async () => {
    setLoading((prev) => ({ ...prev, main: true }));

    const tree = get<Tree>(TREE_KEY);
    if (tree && tree.nodes.length > 0) {
      setTree({ ...tree });
      setInit(true);
    } else {
      push("/families");
      enqueueSnackbar({
        variant: "error",
        message: "Tree not found",
      });
    }

    setLoading((prev) => ({ ...prev, main: false }));
  };

  const rootNodes = async (id?: string) => {
    if (!id) return;

    try {
      setLoading((prev) => ({ ...prev, main: true }));

      const tree = await rootNodesAPI(id);

      del(NODE_FAMILIES_KEY);
      set(TREE_KEY, tree, DAY);
      setTree(tree);
      setInit(true);

      if (tree.nodes.length <= 0) {
        if (pathname !== "/families") push("/families");
        enqueueSnackbar({
          variant: "error",
          message: "Tree not found",
        });
      } else {
        if (pathname !== "/tree") push("/tree");
      }
    } catch (err: any) {
      enqueueSnackbar({
        variant: "error",
        message: err.message,
      });
    } finally {
      setLoading((prev) => ({ ...prev, main: false }));
    }
  };

  const searchNodes = async (event?: KeyboardEvent) => {
    if (!query) return;
    if (event && event?.key !== "Enter") return;

    try {
      setLoading((prev) => ({ ...prev, main: true }));

      const tree = await searchNodesAPI(query);

      del(NODE_FAMILIES_KEY);
      set(TREE_KEY, tree, DAY);
      setTree(tree);
      setInit(true);

      if (tree.nodes.length <= 0) {
        if (pathname !== "/families") push("/families");
        enqueueSnackbar({
          variant: "error",
          message: "Tree not found",
        });
      } else {
        if (pathname !== "/tree") push("/tree");
      }
    } catch (err: any) {
      enqueueSnackbar({
        variant: "error",
        message: err.message,
      });
    } finally {
      setQuery("");
      setLoading((prev) => ({ ...prev, main: false }));
    }
  };

  const expandNode = (id: string, relative: string) => {
    switch (relative) {
      case "parent":
      case "sibling":
        parentAndChildNodes(id);
        break;

      case "spouse":
      case "child":
        spouseAndChildNodes(id);
        break;
    }
  };

  const addNode = async (id: string, data: any, relative: string, cb?: (success: boolean, error?: string) => void) => {
    let success = false;
    let message = "New member is added to the family";

    try {
      setLoading((prev) => ({ ...prev, added: true }));

      switch (relative) {
        case "spouse":
          await addSpouse(id, data);
          await spouseAndChildNodes(id);
          break;

        case "child":
          await addChild(id, data);
          await spouseAndChildNodes(id);
          break;

        case "brother":
        case "sister":
          await addSibling(id, data);
          await parentAndChildNodes(id);
          break;

        case "parent":
          await addParent(id, data);
          await parentAndChildNodes(id);
          break;
      }

      del(NODE_FAMILIES_KEY);

      success = true;
    } catch (err: any) {
      message = err.message;
    } finally {
      setLoading((prev) => ({ ...prev, added: false }));
    }

    cb && cb(success, !success ? message : undefined);

    enqueueSnackbar({
      variant: success ? "success" : "error",
      message: message,
    });
  };

  const deleteNode = async (id: string, cb?: (success: boolean, error?: string) => void) => {
    if (!id) return;

    let success = false;
    let message = "Relative is deleted from the family";

    try {
      setLoading((prev) => ({ ...prev, deleted: true }));

      await deleteNodeAPI(id);
      await remove(id, "node");

      const updatedNodes = tree.nodes
        .map((node) => {
          node.parents = node.parents.filter((parent) => parent.id !== id);
          node.children = node.children.filter((child) => child.id !== id);
          node.spouses = node.spouses.filter((spouse) => spouse.id !== id);
          node.siblings = node.siblings.filter((sibling) => sibling.id !== id);
          if (node?.data?.families) {
            node.data.families = node.data.families.filter((family) => family.id !== id);
          }

          return node;
        })
        .filter((node) => node.id !== id);

      const nodeMap = Object.fromEntries(updatedNodes.map((e) => [e.id, e]));

      const updatedTree = { ...tree, nodes: updatedNodes, nodeMap };

      set(TREE_KEY, updatedTree, DAY);
      setTree({ ...updatedTree });

      success = true;
    } catch (err: any) {
      message = err.message;
    } finally {
      setLoading((prev) => ({ ...prev, deleted: false }));
    }

    cb && cb(success, !success ? message : undefined);

    enqueueSnackbar({
      variant: success ? "success" : "error",
      message: message,
    });
  };

  const updateNode = async (id: string, data: any, cb?: (success: boolean, error?: string) => void) => {
    if (!tree) return;

    let success = false;
    let message = "";

    try {
      setLoading((prev) => ({ ...prev, updated: true }));

      const { node: updatedNode } = await updateNodeAPI(id, data);
      const updatedNodes = tree.nodes.map((node) => {
        if (node.id === updatedNode.id) {
          node.data.birth = updatedNode.birth;
          node.data.name = updatedNode.name;
          node.data.fullname = updatedNode.fullname;
        }

        return node;
      });

      const updatedNodeMap = tree.nodeMap[updatedNode.id];
      updatedNodeMap.data.birth = updatedNode.birth;
      updatedNodeMap.data.name = updatedNode.name;
      updatedNodeMap.data.fullname = updatedNode.fullname;
      tree.nodeMap[updatedNode.id] = updatedNodeMap;

      const updatedTree = { ...tree, nodes: updatedNodes };

      setUser(id, updatedNode.fullname);

      del(NODE_FAMILIES_KEY);
      set(TREE_KEY, updatedTree, DAY);
      setTree(updatedTree);

      success = true;
      message = `${updatedNode.fullname} biography is updated`;
    } catch (err: any) {
      message = err.message;
    } finally {
      setLoading((prev) => ({ ...prev, updated: false }));
    }

    cb && cb(success, !success ? message : undefined);

    enqueueSnackbar({
      variant: success ? "success" : "error",
      message: message,
    });
  };

  const parentAndChildNodes = async (id: string) => {
    if (!tree) return;

    try {
      setLoading((prev) => ({ ...prev, expanded: { ...prev.expanded, parent: true } }));

      const currentNodes = tree.nodes;

      const { nodes: newNodes } = await parentAndChildNodesAPI(id);

      const updatedNodes = currentNodes.map((node) => {
        if (node.id !== id) return node;
        const updatedNode = newNodes.find((e) => e.id === id);
        if (updatedNode) {
          node.parents = updatedNode.parents;
          node.siblings = updatedNode.siblings;
          const expandable = node.data.metadata?.expandable ?? { parents: true, siblings: true };
          expandable.parents = false;
          expandable.siblings = false;
        }

        return node;
      });

      const updatedNewNodes = newNodes.filter((node) => node.id !== id);
      const result = [...updatedNodes, ...updatedNewNodes];
      const nodeMap = Object.fromEntries(result.map((e) => [e.id, e]));

      const updatedTree = { ...tree, nodes: result, nodeMap };

      set(TREE_KEY, updatedTree, DAY);
      setTree({ ...updatedTree });
    } catch (err: any) {
      enqueueSnackbar({
        variant: "error",
        message: err.message,
      });
    } finally {
      setLoading((prev) => ({ ...prev, expanded: { ...prev.expanded, parent: false } }));
    }
  };

  const spouseAndChildNodes = async (id: string) => {
    if (!tree) return;

    try {
      setLoading((prev) => ({ ...prev, expanded: { ...prev.expanded, spouse: true } }));

      const { nodes: newNodes } = await spouseAndChildNodesAPI(id);

      const updatedNodes = tree.nodes.map((node) => {
        if (node.id !== id) return node;
        const updatedNode = newNodes.find((e) => e.id === id);

        if (updatedNode) {
          node.spouses = updatedNode.spouses;
          node.children = updatedNode.children;
          const expandable = node.data.metadata?.expandable ?? { spouses: true, children: true };
          expandable.spouses = false;
          expandable.children = false;
        }

        return node;
      });

      const updatedNewNodes = newNodes.filter((node) => node.id !== id);
      const result = [...updatedNodes, ...updatedNewNodes];
      const nodeMap = Object.fromEntries(result.map((e: TreeNode) => [e.id, e]));

      const updatedTree = { ...tree, nodes: result, nodeMap };

      set(TREE_KEY, updatedTree, DAY);
      setTree({ ...updatedTree });
    } catch (err: any) {
      enqueueSnackbar({
        variant: "error",
        message: err.message,
      });
    } finally {
      setLoading((prev) => ({ ...prev, expanded: { ...prev.expanded, spouse: false } }));
    }
  };

  const updateNodeProfile = (id: string, data?: File) => {
    tree.nodes = tree.nodes.map((node) => {
      if (node.id === id) {
        if (data) {
          node.data.profileImageURL = data.url;
        } else {
          delete node.data.profileImageURL;
        }
      }

      return node;
    });

    const node = tree.nodeMap[id];
    if (node) {
      if (data) {
        node.data.profileImageURL = data.url;
      } else {
        delete node.data.profileImageURL;
      }
    }
    tree.nodeMap[id] = node;

    set(TREE_KEY, tree, DAY);
    setTree({ ...tree });
  };

  return (
    <TreeNodeDataContext.Provider
      value={{
        loading,
        query,
        tree,
        init,
        setInit,
        clearNodes,
        setQuery,
        initNodes,
        rootNodes,
        searchNodes,
        updateNode,
        updateNodeProfile,
        expandNode,
        addNode,
        deleteNode,
      }}
    >
      {children}
    </TreeNodeDataContext.Provider>
  );
};

export const useTreeNodeDataContext = (): TreeNodeDataContextValue => {
  const TreeNodeDataContextValue = useContext(TreeNodeDataContext);

  if (!TreeNodeDataContextValue) {
    throw Error("useTreeNodeDataContext hook must be used inside TreeNodeDataContext provider");
  }

  return TreeNodeDataContextValue;
};
