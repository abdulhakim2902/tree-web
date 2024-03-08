import { TOKEN_KEY } from "@/constants/storage-key";
import { Family, TreeNode, TreeNodeData } from "@/types/tree";
import { getCookie } from "cookies-next";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const searchNodes = async (query: string) => {
  const token = getCookie(TOKEN_KEY)?.toString();
  const response = await fetch(`${API_URL}/nodes/search/${query}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  if (response.status !== 200) {
    throw new Error(response.statusText);
  }

  const { id, data, isRoot } = await response.json();
  const nodeMap = Object.fromEntries(data.map((e: TreeNode) => [e.id, e]));

  return {
    node: { id: id as string, isRoot: isRoot as boolean },
    nodes: data as TreeNode[],
    nodeMap: nodeMap as Record<string, TreeNode>,
  };
};

export const rootNodes = async (id: string) => {
  const token = getCookie(TOKEN_KEY)?.toString();
  const response = await fetch(`${API_URL}/nodes/${id}/root`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  if (response.status !== 200) {
    throw new Error(response.statusText);
  }

  const result = await response.json();
  const nodeMap = Object.fromEntries(
    result.data.map((e: TreeNode) => {
      return [e.id, e];
    }),
  );

  return {
    node: { id: id as string, isRoot: result.isRoot as boolean },
    nodes: result.data as TreeNode[],
    nodeMap: nodeMap as Record<string, TreeNode>,
  };
};

export const nodeFamilies = async (id: string) => {
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

export const familyNodes = async (token?: string) => {
  if (!token) token = getCookie(TOKEN_KEY)?.toString();
  const response = await fetch(`${API_URL}/nodes/families`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  if (response.status !== 200) {
    throw new Error(response.statusText);
  }

  const result = await response.json();
  return { data: result as { id: string; name: string }[] };
};

export const parentAndChildNodes = async (id: string) => {
  const token = getCookie(TOKEN_KEY)?.toString();
  if (!token) {
    throw new Error("Token not found");
  }

  const response = await fetch(`${API_URL}/nodes/${id}/parents-and-children`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.toString()}`,
    },
  });

  if (response.status !== 200) {
    throw new Error(response.statusText);
  }

  const { data } = await response.json();

  return { nodes: data as TreeNode[] };
};

export const spouseAndChildNodes = async (id: string) => {
  const token = getCookie(TOKEN_KEY)?.toString();
  if (!token) {
    throw new Error("Token not found");
  }
  const response = await fetch(`${API_URL}/nodes/${id}/spouses-and-children`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.toString()}`,
    },
  });

  const { data } = await response.json();

  if (response.status !== 200) {
    throw new Error(response.statusText);
  }

  return { nodes: data as TreeNode[] };
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
    method: "PUT",
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

  if (response.status !== 201) {
    throw new Error(response.statusText);
  }

  await response.json();
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

  if (response.status !== 201) {
    throw new Error(response.statusText);
  }

  await response.json();
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

  if (response.status !== 201) {
    throw new Error(response.statusText);
  }

  await response.json();
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

  if (response.status !== 201) {
    throw new Error(response.statusText);
  }

  await response.json();
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

  const { data } = await response.json();
  return data as TreeNodeData[];
};
