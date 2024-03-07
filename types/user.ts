import { TreeNodeData } from "./tree";

export type User = {
  id: string;
  email: string;
  username: string;
};

export type UserWithFullname = User & {
  nodeId: string;
  fullname: string;
};

export type UserWithNode = User & {
  node: TreeNodeData;
};
