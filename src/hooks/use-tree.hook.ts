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
      socket.on(`user:${user.id}:node`, (data: { node: TreeNode; nodes: TreeNode[] }) => {
        console.log(data);
        const cache = get<Record<string, TreeNode>>(TREE_KEY) ?? {};
        const found = data.node.parents.find((e) => Boolean(cache[e.id]));
        if (found) {
          const newNodeMap = Object.fromEntries([data.node, ...data.nodes].map((e) => [e.id, e]));
          const updatedNodeMap = { ...cache, ...newNodeMap };
          const currentRoot = get<Root>(TREE_ROOT_KEY);
          const nodes = parseTreeNodeDetail(Object.values(updatedNodeMap));
          const nodeMap = Object.fromEntries(nodes.map((e) => [e.id, e]));
          const root = currentRoot ?? { id: nodes[0].id, isRoot: false };
          const tree = { nodes, nodeMap, root };

          setTree({ ...tree });

          enqueueSnackbar({
            variant: "success",
            message: "New node is added to your tree",
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
    await deleteNode(id);
    await removeFile(id, "node");

    const currentNodeMap = get<Record<string, TreeNode>>(TREE_KEY);

    if (!currentNodeMap) {
      throw new Error("Nodes not found");
    }

    const node = currentNodeMap[id];
    const relations = [...node.parents, ...node.children, ...node.spouses, ...node.siblings];

    for (const relation of relations) {
      const node = tree.nodeMap[relation.id];
      if (!node) continue;
      node.parents = node.parents.filter((parent) => parent.id !== id);
      node.children = node.children.filter((child) => child.id !== id);
      node.spouses = node.spouses.filter((spouse) => spouse.id !== id);
      node.siblings = node.siblings.filter((sibling) => sibling.id !== id);
      node.data.families = node?.data?.families?.filter((family) => family.id !== id) ?? [];

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

    for (const node of newNodes) {
      currentNodeMap[node.id] = node;
    }

    set(TREE_KEY, currentNodeMap, DAY);

    const nodes = parseTreeNodeDetail(Object.values(currentNodeMap));
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
