import { createContext, FC, useCallback, useContext, useEffect, useState } from "react";

type NodeSelectionContextValue = {
  hasSubTree?: boolean;
  selectedNodeId?: string;
  selectNode: (id: string, hasSubTree?: boolean) => void;
  unselectNode: () => void;
};

const NodeSelectionContext = createContext<NodeSelectionContextValue | undefined>(undefined);

export const NodeSelectionContextProvider: FC = ({ children }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>();
  const [hasSubTree, setHasSubTree] = useState<boolean>();
  const selectNode = useCallback((id: string, hasSubTree?: boolean) => {
    setHasSubTree(hasSubTree);
    setSelectedNodeId(id);
  }, []);
  const unselectNode = useCallback(() => {
    setHasSubTree(undefined);
    setSelectedNodeId(undefined);
  }, []);

  return (
    <NodeSelectionContext.Provider value={{ hasSubTree, selectedNodeId, selectNode, unselectNode }}>
      {children}
    </NodeSelectionContext.Provider>
  );
};

export const useNodeSelectionContext = (): NodeSelectionContextValue => {
  const nodeSelectionContextValue = useContext(NodeSelectionContext);

  if (!nodeSelectionContextValue) {
    throw Error("useNodeSelectionContext hook must be used inside NodeSelectionContext provider");
  }

  return nodeSelectionContextValue;
};
