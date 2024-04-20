import { TOKEN_KEY } from "@tree/src/constants/storage-key";
import { Family, Root, TreeNode, TreeNodeData, TreeNodeDataWithRelations } from "@tree/src/types/tree";
import { getCookie } from "cookies-next";
import { Gender } from "../relatives-tree/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type NodeResponse = {
  root: Root;
  nodes: TreeNode[];
};

export type Relative = "parents" | "children" | "siblings" | "spouses";

export const sampleNodes = async (): Promise<NodeResponse> => {
  const response = await fetch(`${API_URL}/nodes/samples`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const result = await response.json();
  if (result?.statusCode) {
    throw new Error(result);
  }

  const { id, isRoot, data } = result;

  const root = { id, isRoot };

  return { root, nodes: data };
};

export const rootNodes = async (id: string, token?: string): Promise<NodeResponse> => {
  if (!token) token = getCookie(TOKEN_KEY)?.toString();
  const response = await fetch(`${API_URL}/nodes/${id}/root`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();
  if (result?.statusCode) {
    throw new Error(result);
  }

  const { isRoot, data } = result;

  const root = { id, isRoot };

  return { root, nodes: data };
};

export const searchNodes = async (query: string, token?: string): Promise<NodeResponse> => {
  if (!token) token = getCookie(TOKEN_KEY)?.toString();
  const response = await fetch(`${API_URL}/nodes/search/${query}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status !== 200) {
    throw new Error(response.statusText);
  }

  const { id, isRoot, data } = await response.json();

  const root = { id, isRoot };

  return { root, nodes: data };
};

export const familyNodes = async (id: string) => {
  const token = getCookie(TOKEN_KEY)?.toString();
  if (!token) {
    throw new Error("Token not found");
  }

  const response = await fetch(`${API_URL}/nodes/${id}/families`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.toString()}`,
    },
  });

  if (response.status !== 200) {
    throw new Error(response.statusText);
  }

  const result = await response.json();

  return {
    id: id as string,
    families: result.data as Family[],
  };
};

export const allFamilyNodes = async (token?: string) => {
  if (!token) token = getCookie(TOKEN_KEY)?.toString();
  const response = await fetch(`${API_URL}/nodes/families`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status !== 200) {
    throw new Error(response.statusText);
  }

  const result = await response.json();
  return { data: result as Family[] };
};

export const relativeNodes = async (id: string, relative: Relative) => {
  const token = getCookie(TOKEN_KEY)?.toString();
  if (!token) {
    throw new Error("Token not found");
  }

  const response = await fetch(`${API_URL}/nodes/${id}/${relative}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.toString()}`,
    },
  });

  if (response.status !== 200) {
    throw new Error(response.statusText);
  }

  const { nodes } = await response.json();

  return { nodes: nodes as TreeNode[] };
};

export const updateNode = async (id: string, data: any) => {
  const token = getCookie(TOKEN_KEY)?.toString();
  if (!token) {
    throw new Error("Token not found");
  }

  if (!id) {
    throw new Error("Invalid node id");
  }

  const response = await fetch(`${API_URL}/nodes/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.toString()}`,
    },
    body: JSON.stringify(data),
  });

  if (response.status !== 200) {
    throw new Error(response.statusText);
  }

  const result = await response.json();

  return {
    node: result as TreeNodeData,
  };
};

export const addSpouse = async (id: string, data: any[]) => {
  const token = getCookie(TOKEN_KEY)?.toString();
  if (!token) {
    throw new Error("Token not found");
  }

  if (!id) {
    throw new Error("Invalid node id");
  }

  const response = await fetch(`${API_URL}/nodes/${id}/spouses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.toString()}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (result?.statusCode) {
    throw result;
  }

  return result;
};

export const addChild = async (id: string, data: any) => {
  const token = getCookie(TOKEN_KEY)?.toString();
  if (!token) {
    throw new Error("Token not found");
  }

  if (!id) {
    throw new Error("Invalid node id");
  }

  const response = await fetch(`${API_URL}/nodes/${id}/child`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.toString()}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (result?.statusCode) {
    throw result;
  }

  return result;
};

export const addParent = async (id: string, data: any) => {
  const token = getCookie(TOKEN_KEY)?.toString();
  if (!token) {
    throw new Error("Token not found");
  }

  if (!id) {
    throw new Error("Invalid node id");
  }

  const response = await fetch(`${API_URL}/nodes/${id}/parents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.toString()}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (result?.statusCode) {
    throw result;
  }

  return result;
};

export const addSibling = async (id: string, data: any) => {
  const token = getCookie(TOKEN_KEY)?.toString();
  if (!token) {
    throw new Error("Token not found");
  }

  if (!id) {
    throw new Error("Invalid node id");
  }

  const response = await fetch(`${API_URL}/nodes/${id}/sibling`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.toString()}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (result?.statusCode) {
    throw result;
  }

  return result;
};

export const getSpouse = async (id: string) => {
  const token = getCookie(TOKEN_KEY)?.toString();
  if (!token) {
    throw new Error("Token not found");
  }

  const response = await fetch(`${API_URL}/nodes/${id}/spouses`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.toString()}`,
    },
  });

  if (response.status !== 200) {
    return [];
  }

  const { nodes } = await response.json();

  return nodes.map((node: TreeNode) => node.data) as TreeNodeData[];
};

export const updateImageNode = async (id: string, fileId = "") => {
  const token = getCookie(TOKEN_KEY)?.toString();
  if (!token) {
    throw new Error("Token not found");
  }

  if (!id) {
    throw new Error("Invalid node id");
  }

  const response = await fetch(`${API_URL}/nodes/${id}/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.toString()}`,
    },
    body: JSON.stringify({ fileId }),
  });

  if (response.status !== 200) {
    throw new Error(response.statusText);
  }

  await response.json();
};

export const deleteNode = async (id: string) => {
  const token = getCookie(TOKEN_KEY)?.toString();
  if (!token) {
    throw new Error("Token not found");
  }

  if (!id) {
    throw new Error("Invalid node id");
  }

  const response = await fetch(`${API_URL}/nodes/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.toString()}`,
    },
  });

  const result = await response.json();

  if (result?.statusCode) {
    throw result;
  }

  return result;
};

export const nodeById = async (id: string) => {
  const token = getCookie(TOKEN_KEY)?.toString();
  const response = await fetch(`${API_URL}/nodes/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();
  if (result?.statusCode) {
    throw result;
  }

  const node = result;

  return node as TreeNodeData;
};
