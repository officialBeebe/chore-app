const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type CreateChorePayload = {
    name: string;
    description?: string;
    frequency: number;
    dueDate: string;
}

export async function getChores() {
  const res = await fetch(`${BASE_URL}/items`);

  return res.json();
}

export async function createChore(payload: CreateChorePayload): Promise<{id: string}> {
  const res = await fetch(`${BASE_URL}/items`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return res.json();
}

export async function deleteChore(id: string) {
  return fetch(`${BASE_URL}/items/${id}`, { method: "DELETE" });
}


export async function touchChore(id: string): Promise<void> {
  await fetch(`${BASE_URL}/items/${id}`, {
    method: "PATCH",
  });
}
