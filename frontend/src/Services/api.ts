export interface AdminUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  department: string;
  roles: string[];
  is_active: boolean;
}

export interface Role {
  id: number;
  name: string;
}

const API = "/api";

function getCsrfToken(): string {
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : "";
}

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as any).detail || (data as any).message || "Request failed.");
  }
  return data as T;
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const res = await fetch(`${API}/admin/users/`, {
    credentials: "include",
  });
  return parseJson<AdminUser[]>(res);
}

export async function fetchRoles(): Promise<Role[]> {
  const res = await fetch(`${API}/admin/roles/`, {
    credentials: "include",
  });
  return parseJson<Role[]>(res);
}

export async function updateUserRoles(userId: number, roleIds: number[]): Promise<AdminUser> {
  const res = await fetch(`${API}/admin/users/${userId}/roles/`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCsrfToken(),
    },
    body: JSON.stringify({ role_ids: roleIds }),
  });
  return parseJson<AdminUser>(res);
}

export async function createUser(payload: {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  department: string;
  role: string;
  password: string;
}) {
  const res = await fetch(`${API}/admin/users/create/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCsrfToken(),
    },
    body: JSON.stringify(payload),
  });
  return parseJson<AdminUser>(res);
}

export async function createRole(name: string): Promise<Role> {
  const res = await fetch(`${API}/admin/roles/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCsrfToken(),
    },
    body: JSON.stringify({ name }),
  });
  return parseJson<Role>(res);
}
