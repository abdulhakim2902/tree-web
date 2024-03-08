import { Bio } from "@/components/Form/Form";
import { RelationType } from "@/components/Tree/TreeNodeDetails/BioRelationButtons/BioRelationButtons";
import { parseJSON } from "@/helper/parse-json";
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
} from "@/services/node";
import { TreeNode } from "@/types/tree";
import { startCase } from "lodash";
import { useSnackbar } from "notistack";
import { FC, KeyboardEvent, createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuthContext } from "./auth";
import { useRouter } from "next/router";
import { NODES_KEY, NODE_FAMILIES_KEY, NODE_KEY, NODE_MAP_KEY } from "@/constants/storage-key";

type Node = {
  id: string;
  isRoot: boolean;
};

type Loading = {
  main: boolean;
  expanded: {
    parent: boolean;
    spouse: boolean;
  };
  updated: boolean;
  added: boolean;
};

const defaultNode = {
  id: "",
  isRoot: false,
};

const defaultLoading = {
  main: false,
  expanded: {
    parent: false,
    spouse: false,
  },
  updated: false,
  added: false,
};

type TreeNodeDataContextValue = {
  loading: Loading;
  query: string;
  node: Node;
  nodes: TreeNode[];
  nodeMap: Record<string, TreeNode>;

  initNodes: () => void;
  setQuery: (query: string) => void;
  searchNodes: (event?: KeyboardEvent) => void;
  rootNodes: (id?: string) => void;
  expandNode: (id: string, type: RelationType, cb?: () => void) => void;
  updateNode: (id: string, data: Bio, cb?: (success: boolean, error?: string) => void) => void;
  addNode: (id: string, data: any, relationType: RelationType, cb?: (success: boolean, error?: string) => void) => void;
  deleteNode: (id: string) => void;
  clearNodes: () => void;
};

const TreeNodeDataContext = createContext<TreeNodeDataContextValue | null>(null);

