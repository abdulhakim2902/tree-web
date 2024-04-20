import { useEffect, useState } from "react";
import { Root, Tree, TreeNode } from "../types/tree";
import { parseTreeNodeDetail } from "../helper/tree";
import { NODE_FAMILIES_KEY, TREE_KEY, TREE_ROOT_KEY } from "../constants/storage-key";
import { useRouter } from "next/navigation";
import { DAY } from "../helper/date";
import { setCookie } from "cookies-next";
import {
  Relative,
  addChild,
  addParent,
  addSibling,
  addSpouse,
  relativeNodes,
  updateNode,
  deleteNode,
  updateImageNode,
} from "../lib/services/node";
import { File, removeFiles } from "../lib/services/file";

/* Hooks */
import { useCacheContext } from "../context/cache";
import { useLoadingBarContext } from "../context/loading";
import { useSocketContext } from "../context/socket";
import { useAuthContext } from "../context/auth";
import { useSnackbar } from "notistack";

const defaultTree = {
  root: {
    id: "",
    isRoot: false,
  },
  nodes: [] as TreeNode[],
  nodeMap: {} as Record<string, TreeNode>,
};

type InitData = {
  root: Root;
  nodes: TreeNode[];
};

export const useTree = (init?: InitData) => {
  const router = useRouter();

  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const { get, set, del } = useCacheContext();
  const { isConnected, socket } = useSocketContext();
  const { startProgress, endProgress } = useLoadingBarContext();

  const [tree, setTree] = useState<Tree>(defaultTree);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (isConnected && user) {
      socket.on(`user:${user.id}:node:add`, (data: { id: string; nodes: TreeNode[] }) => {
        const currentNodeMap = get<Record<string, TreeNode>>(TREE_KEY);
        const hasNode = data.nodes.some((node) => Boolean(currentNodeMap?.[node.id]));

        if (hasNode) {
          const newNodeMap = Object.fromEntries(data.nodes.map((e) => [e.id, e]));
          const updatedNodeMap = { ...currentNodeMap, ...newNodeMap };

          set(TREE_KEY, updatedNodeMap, DAY);

          const nodes = parseTreeNodeDetail(Object.values(updatedNodeMap));
          const nodeMap = Object.fromEntries(nodes.map((e) => [e.id, e]));
          const updatedTree = { ...tree, nodes, nodeMap };

          setTree({ ...updatedTree });

          enqueueSnackbar({
            variant: "success",
            message: "New node is added to your tree",
          });
        }
      });
    }

    return () => {
      if (isConnected && user) {
        socket.off(`user:${user.id}:node:add`, () => {
          console.log("Close add nodes event");
        });
      }
    };
  }, [isConnected, user]);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (isConnected && user) {
      socket.on(`user:${user.id}:node:remove`, (data: { id: string; nodes: TreeNode[] }) => {
        const currentNodeMap = get<Record<string, TreeNode>>(TREE_KEY);
        const hasNode = data.nodes.some((node) => Boolean(currentNodeMap?.[node.id]));

        if (hasNode) {
          const newNodeMap = Object.fromEntries(data.nodes.map((e) => [e.id, e]));
          const updatedNodeMap = { ...currentNodeMap, ...newNodeMap };

          delete updatedNodeMap[data.id];

          set(TREE_KEY, updatedNodeMap, DAY);

          const root = tree.root;
          const nodes = parseTreeNodeDetail(Object.values(updatedNodeMap));
          const nodeMap = Object.fromEntries(nodes.map((e) => [e.id, e]));

          const updatedTree = { ...tree, nodes, nodeMap };

          if (root.id === data.id) {
            const isRoot = nodes[0].data?.families?.length <= 0;
            const newRoot = { id: nodes[0].id, isRoot };
            updatedTree.root = newRoot;
          }

          setTree({ ...updatedTree });

          enqueueSnackbar({
            variant: "success",
            message: "New node is removed from your tree",
          });
        }
      });
    }

    return () => {
      if (isConnected && user) {
        socket.off(`user:${user.id}:node:remove`, () => {
          console.log("Close remove nodes event");
        });
      }
    };
  }, [isConnected, user]);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    startProgress();

    if (init?.nodes && init.nodes.length > 0) {
      set(TREE_ROOT_KEY, init.root, DAY);
      set(TREE_KEY, Object.fromEntries(init.nodes.map((e) => [e.id, e])), DAY);

      const nodes = parseTreeNodeDetail(init.nodes);
      const nodeMap = Object.fromEntries(nodes.map((e) => [e.id, e]));
      const tree = { root: init.root, nodes, nodeMap };

      setTree({ ...tree });
      setCookie(TREE_KEY, true, { maxAge: DAY });

      del(NODE_FAMILIES_KEY);
    } else {
      const data = get<Record<string, TreeNode>>(TREE_KEY) ?? {};
      const currentRoot = get<Root>(TREE_ROOT_KEY);
      const nodes = parseTreeNodeDetail(Object.values(data));
      const nodeMap = Object.fromEntries(nodes.map((e) => [e.id, e]));
      if (nodes.length > 0) {
        const root = currentRoot ?? { id: nodes[0].id, isRoot: false };
        const tree = { nodes, nodeMap, root };

        setTree({ ...tree });
      } else {
        router.push("/families");
      }
    }

    endProgress();
  }, [init]);

  const addNode = async (id: string, data: any, type: string) => {
    switch (type) {
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

    del(NODE_FAMILIES_KEY);
  };

  const removeNode = async (id: string) => {
    await deleteNode(id);
    await removeFiles(id);
  };

  const editNode = async (id: string, data: any) => {
    if (!tree) throw new Error("Tree not found");

    const { node: updatedNode } = await updateNode(id, data);

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
  };

  const editProfileImageNode = async (id: string, data?: File) => {
    const currentNodeMap = get<Record<string, TreeNode>>(TREE_KEY);
    if (!currentNodeMap) return;

    if (!data) {
      delete currentNodeMap[id].data.profileImageURL;
      delete tree.nodeMap[id].data.profileImageURL;
      return;
    }

    await updateImageNode(id, data._id);

    tree.nodeMap[id].data.profileImageURL = data.url;
    currentNodeMap[id].data.profileImageURL = data.url;

    const updatedTree = { ...tree, nodes: Object.values(tree.nodeMap) };

    set(TREE_KEY, currentNodeMap, DAY);
    setTree(updatedTree);
  };

  const expandNode = async (id: string, relative: Relative) => {
    const { nodes: newNodes } = await relativeNodes(id, relative);

    const currentNodeMap = get<Record<string, TreeNode>>(TREE_KEY);

    if (!currentNodeMap) {
      throw new Error("Nodes not found");
    }

    const newNodeMap = Object.fromEntries(newNodes.map((e) => [e.id, e]));
    const updatedNodeMap = { ...currentNodeMap, ...newNodeMap };

    set(TREE_KEY, updatedNodeMap, DAY);

    const nodes = parseTreeNodeDetail(Object.values(updatedNodeMap));
    const nodeMap = Object.fromEntries(nodes.map((e) => [e.id, e]));
    const updatedTree = { ...tree, nodes, nodeMap };

    setTree({ ...updatedTree });
  };

  return {
    tree,

    addNode,
    editNode,
    removeNode,
    expandNode,
    editProfileImageNode,
  };
};
