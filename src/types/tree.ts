import { ExtNode, Node, RelType } from "@tree/src/lib/relatives-tree/types";

export type TreeNode = Node & {
  data: TreeNodeData;
};

export type TreeExternalNode = ExtNode & TreeNode;

export type TreeNodeDataFromJson = {
  id: string;
  name: {
    first: string;
    middle?: string;
    last?: string;
    nicknames?: string[];
  };
} & Partial<{
  userId: string;
  email: string;
  profileImageURL: string;
  gender: string;
  birth: {
    year: number;
    month: number;
    day: number;
    place: {
      city: string;
      country: string;
    };
  };
  death: {
    year: number;
    month: number;
    day: number;
    place: {
      city: string;
      country: string;
    };
  };
  nationality: string;
  education: string;
  occupation: string;
  rewards: string[];
  bio: string;
  metadata: {
    totalSpouses: number;
    maxSpouses: number;
    expandable: {
      parents: boolean;
      siblings: boolean;
      children: boolean;
      spouses: boolean;
    };
  };
}>;

export type TreeNodeData = TreeNodeDataFromJson & {
  fullname: string;
  families: Family[];
};

export type TreeNodeRelation = Readonly<{
  id: string;
  type: RelType;
}>;

export type RelationInfo = {
  id: string;
  type: RelType;
  fullname: string;
  firstName: string;
  nicknames?: string[];
};

export type TreeNodeDataWithRelations = TreeNodeData & {
  parents: RelationInfo[];
  children: RelationInfo[];
  siblings: RelationInfo[];
  spouses: RelationInfo[];
};

export type Family = {
  id: string;
  name: string;
};

export type Root = {
  id: string;
  isRoot: boolean;
};

export type Tree = {
  root: Root;
  nodes: TreeNode[];
  nodeMap: Record<string, TreeNode>;
};
