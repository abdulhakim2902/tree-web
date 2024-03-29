import { RelationInfo, TreeNode, TreeNodeDataWithRelations, TreeNodeRelation } from "@tree/src/types/tree";
import { startCase } from "./string";

export const getTreeNodeRelationDetails = (
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

export const parseTreeNodeDetail = (nodes: TreeNode[]) => {
  return nodes.map((node: TreeNode) => {
    const parents = node.parents.filter((parent) => {
      return nodes.find((node: TreeNode) => node.id === parent.id);
    });

    const spouses = node.spouses.filter((spouse) => {
      return nodes.find((node: TreeNode) => node.id === spouse.id);
    });

    const children = node.children.filter((child) => {
      return nodes.find((node: TreeNode) => node.id === child.id);
    });

    const siblings = node.siblings.filter((sibling) => {
      return nodes.find((node: TreeNode) => node.id === sibling.id);
    });

    node.data.fullname = startCase(node.data.fullname);
    node.data.metadata = {
      totalSpouses: node.spouses.filter((e) => e.type === "married").length,
      maxSpouses: node.gender === "male" ? 4 : 1,
      expandable: {
        parents: node.parents.length !== parents.length,
        spouses: node.spouses.length !== spouses.length,
        children: node.children.length !== children.length,
        siblings: node.siblings.length !== siblings.length,
      },
    };

    node.parents = parents;
    node.siblings = siblings;
    node.spouses = spouses;
    node.children = children;

    return node;
  });
};
