import { Bio } from "@tree/src/components/Form/Form";
import {
  addChild,
  addParent,
  addSibling,
  addSpouse,
  relativeNodes,
  rootNodes as rootNodesAPI,
  searchNodes as searchNodesAPI,
  updateNode as updateNodeAPI,
  deleteNode as deleteNodeAPI,
  Relative,
} from "@tree/src/lib/services/node";
import { Root, Tree, TreeNode } from "@tree/src/types/tree";
import { useSnackbar } from "notistack";
import { FC, KeyboardEvent, createContext, useContext, useState } from "react";
import { useRouter } from "next/router";
import { NODE_FAMILIES_KEY, TREE_KEY, TREE_ROOT_KEY } from "@tree/src/constants/storage-key";
import { useCacheContext } from "./cache";
import { DAY } from "../helper/date";
import { File, removeFile } from "../lib/services/file";
import { parseTreeNodeDetail } from "../helper/tree";
import { useLoadingBarContext } from "./loading";
import { setCookie } from "cookies-next";

type Loading = {
  main: boolean;
  expanded: {
    parents: boolean;
    spouses: boolean;
    children: boolean;
    siblings: boolean;
  };
  updated: boolean;
  added: boolean;
  deleted: boolean;
};

const defaultLoading = {
  main: false,
  expanded: {
    parents: false,
    spouses: false,
    children: false,
    siblings: false,
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
  initNodes: (data?: { root: Root; nodes: TreeNode[] }) => void;
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
  const { pathname, push } = useRouter();
  const { startProgress, endProgress } = useLoadingBarContext();

  const [init, setInit] = useState<boolean>(true);
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<Loading>(defaultLoading);
  const [tree, setTree] = useState<Tree>(defaultTree);

  const clearNodes = () => {
    clear();
    setTree(defaultTree);
  };

  const initNodes = async (init?: { root: Root; nodes: TreeNode[] }) => {
    setLoading((prev) => ({ ...prev, main: true }));
    startProgress();

    if (init?.nodes && init.nodes.length > 0) {
      setLoading((prev) => ({ ...prev, main: false }));
      endProgress();

      const root = init.root;
      const nodes = parseTreeNodeDetail(init.nodes);
      const nodeMap = Object.fromEntries(nodes.map((e) => [e.id, e]));
      const tree = { root, nodes, nodeMap };

      setTree({ ...tree });
      setInit(true);

      setLoading((prev) => ({ ...prev, main: false }));
      endProgress();

      return;
    }

    const data = get<Record<string, TreeNode>>(TREE_KEY);

    const root = get<Root>(TREE_ROOT_KEY);
    const nodes = parseTreeNodeDetail(Object.values(data ?? {}));
    const nodeMap = Object.fromEntries(nodes.map((e) => [e.id, e]));
    if (nodes.length > 0) {
      const tree = { nodes, nodeMap, root: root ?? { id: nodes[0].id, isRoot: nodes[0].data.families.length <= 0 } };
      setTree({ ...tree });
      setInit(true);
    } else {
      push("/families");
    }

    setLoading((prev) => ({ ...prev, main: false }));
    endProgress();
  };

  const rootNodes = async (id?: string) => {
    if (!id) return;

    try {
      setLoading((prev) => ({ ...prev, main: true }));
      startProgress();

      const { root, nodes: data } = await rootNodesAPI(id);

      set(TREE_ROOT_KEY, root, DAY);
      set(TREE_KEY, Object.fromEntries(data.map((e) => [e.id, e])), DAY);

      const nodes = parseTreeNodeDetail(data);
      const nodeMap = Object.fromEntries(nodes.map((e) => [e.id, e]));
      const tree = { root, nodes, nodeMap };

      del(NODE_FAMILIES_KEY);

      setTree(tree);
      setInit(true);
      setCookie(TREE_KEY, true, { maxAge: DAY });

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
      endProgress();
    }
  };

  const searchNodes = async (event?: KeyboardEvent) => {
    if (!query) return;
    if (event && event?.key !== "Enter") return;

    try {
      setLoading((prev) => ({ ...prev, main: true }));
      startProgress();

      const { root, nodes: data } = await searchNodesAPI(query);

      set(TREE_ROOT_KEY, root, DAY);
      set(TREE_KEY, Object.fromEntries(data.map((e) => [e.id, e])), DAY);

      const nodes = parseTreeNodeDetail(data);
      const nodeMap = Object.fromEntries(nodes.map((e) => [e.id, e]));
      const tree = { root, nodes, nodeMap };

      del(NODE_FAMILIES_KEY);

      setTree(tree);
      setInit(true);
      setCookie(TREE_KEY, true, { maxAge: DAY });

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
      endProgress();
    }
  };

  const expandNode = async (id: string, type: string) => {
    if (loading.main) return;

    let relative: Relative;
    if (type === "parent") relative = "parents";
    else if (type === "child") relative = "children";
    else if (type === "spouse") relative = "spouses";
    else if (type === "sibling") relative = "siblings";
    else if (type === "brother") relative = "siblings";
    else if (type === "sister") relative = "siblings";
    else return;

    try {
      setLoading((prev) => ({ ...prev, expanded: { ...prev.expanded, [relative]: true } }));

      const { nodes: newNodes } = await relativeNodes(id, relative);

      const currentNodeMap = get<Record<string, TreeNode>>(TREE_KEY);

      if (!currentNodeMap) {
        throw new Error("Nodes not found");
      }

      for (const node of newNodes) {
        currentNodeMap[node.id] = node;
      }

      set(TREE_KEY, currentNodeMap, DAY);

      const nodes = parseTreeNodeDetail(Object.values(currentNodeMap));
      const nodeMap = Object.fromEntries(nodes.map((e) => [e.id, e]));
      const updatedTree = { ...tree, nodes, nodeMap };

      setTree({ ...updatedTree });
    } catch (err: any) {
      console.log(err);
      enqueueSnackbar({
        variant: "error",
        message: err.message,
      });
    } finally {
      setLoading((prev) => ({ ...prev, expanded: { ...prev.expanded, [relative]: false } }));
    }
  };

  const addNode = async (id: string, data: any, relative: string, cb?: (success: boolean, error?: string) => void) => {
    if (loading.main) return;

    let success = false;
    let message = "New member is added to the family";

    try {
      setLoading((prev) => ({ ...prev, added: true }));

      switch (relative) {
        case "spouse":
          await addSpouse(id, data);
          break;

        case "child":
          await addChild(id, data);
          break;

        case "brother":
        case "sister":
          await addSibling(id, data);
          break;

        case "parent":
          await addParent(id, data);
          break;

        default:
          throw new Error("Relative not found");
      }

      await expandNode(id, relative);

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
    if (loading.main) return;
    if (!id) return;

    let success = false;
    let message = "Relative is deleted from the family";

    try {
      setLoading((prev) => ({ ...prev, deleted: true }));

      await deleteNodeAPI(id);
      await removeFile(id, "node");

      const currentNodeMap = get<Record<string, TreeNode>>(TREE_KEY);

      if (!currentNodeMap) {
        throw new Error("Nodes not found");
      }

      const node = currentNodeMap[id];
      const relations = [...node.parents, ...node.children, ...node.spouses, ...node.siblings];

      for (const relation of relations) {
        const node = tree.nodeMap[relation.id];
        node.parents = node.parents.filter((parent) => parent.id !== id);
        node.children = node.children.filter((child) => child.id !== id);
        node.spouses = node.spouses.filter((spouse) => spouse.id !== id);
        node.siblings = node.siblings.filter((sibling) => sibling.id !== id);
        if (node?.data?.families) {
          node.data.families = node.data.families.filter((family) => family.id !== id);
        }
        currentNodeMap[relation.id] = node;
      }

      delete currentNodeMap[id];

      const root = tree.root.id === id ? undefined : tree.root;
      const nodes = parseTreeNodeDetail(Object.values(currentNodeMap));
      const nodeMap = Object.fromEntries(nodes.map((e) => [e.id, e]));

      const updatedTree = {
        root: root ?? { id: nodes[0].id, isRoot: nodes[0].data.families.length <= 0 },
        nodes,
        nodeMap,
      };

      set(TREE_ROOT_KEY, updatedTree.root, DAY);
      set(TREE_KEY, currentNodeMap, DAY);
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
    if (loading.main) return;
    if (!tree) return;

    let success = false;
    let message = "";

    try {
      setLoading((prev) => ({ ...prev, updated: true }));

      const { node: updatedNode } = await updateNodeAPI(id, data);

      const currentNodeMap = get<Record<string, TreeNode>>(TREE_KEY);

      if (!currentNodeMap) {
        throw new Error("Nodes not found");
      }

      currentNodeMap[id].data = {
        ...currentNodeMap[id].data,
        birth: updatedNode.birth,
        name: updatedNode.name,
        fullname: updatedNode.fullname,
      };

      tree.nodeMap[id].data = {
        ...tree.nodeMap[id].data,
        birth: updatedNode.birth,
        name: updatedNode.name,
        fullname: updatedNode.fullname,
      };

      set(TREE_KEY, currentNodeMap, DAY);

      const updatedTree = { ...tree, nodes: Object.values(tree.nodeMap) };

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

  const updateNodeProfile = (id: string, data?: File) => {
    if (loading.main) return;
    const currentNodeMap = get<Record<string, TreeNode>>(TREE_KEY);
    if (!currentNodeMap) return;

    if (!data) {
      delete currentNodeMap[id].data.profileImageURL;
      delete tree.nodeMap[id].data.profileImageURL;
      return;
    }

    tree.nodeMap[id].data.profileImageURL = data.url;
    currentNodeMap[id].data.profileImageURL = data.url;

    const updatedTree = { ...tree, nodes: Object.values(tree.nodeMap) };

    set(TREE_KEY, currentNodeMap, DAY);
    setTree(updatedTree);
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
