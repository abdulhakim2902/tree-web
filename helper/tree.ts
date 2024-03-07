import { RelationInfo, TreeNode, TreeNodeDataWithRelations, TreeNodeRelation } from "@/types/tree";

const getTreeNodeRelationDetails = (
  nodesMap: Record<string, TreeNode>,
  relations: TreeNodeRelation[],
): RelationInfo[] => {
  return relations.map((relation) => {
    return {
      id: relation.id,
      type: relation.type,
      fullname: nodesMap?.[relation.id]?.data?.fullname,
      firstName: nodesMap?.[relation.id]?.data?.name?.first,
      nicknames: nodesMap?.[relation.id]?.data?.name?.nicknames,
    };
  });
};

export const getTreeNodeDetails = (
  nodesMap: Record<string, TreeNode>,
  selectedNodeId?: string,
): TreeNodeDataWithRelations | undefined => {
  if (selectedNodeId === undefined) return;
  const selectedNode = nodesMap?.[selectedNodeId];
  if (!selectedNode) return;
  const parents = getTreeNodeRelationDetails(nodesMap, selectedNode.parents as TreeNodeRelation[]);
  const children = getTreeNodeRelationDetails(nodesMap, selectedNode.children as TreeNodeRelation[]);
  const spouses = getTreeNodeRelationDetails(nodesMap, selectedNode.spouses as TreeNodeRelation[]);
  const siblings = getTreeNodeRelationDetails(nodesMap, selectedNode.siblings as TreeNodeRelation[]);
  return {
    ...selectedNode.data,
    parents,
    children,
    spouses,
    siblings,
  };
};
