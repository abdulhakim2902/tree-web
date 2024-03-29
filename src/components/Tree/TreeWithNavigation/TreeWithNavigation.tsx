import Tree from "@tree/src/components/Tree/Tree";
import { TreeNode } from "@tree/src/types/tree";
import dynamic from "next/dynamic";
import React, { FC } from "react";

const PinchZoomPan = dynamic(() => import("@tree/src/components/PinchZoomPan/PinchZoomPan"), {
  ssr: false,
});

type TreeNavigationProps = {
  loading: boolean;
  rootId: string;
  nodes: TreeNode[];
};

const TreeWithNavigation: FC<TreeNavigationProps> = ({ rootId, nodes, loading }) => {
  if (nodes.length <= 0 || !rootId || loading) return <React.Fragment />;

  return (
    <PinchZoomPan>
      <Tree rootId={rootId} nodes={nodes} />
    </PinchZoomPan>
  );
};

export default TreeWithNavigation;
