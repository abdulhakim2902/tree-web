import { useNodeSelectionContext } from "@tree/src/context/tree";
import { TREE_NODE_SIZE } from "@tree/src/lib/react-family-tree/constants";
import { ExtNode } from "@tree/src/lib/relatives-tree/types";
import { TreeExternalNode, TreeNode as TreeNodeType } from "@tree/src/types/tree";
import dynamic from "next/dynamic";
import React, { FC, memo } from "react";
import s from "./Tree.module.css";
import TreeNode from "./TreeNode/TreeNode";
import { useTreeNodeDataContext } from "@tree/src/context/data";

const ReactFamilyTree = dynamic(() => import("@tree/src/lib/react-family-tree"), {
  ssr: false,
});

type TreeProps = {
  rootId: string;
  nodes: TreeNodeType[];
};

const Tree: FC<TreeProps> = ({ rootId, nodes }) => {
  const { init } = useTreeNodeDataContext();
  const { selectNode, selectedNodeId, unselectNode } = useNodeSelectionContext();

  const handleSelectNode = (id: string, hasSubtree?: boolean) => {
    if (selectedNodeId === id && !init) {
      unselectNode();
    } else {
      console.log("test", id);
      selectNode(id, hasSubtree);
    }
  };

  return (
    <ReactFamilyTree
      nodes={nodes}
      rootId={rootId}
      width={TREE_NODE_SIZE}
      height={TREE_NODE_SIZE}
      className={s.root}
      renderNode={(node: ExtNode) => (
        <TreeNode
          isSelected={selectedNodeId === node.id}
          key={node.id}
          node={node as TreeExternalNode}
          onClick={handleSelectNode}
          width={TREE_NODE_SIZE}
          height={TREE_NODE_SIZE}
        />
      )}
    />
  );
};

export default memo(Tree);