export const TreeNodeDataContextProvider: FC = ({ children }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { setUser } = useAuthContext();
  const { pathname, push } = useRouter();

  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<Loading>(defaultLoading);

  const [node, setNode] = useState<Node>(defaultNode);
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [nodeMap, setNodeMap] = useState<Record<string, TreeNode>>({});

  const clearNodes = () => {
    setNode(defaultNode);
    setNodes([]);
    setNodeMap({});

    localStorage.clear();
  };

  const initNodes = async () => {
    setLoading((prev) => ({ ...prev, main: true }));

    const nodeStr = localStorage.getItem(NODE_KEY);
    const nodesStr = localStorage.getItem(NODES_KEY);
    const nodeMapStr = localStorage.getItem(NODE_MAP_KEY);

    const node = parseJSON<Node>(nodeStr);
    const nodes = parseJSON<TreeNode[]>(nodesStr);
    const nodeMap = parseJSON<Record<string, TreeNode>>(nodeMapStr);

    if (node && nodes && nodeMap) {
      setNode(node);
      setNodes(nodes);
      setNodeMap(nodeMap);
    }

    setLoading((prev) => ({ ...prev, main: false }));
  };

  const rootNodes = async (id?: string) => {
    if (!id) return;

    try {
      setLoading((prev) => ({ ...prev, main: true }));

      const { node, nodes, nodeMap } = await rootNodesAPI(id);

      localStorage.removeItem(NODE_FAMILIES_KEY);

      setNode(node);
      setNodes([...nodes]);
      setNodeMap({ ...nodeMap });

      localStorage.setItem(NODE_KEY, JSON.stringify(node));
      localStorage.setItem(NODES_KEY, JSON.stringify(nodes));
      localStorage.setItem(NODE_MAP_KEY, JSON.stringify(nodeMap));

      if (pathname !== "/tree") {
        setLoading((prev) => ({ ...prev, main: false }));
        push("/tree");
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

      const { node, nodes, nodeMap } = await searchNodesAPI(query);

      localStorage.removeItem(NODE_FAMILIES_KEY);

      setNode(node);
      setNodes([...nodes]);
      setNodeMap({ ...nodeMap });

      localStorage.setItem(NODE_KEY, JSON.stringify(node));
      localStorage.setItem(NODES_KEY, JSON.stringify(nodes));
      localStorage.setItem(NODE_MAP_KEY, JSON.stringify(nodeMap));

      if (pathname === "/") push("/tree");
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

  const expandNode = (id: string, type: RelationType) => {
    switch (type) {
      case RelationType.Parents:
      case RelationType.Siblings:
        parentAndChildNodes(id);
        break;

      case RelationType.Spouses:
      case RelationType.Children:
        spouseAndChildNodes(id);
        break;
    }
  };

  const addNode = async (
    id: string,
    data: any,
    relationType: RelationType,
    cb?: (success: boolean, error?: string) => void,
  ) => {
    let success = false;
    let message = "New member is added to the family";

    try {
      setLoading((prev) => ({ ...prev, added: true }));

      switch (relationType) {
        case RelationType.Spouses:
          await addSpouse(id, data);
          await spouseAndChildNodes(id);
          break;

        case RelationType.Children:
          await addChild(id, data);
          await spouseAndChildNodes(id);
          break;

        case RelationType.Siblings:
          await addSibling(id, data);
          await parentAndChildNodes(id);
          break;

        case RelationType.Parents:
          await addParent(id, data);
          await parentAndChildNodes(id);
          break;
      }

      localStorage.removeItem(NODE_FAMILIES_KEY);

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

  const updateNode = async (id: string, data: any, cb?: (success: boolean, error?: string) => void) => {
    let success = false;
    let message = "";

    try {
      setLoading((prev) => ({ ...prev, updated: true }));

      const { node: updatedNode } = await updateNodeAPI(id, data);
      const updatedNodes = nodes.map((node) => {
        if (node.id === updatedNode.id) {
          node.data.birth = updatedNode.birth;
          node.data.name = updatedNode.name;
          node.data.fullname = updatedNode.fullname;
        }

        return node;
      });

      const updatedNodeMap = nodeMap[updatedNode.id];
      updatedNodeMap.data.birth = updatedNode.birth;
      updatedNodeMap.data.name = updatedNode.name;
      updatedNodeMap.data.fullname = updatedNode.fullname;
      nodeMap[updatedNode.id] = updatedNodeMap;

      localStorage.removeItem(NODE_FAMILIES_KEY);

      setUser(id, updatedNode.fullname);
      setNodes([...updatedNodes]);
      setNodeMap({ ...nodeMap });

      localStorage.setItem(NODES_KEY, JSON.stringify(updatedNodes));
      localStorage.setItem(NODE_MAP_KEY, JSON.stringify(updatedNodeMap));

      success = true;
      message = `${startCase(updatedNode.fullname)} biography is updated`;
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
    try {
      setLoading((prev) => ({ ...prev, expanded: { ...prev.expanded, parent: true } }));

      const currentNodes = nodes;

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

      setNodes([...result]);
      setNodeMap({ ...nodeMap });

      localStorage.setItem(NODES_KEY, JSON.stringify(result));
      localStorage.setItem(NODE_MAP_KEY, JSON.stringify(nodeMap));
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
    try {
      setLoading((prev) => ({ ...prev, expanded: { ...prev.expanded, spouse: true } }));

      const { nodes: newNodes } = await spouseAndChildNodesAPI(id);

      const updatedNodes = nodes.map((node) => {
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

      setNodes([...result]);
      setNodeMap({ ...nodeMap });

      localStorage.setItem(NODES_KEY, JSON.stringify(result));
      localStorage.setItem(NODE_MAP_KEY, JSON.stringify(nodeMap));
    } catch (err: any) {
      enqueueSnackbar({
        variant: "error",
        message: err.message,
      });
    } finally {
      setLoading((prev) => ({ ...prev, expanded: { ...prev.expanded, spouse: false } }));
    }
  };

  // TODO: Not implemented yet
  const deleteNode = useCallback(
    (id: string) => {
      const updatedNodes = nodes
        .filter((node) => node.id !== id)
        .map((node) => {
          node.spouses = node.spouses.filter((spouse) => spouse.id !== id);
          node.parents = node.parents.filter((parent) => parent.id !== id);
          node.siblings = node.siblings.filter((sibling) => sibling.id !== id);
          node.children = node.children.filter((child) => child.id !== id);

          return node;
        });

      delete nodeMap[id];

      for (const nodeId in nodeMap) {
        const node = nodeMap[nodeId];
        node.spouses = node.spouses.filter((spouse) => spouse.id !== id);
        node.parents = node.parents.filter((parent) => parent.id !== id);
        node.siblings = node.siblings.filter((sibling) => sibling.id !== id);
        node.children = node.children.filter((child) => child.id !== id);
        nodeMap[nodeId] = node;
      }

      setNodes([...updatedNodes]);
      setNodeMap({ ...nodeMap });

      localStorage.setItem(NODES_KEY, JSON.stringify(updatedNodes));
      localStorage.setItem(NODE_MAP_KEY, JSON.stringify(nodeMap));
    },
    [nodeMap, nodes],
  );

  return (
    <TreeNodeDataContext.Provider
      value={{
        loading,
        node,
        query,
        nodes,
        nodeMap,
        clearNodes,
        setQuery,
        initNodes,
        rootNodes,
        searchNodes,
        updateNode,
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
