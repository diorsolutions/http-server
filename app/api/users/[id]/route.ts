import { NextResponse } from "next/server"
import { deleteUser, getUserById, updateUserField } from "@/lib/users-store"

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const numId = Number(id)
  const user = getUserById(numId)
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(user)
}

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const numId = Number(id)
  let body: any
  try {
    body = await request.json()
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 })
  }
  const { field, value } = body || {}
  if (!field) return new NextResponse("Field required", { status: 400 })

  const updated = updateUserField(numId, field, value)
  if (!updated) return new NextResponse("Update failed", { status: 400 })
  return NextResponse.json(updated)
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const numId = Number(id)
  const ok = deleteUser(numId)
  if (!ok) return new NextResponse("Not found", { status: 404 })
  return new NextResponse(null, { status: 204 })
}
