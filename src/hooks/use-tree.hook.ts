import { useEffect, useState } from "react";
import { Root, Tree, TreeNode } from "../types/tree";
import { parseTreeNodeDetail } from "../helper/tree";
import { NODE_FAMILIES_KEY, TREE_KEY, TREE_ROOT_KEY } from "../constants/storage-key";
import { useRouter } from "next/navigation";
import { DAY } from "../helper/date";
import { setCookie } from "cookies-next";
import { Role } from "../types/user";
import { RelType } from "../lib/relatives-tree/types";

/* API Services */
import {
  Relative,
  addChild,
  addParent,
  addSibling,
  addSpouse,
  relativeNodes,
  updateNode,
  updateImageNode,
  createDeleteNodeRequest,
} from "../lib/services/node";
import { File } from "../lib/services/file";

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

type NodeEvent = {
  id: string;
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
      socket.on(`user:${user.id}:node:add`, (data: NodeEvent) => {
        console.log(data);
        const currentNodeMap = get<Record<string, TreeNode>>(TREE_KEY) ?? {};
        const hasNode = data.nodes.some((node) => Boolean(currentNodeMap?.[node.id]));

        if (hasNode || currentNodeMap?.[data.id]) {
          for (const node of data.nodes) {
            if (currentNodeMap[node.id]) continue;

            const { parents, children, siblings, spouses } = node;
            for (const parent of parents) {
              if (currentNodeMap?.[parent.id]) {
                currentNodeMap[parent.id].children.push({ id: node.id, type: RelType.blood });
              }
            }

            for (const child of children) {
              if (currentNodeMap?.[child.id]) {
                currentNodeMap[child.id].parents.push({ id: node.id, type: RelType.blood });
              }
            }

            for (const sibling of siblings) {
              if (currentNodeMap?.[sibling.id]) {
                currentNodeMap[sibling.id].siblings.push({ id: node.id, type: RelType.blood });
              }
            }

            for (const spouse of spouses) {
              if (currentNodeMap?.[spouse.id]) {
                currentNodeMap[spouse.id].spouses.push({ id: node.id, type: RelType.married });
              }
            }

            currentNodeMap[node.id] = node;
          }

          set(TREE_KEY, currentNodeMap, DAY);

          const nodes = parseTreeNodeDetail(Object.values(currentNodeMap));
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
      socket.on(`user:${user.id}:node:remove`, (data: NodeEvent) => {
        const currentNodeMap = get<Record<string, TreeNode>>(TREE_KEY);
        const hasNode = data.nodes.some((node) => Boolean(currentNodeMap?.[node.id]));

        if (hasNode || currentNodeMap?.[data.id]) {
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
    try {
      await createDeleteNodeRequest(id);
      enqueueSnackbar({
        variant: "success",
        message: user?.role !== Role.SUPERADMIN ? "Node delete request is sent" : "Successfully delete node",
      });
    } catch (err: any) {
      enqueueSnackbar({
        variant: "error",
        message: err.message,
      });
    }
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
