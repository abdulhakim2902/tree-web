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
import { File, removeFile } from "../lib/services/file";

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
  const { get, set, del } = useCacheContext();
  const { isConnected, socket } = useSocketContext();
  const { enqueueSnackbar } = useSnackbar();
  const { startProgress, endProgress } = useLoadingBarContext();

  const [tree, setTree] = useState<Tree>(defaultTree);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (isConnected && user) {
      socket.on(`user:${user.id}:node`, (data: { node: TreeNode; nodes: TreeNode[]; action: string }) => {
        const currentNodeMap = get<Record<string, TreeNode>>(TREE_KEY) ?? {};
        const found =
          data.action === "add"
            ? data.node.parents.find((e) => Boolean(currentNodeMap[e.id]))
            : currentNodeMap[data.node.id];

        if (found) {
          const updatedNodes = data.action === "add" ? [data.node, ...data.nodes] : data.nodes;

          const newNodeMap = Object.fromEntries(updatedNodes.map((e) => [e.id, e]));
          const updatedNodeMap = { ...currentNodeMap, ...newNodeMap };

          if (data.action === "remove") {
            delete updatedNodeMap[data.node.id];
          }

          set(TREE_KEY, updatedNodeMap, DAY);

          const nodes = parseTreeNodeDetail(Object.values(updatedNodeMap));
          const nodeMap = Object.fromEntries(nodes.map((e) => [e.id, e]));
          const tree = { nodes, nodeMap } as Tree;

          const currentRoot = get<Root>(TREE_ROOT_KEY);
          if (data.action === "add") {
            tree.root = currentRoot ?? { id: nodes[0].id, isRoot: false };
          } else {
            const root = currentRoot?.id === data.node.id ? undefined : currentRoot;
            tree.root = root ?? { id: nodes[0].id, isRoot: nodes[0].data.families.length <= 0 };
          }

          setTree({ ...tree });
          set(TREE_ROOT_KEY, tree.root, DAY);

          enqueueSnackbar({
            variant: "success",
            message: data.action === "add" ? "New node is added to your tree" : "Node is removed from your tree",
          });
        }
      });
    }

    return () => {
      if (isConnected && user) {
        socket.off(`user:${user.id}:node`, () => {
          console.log("Close nodes event");
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
    let relative: Relative;
    let ids = [] as string[];

    switch (type) {
      case "spouse":
        ids = await addSpouse(id, data);
        relative = "spouses";
        break;

      case "child":
        ids = [await addChild(id, data)];
        relative = "children";
        break;

      case "brother":
      case "sister":
        ids = [await addSibling(id, data)];
        relative = "siblings";
        break;

      case "parent":
        ids = await addParent(id, data);
        relative = "parents";
        break;

      default:
        throw new Error("Relative not found");
    }

    await expandNode(id, relative);

    del(NODE_FAMILIES_KEY);

    return ids;
  };

  const removeNode = async (id: string) => {
    const { nodes: updatedNodes } = await deleteNode(id);

    await removeFile(id, "node");

    const currentNodeMap = get<Record<string, TreeNode>>(TREE_KEY);

    if (!currentNodeMap) {
      throw new Error("Nodes not found");
    }

    for (const node of updatedNodes) {
      currentNodeMap[node.id] = node;
    }

    delete currentNodeMap[id];

    set(TREE_KEY, currentNodeMap, DAY);

    const root = tree.root.id === id ? undefined : tree.root;
    const nodes = parseTreeNodeDetail(Object.values(currentNodeMap));
    const nodeMap = Object.fromEntries(nodes.map((e) => [e.id, e]));

    const updatedTree = {
      root: root ?? { id: nodes[0].id, isRoot: nodes[0].data.families.length <= 0 },
      nodes,
      nodeMap,
    };

    set(TREE_ROOT_KEY, updatedTree.root, DAY);
    setTree({ ...updatedTree });
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

    console.log(newNodes);

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
