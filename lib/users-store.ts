import fs from "fs";
import path from "path";

export type User = {
  id: number;
  name: string;
  age: number;
  email: string;
  phone: string;
  city: string;
  jobTitle: string;
};

const DATA_PATH = path.join(process.cwd(), "data", "users.json");

let usersCache: User[] | null = null;

function loadFromFile(): User[] {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as User[];
    }
  } catch {}
  return [];
}

function saveToFile(users: User[]) {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(users, null, 2), "utf8");
  } catch {}
}

function ensureLoaded(): User[] {
  if (usersCache === null) {
    usersCache = loadFromFile();
  }
  return usersCache;
}

export function getAllUsers(): User[] {
  const users = ensureLoaded();
  return users.slice();
}

export function getUserById(id: number): User | undefined {
  const users = ensureLoaded();
  return users.find((u) => u.id === id);
}

export function addUser(input: Partial<User>): User | null {
  const users = ensureLoaded();
  if (!input || typeof input.id !== "number" || input.id <= 0) return null;
  if (users.some((u) => u.id === input.id)) return null;

  const candidate: User = {
    id: input.id,
    name: String(input.name ?? "").trim(),
    age: Number(input.age ?? 0),
    email: String(input.email ?? "").trim(),
    phone: String(input.phone ?? "").trim(),
    city: String(input.city ?? "").trim(),
    jobTitle: String(input.jobTitle ?? "").trim(),
  };

  if (
    !candidate.name ||
    !candidate.age ||
    !candidate.email ||
    !candidate.phone ||
    !candidate.city ||
    !candidate.jobTitle
  ) {
    return null;
  }

  const next = [...users, candidate];
  usersCache = next;
  saveToFile(next);
  return candidate;
}

export function updateUserField(
  id: number,
  field: string,
  value: any
): User | null {
  const users = ensureLoaded();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return null;

  const user = users[idx];
  if (!(field in user)) return null;

  const updated: User = {
    ...user,
    [field]: field === "age" ? Number(value) : value,
  };
  const next = [...users.slice(0, idx), updated, ...users.slice(idx + 1)];
  usersCache = next;
  saveToFile(next);
  return updated;
}

export function deleteUser(id: number): boolean {
  const users = ensureLoaded();
  const exists = users.some((u) => u.id === id);
  if (!exists) return false;
  const next = users.filter((u) => u.id !== id);
  usersCache = next;
  saveToFile(next);
  return true;
}
