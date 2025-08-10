/**
 * Plain Node.js HTTP server (no Express) for CRUD.
 * Run locally:
 *   node scripts/index.js
 * It serves:
 *   GET    /users            -> all users
 *   GET    /users?id=123     -> single user by query
 *   GET    /users/:id        -> single user
 *   POST   /users            -> add user (JSON body)
 *   PATCH  /users/:id        -> update one field { field, value }
 *   DELETE /users/:id        -> delete user
 *
 * Data persists in data/users.json.
 */
import { createServer } from "http"
import { readFileSync, writeFileSync } from "fs"
import { URL } from "url"
import { fileURLToPath } from "url"
import { dirname, resolve } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const DATA_PATH = resolve(__dirname, "../data/users.json")

/** @type {Array<{id:number,name:string,age:number,email:string,phone:string,city:string,jobTitle:string}>} */
let users = []
try {
  const raw = readFileSync(DATA_PATH, "utf8")
  users = JSON.parse(raw)
} catch (e) {
  users = []
  console.error("Failed to load users.json, starting with empty array")
}

function save() {
  try {
    writeFileSync(DATA_PATH, JSON.stringify(users, null, 2), "utf8")
  } catch (e) {
    console.error("Failed to write users.json:", e)
  }
}

function send(res, status, data, headers = {}) {
  const body = typeof data === "string" ? data : JSON.stringify(data)
  res.writeHead(status, {
    "Content-Type": typeof data === "string" ? "text/plain; charset=utf-8" : "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    ...headers,
  })
  res.end(body)
}

function parseBody(req) {
  return new Promise((resolve) => {
    let data = ""
    req.on("data", (chunk) => (data += chunk))
    req.on("end", () => {
      try {
        resolve(JSON.parse(data || "{}"))
      } catch {
        resolve({})
      }
    })
  })
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "", "http://localhost")
  const method = req.method || "GET"
  const path = url.pathname

  if (method === "OPTIONS") {
    return send(res, 204, "")
  }

  if (method === "GET" && path === "/users") {
    const id = url.searchParams.get("id")
    if (id) {
      const u = users.find((x) => x.id === Number(id))
      if (!u) return send(res, 404, { error: "Not found" })
      return send(res, 200, u)
    }
    return send(res, 200, users)
  }

  if (method === "GET" && /^\/users\/\d+$/.test(path)) {
    const id = Number(path.split("/")[2])
    const u = users.find((x) => x.id === id)
    if (!u) return send(res, 404, { error: "Not found" })
    return send(res, 200, u)
  }

  if (method === "POST" && path === "/users") {
    const body = await parseBody(req)
    const id = Number(body.id)
    if (!Number.isFinite(id) || id <= 0) return send(res, 400, "Invalid ID")
    if (users.some((u) => u.id === id)) return send(res, 400, "User with this ID already exists")

    const candidate = {
      id,
      name: String(body.name || ""),
      age: Number(body.age || 0),
      email: String(body.email || ""),
      phone: String(body.phone || ""),
      city: String(body.city || ""),
      jobTitle: String(body.jobTitle || ""),
    }

    if (
      !candidate.name ||
      !candidate.age ||
      !candidate.email ||
      !candidate.phone ||
      !candidate.city ||
      !candidate.jobTitle
    ) {
      return send(res, 400, "Missing fields")
    }

    users.push(candidate)
    save()
    return send(res, 201, candidate)
  }

  if (method === "PATCH" && /^\/users\/\d+$/.test(path)) {
    const id = Number(path.split("/")[2])
    const body = await parseBody(req)
    const field = body.field
    const value = body.value

    const idx = users.findIndex((u) => u.id === id)
    if (idx === -1) return send(res, 404, "Not found")

    if (!(field in users[idx])) return send(res, 400, "Invalid field")

    const updated = {
      ...users[idx],
      [field]: field === "age" ? Number(value) : value,
    }
    users[idx] = updated
    save()
    return send(res, 200, updated)
  }

  if (method === "DELETE" && /^\/users\/\d+$/.test(path)) {
    const id = Number(path.split("/")[2])
    const exists = users.some((u) => u.id === id)
    if (!exists) return send(res, 404, "Not found")
    users = users.filter((u) => u.id !== id)
    save()
    return send(res, 204, "")
  }

  return send(res, 404, "Not found")
})

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001
server.listen(PORT, () => {
  console.log(`Node server listening on http://localhost:${PORT}`)
})
