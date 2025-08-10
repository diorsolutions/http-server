import { NextResponse } from "next/server"
import { addUser, getAllUsers, getUserById } from "@/lib/users-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (id) {
    const user = getUserById(Number(id))
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(user)
  }

  const users = getAllUsers()
  return NextResponse.json(users)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const created = addUser(body)
    if (!created) {
      return new NextResponse("User with this ID already exists or invalid payload", { status: 400 })
    }
    return NextResponse.json(created, { status: 201 })
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 })
  }
}
