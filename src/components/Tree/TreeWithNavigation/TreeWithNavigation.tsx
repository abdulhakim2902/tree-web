import React, { FC, useEffect } from "react";
import Tree from "@tree/src/components/Tree/Tree";
import dynamic from "next/dynamic";

import { TreeNode } from "@tree/src/types/tree";
import { useNodeSelectionContext } from "@tree/src/context/tree";

const PinchZoomPan = dynamic(() => import("@tree/src/components/PinchZoomPan/PinchZoomPan"), {
  ssr: false,
});

type TreeNavigationProps = {
  rootId: string;
  nodes: TreeNode[];
};

const TreeWithNavigation: FC<TreeNavigationProps> = ({ rootId, nodes }) => {
  const { selectNode } = useNodeSelectionContext();

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (rootId) {
      selectNode(rootId);
    }
  }, [rootId]);

  if (nodes.length <= 0 || !rootId) return <React.Fragment />;
  return (
    <PinchZoomPan>
      <Tree rootId={rootId} nodes={nodes} />
    </PinchZoomPan>
  );
};

export default TreeWithNavigation;
