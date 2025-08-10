"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Loader2, Trash2, CheckCircle2, UserPlus, Pencil, Search, RotateCcw, CheckCircle, XCircle } from "lucide-react"

type User = {
  id: number
  name: string
  age: number
  email: string
  phone: string
  city: string
  jobTitle: string
}

type ActionType = "get" | "edit" | "add" | "delete" | ""

type MsgType = "success" | "error" | "info"

const fieldDefs = [
  { key: "name", label: "Ism (Name)", type: "text", placeholder: "Ism kiriting" },
  { key: "age", label: "Yosh (Age)", type: "number", placeholder: "Yosh kiriting" },
  { key: "email", label: "Email", type: "email", placeholder: "Email kiriting" },
  { key: "phone", label: "Telefon", type: "tel", placeholder: "Telefon kiriting, masalan: +998901234567" },
  { key: "city", label: "Shahar", type: "text", placeholder: "Shahar kiriting" },
  { key: "jobTitle", label: "Lavozim", type: "text", placeholder: "Lavozim kiriting" },
] as const

export default function Page() {
  const { toast } = useToast()
  const [action, setAction] = useState<ActionType>("")
  const [busy, setBusy] = useState(false)

  const [idInput, setIdInput] = useState("")

  const [user, setUser] = useState<User | null>(null)

  const [editField, setEditField] = useState<string>("")
  const [editValue, setEditValue] = useState<string>("")

  const [addData, setAddData] = useState<Partial<User>>({
    id: undefined,
    name: "",
    age: undefined,
    email: "",
    phone: "",
    city: "",
    jobTitle: "",
  })

  const [lastMsg, setLastMsg] = useState<{ type: MsgType; title: string; description?: string } | null>(null)

  function notify(type: MsgType, title: string, description?: string) {
    setLastMsg({ type, title, description })
    toast({ title, description, variant: type === "error" ? "destructive" : undefined })
  }

  useEffect(() => {
    setIdInput("")
    setUser(null)
    setEditField("")
    setEditValue("")
    setLastMsg(null)
    if (action !== "add") {
      setAddData({
        id: undefined,
        name: "",
        age: undefined,
        email: "",
        phone: "",
        city: "",
        jobTitle: "",
      })
    }
  }, [action])

  useEffect(() => {
    if (action !== "delete") return
    const id = parseId(idInput)
    if (!id) {
      setUser(null)
      return
    }
    const t = setTimeout(() => {
      fetchUserById(id, { silent: true })
    }, 350)
    return () => clearTimeout(t)
  }, [action, idInput])

  const selectedFieldMeta = useMemo(() => fieldDefs.find((f) => f.key === editField), [editField])

  const parseId = (val: string) => {
    const n = Number(val)
    return Number.isFinite(n) && n > 0 ? n : null
  }

  async function fetchUserById(id: number, opts?: { silent?: boolean }) {
    if (!opts?.silent) setBusy(true)
    try {
      const res = await fetch(`/api/users/${id}`)
      if (!res.ok) {
        setUser(null)
        if (!opts?.silent) {
          notify("error", "Topilmadi", `ID ${id} bo'yicha foydalanuvchi topilmadi`)
        }
        return
      }
      const data = (await res.json()) as User
      setUser(data)
    } catch {
      if (!opts?.silent) {
        notify("error", "Tarmoq xatosi", "Iltimos, qayta urinib ko'ring")
      }
    } finally {
      if (!opts?.silent) setBusy(false)
    }
  }

  async function handleDefaultSearch() {
    const id = parseId(idInput)
    if (!id) {
      notify("error", "ID xato", "ID ijobiy butun son bo'lishi kerak")
      return
    }
    await fetchUserById(id)
  }

  async function handleEditLoad() {
    await handleDefaultSearch()
  }

  function handleReset() {
    setIdInput("")
    setUser(null)
    setEditField("")
    setEditValue("")
    setLastMsg(null)
  }

  async function handleEditChange() {
    if (!user) {
      notify("error", "User yuklanmadi", "Avval ID orqali foydalanuvchini toping")
      return
    }
    if (!editField) {
      notify("error", "Maydon tanlanmagan", "O'zgartirmoqchi bo'lgan maydonni tanlang")
      return
    }
    let value: any = editValue
    if (editField === "age") {
      const n = Number(editValue)
      if (!Number.isFinite(n) || n <= 0) {
        notify("error", "Yosh xato", "Yosh ijobiy butun son bo'lishi kerak")
        return
      }
      value = n
    } else if (editField === "name" || editField === "city" || editField === "jobTitle") {
      if (!value || String(value).trim().length < 2) {
        notify("error", "Qiymat xato", "Qiymat juda qisqa")
        return
      }
    } else if (editField === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        notify("error", "Email xato", "Email formati noto'g'ri")
        return
      }
    } else if (editField === "phone") {
      if (!/^\+?\d{9,15}$/.test(value)) {
        notify("error", "Telefon xato", "Telefon formati noto'g'ri")
        return
      }
    }

    setBusy(true)
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field: editField, value }),
      })
      if (!res.ok) {
        notify("error", "O'zgartirish amalga oshmadi", "Iltimos, qayta urinib ko'ring")
        return
      }
      const updated = (await res.json()) as User
      setUser(updated)
      setEditValue("")
      const label = selectedFieldMeta?.label || editField
      notify("success", "O'zgartirildi", `${label} o'zgartirildi`)
    } catch {
      notify("error", "Tarmoq xatosi", "Iltimos, qayta urinib ko'ring")
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    const id = parseId(idInput)
    if (!id) {
      notify("error", "ID xato", "ID ijobiy butun son bo'lishi kerak")
      return
    }
    setBusy(true)
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" })
      if (!res.ok) {
        notify("error", "O'chirish amalga oshmadi", `ID ${id} topilmadi`)
        return
      }
      setUser(null)
      setIdInput("")
      notify("success", "O'chirildi", `Foydalanuvchi ID ${id} o'chirildi`)
    } catch {
      notify("error", "Tarmoq xatosi", "Iltimos, qayta urinib ko'ring")
    } finally {
      setBusy(false)
    }
  }

  type AddIdStatus = "empty" | "checking" | "available" | "taken" | "invalid"
  const [addIdStatus, setAddIdStatus] = useState<AddIdStatus>("empty")

  useEffect(() => {
    if (action !== "add") return
    const id = addData.id
    if (!id) {
      setAddIdStatus("empty")
      return
    }
    if (!Number.isFinite(id) || id <= 0) {
      setAddIdStatus("invalid")
      return
    }
    setAddIdStatus("checking")
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/${id}`)
        if (res.ok) {
          setAddIdStatus("taken")
        } else {
          setAddIdStatus("available")
        }
      } catch {
        setAddIdStatus("available")
      }
    }, 350)
    return () => clearTimeout(t)
  }, [action, addData.id])

  async function handleAdd() {
    if (!addData.id || !Number.isFinite(addData.id) || addData.id <= 0) {
      notify("error", "ID xato", "Yangi ID ijobiy butun son bo'lsin")
      return
    }
    if (addIdStatus === "taken") {
      notify("error", "ID band", `ID ${addData.id} allaqachon mavjud`)
      return
    }
    if (!addData.name || String(addData.name).trim().length < 2) {
      notify("error", "Ism kerak", "Ism kamida 2 ta belgidan iborat bo'lsin")
      return
    }
    if (!addData.age || !Number.isFinite(addData.age) || addData.age <= 0) {
      notify("error", "Yosh kerak", "Yosh ijobiy butun son bo'lsin")
      return
    }
    if (!addData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(addData.email))) {
      notify("error", "Email kerak", "Email formati to'g'ri bo'lsin")
      return
    }
    if (!addData.phone || !/^\+?\d{9,15}$/.test(String(addData.phone))) {
      notify("error", "Telefon kerak", "Telefon formati to'g'ri bo'lsin")
      return
    }
    if (!addData.city || !addData.jobTitle) {
      notify("error", "Ma'lumot to'liq emas", "Shahar va Lavozimni to'ldiring")
      return
    }

    setBusy(true)
    try {
      const res = await fetch(`/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addData),
      })
      if (!res.ok) {
        const msg = await res.text()
        notify("error", "Qo'shilmadi", msg || "Yangi foydalanuvchi qo'shilmadi")
        return
      }
      const created = (await res.json()) as User
      setUser(created)
      notify("success", "Qo'shildi", `Foydalanuvchi ID ${created.id} qo'shildi`)
      setAddData({
        id: undefined,
        name: "",
        age: undefined,
        email: "",
        phone: "",
        city: "",
        jobTitle: "",
      })
      setAddIdStatus("empty")
    } catch {
      notify("error", "Tarmoq xatosi", "Iltimos, qayta urinib ko'ring")
    } finally {
      setBusy(false)
    }
  }

  function renderDefaultRightInput() {
    if (action === "get" || action === "edit" || action === "delete") {
      const parsedId = parseId(idInput)
      return (
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="grid gap-1">
            <Label htmlFor="id-input" className="sr-only">
              ID kiriting
            </Label>
            <Input
              id="id-input"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="ID kiriting"
              value={idInput}
              onChange={(e) => setIdInput(e.target.value)}
              className="w-[180px]"
            />
          </div>
          {action === "get" && (
            <Button onClick={handleDefaultSearch} disabled={busy} className="gap-2">
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
              Qidirish
            </Button>
          )}
          {action === "edit" && (
            <Button onClick={handleEditLoad} disabled={busy} variant="secondary" className="gap-2">
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Pencil className="size-4" />}
              Yuklash
            </Button>
          )}
          {action === "delete" && user && parsedId === user.id && (
            <Button onClick={handleDelete} disabled={busy} variant="destructive" className="gap-2">
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              O'chirish
            </Button>
          )}
          {(user !== null || idInput.length > 0) && (
            <Button onClick={handleReset} variant="outline" className="gap-2 bg-transparent">
              <RotateCcw className="size-4" />
              Tozalash
            </Button>
          )}
        </div>
      )
    }

    if (action === "add") {
      return (
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="grid gap-1">
            <Label htmlFor="new-id" className="sr-only">
              Yangi ID
            </Label>
            <Input
              id="new-id"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Yangi ID"
              value={addData.id?.toString() ?? ""}
              onChange={(e) => {
                const n = Number(e.target.value)
                setAddData((prev) => ({ ...prev, id: Number.isFinite(n) ? n : undefined }))
              }}
              className="w-[160px]"
            />
          </div>
          <div className="text-sm min-w-[120px]">
            {addIdStatus === "checking" && (
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Tekshirilmoqda...
              </span>
            )}
            {addIdStatus === "available" && (
              <span className="inline-flex items-center gap-1 text-emerald-600">
                <CheckCircle className="size-4" /> Mavjud
              </span>
            )}
            {addIdStatus === "taken" && (
              <span className="inline-flex items-center gap-1 text-red-600">
                <XCircle className="size-4" /> Band
              </span>
            )}
            {addIdStatus === "invalid" && <span className="text-red-600">ID noto&apos;g&apos;ri</span>}
          </div>
          {(addData.id || user) && (
            <Button
              onClick={() =>
                setAddData({
                  id: undefined,
                  name: "",
                  age: undefined,
                  email: "",
                  phone: "",
                  city: "",
                  jobTitle: "",
                })
              }
              variant="outline"
              className="gap-2"
            >
              <RotateCcw className="size-4" />
              Tozalash
            </Button>
          )}
        </div>
      )
    }

    return null
  }

  function renderEditControls() {
    if (action !== "edit" || !user) return null
    return (
      <div className="mt-4 w-full max-w-2xl">
        <Separator className="my-4" />
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
          <div className="flex-1">
            <Label className="mb-1 block">Maydonni tanlang</Label>
            <Select value={editField} onValueChange={(v) => setEditField(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Qaysi maydon tahrirlanadi?" />
              </SelectTrigger>
              <SelectContent>
                {fieldDefs.map((f) => (
                  <SelectItem key={f.key} value={f.key}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label className="mb-1 block">Yangi qiymat</Label>
            <Input
              key={editField}
              type={selectedFieldMeta?.type || "text"}
              placeholder={selectedFieldMeta?.placeholder || "Yangi qiymat kiriting"}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              disabled={!editField}
            />
          </div>
          <div className="sm:w-auto">
            <Button onClick={handleEditChange} disabled={!editField || busy} className="w-full sm:w-auto gap-2">
              {busy ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
              O'zgartirish
            </Button>
          </div>
        </div>
      </div>
    )
  }

  function renderAddForm() {
    if (action !== "add") return null
    return (
      <div className="mt-4 w-full max-w-2xl">
        <Separator className="my-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="add-name">Ism</Label>
            <Input
              id="add-name"
              placeholder="To'liq ism"
              value={addData.name ?? ""}
              onChange={(e) => setAddData((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="add-age">Yosh</Label>
            <Input
              id="add-age"
              type="number"
              placeholder="Yosh"
              value={addData.age?.toString() ?? ""}
              onChange={(e) => setAddData((p) => ({ ...p, age: Number(e.target.value) || undefined }))}
            />
          </div>
          <div>
            <Label htmlFor="add-email">Email</Label>
            <Input
              id="add-email"
              type="email"
              placeholder="user@example.com"
              value={addData.email ?? ""}
              onChange={(e) => setAddData((p) => ({ ...p, email: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="add-phone">Telefon</Label>
            <Input
              id="add-phone"
              type="tel"
              placeholder="+998901234567"
              value={addData.phone ?? ""}
              onChange={(e) => setAddData((p) => ({ ...p, phone: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="add-city">Shahar</Label>
            <Input
              id="add-city"
              placeholder="Shahar"
              value={addData.city ?? ""}
              onChange={(e) => setAddData((p) => ({ ...p, city: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="add-jobTitle">Lavozim</Label>
            <Input
              id="add-jobTitle"
              placeholder="Lavozim"
              value={addData.jobTitle ?? ""}
              onChange={(e) => setAddData((p) => ({ ...p, jobTitle: e.target.value }))}
            />
          </div>
        </div>
        <div className="mt-4">
          <Button
            onClick={handleAdd}
            disabled={busy || addIdStatus === "taken" || addIdStatus === "invalid"}
            className="gap-2"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
            Foydalanuvchi qo'shish
          </Button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-[100dvh] flex flex-col items-center">
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center">
          <Card className="w-full max-w-3xl">
            <CardHeader className="text-center">
              <CardTitle>Foydalanuvchi CRUD</CardTitle>
              <CardDescription>
                Amalni tanlang va o&apos;ng tomondagi dinamik inputdan foydalaning. Markazda faqat ID orqali topilgan
                foydalanuvchi ma&apos;lumotlari ko&apos;rsatiladi.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lastMsg && (
                <Alert variant={lastMsg.type === "error" ? "destructive" : "default"} className="mb-4">
                  <AlertTitle>{lastMsg.title}</AlertTitle>
                  {lastMsg.description && <AlertDescription>{lastMsg.description}</AlertDescription>}
                </Alert>
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-center">
                <div className="w-full sm:w-[240px]">
                  <Label className="mb-1 block">Amal</Label>
                  <Select value={action} onValueChange={(v) => setAction(v as ActionType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Amal tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="get">Qidirish (Get)</SelectItem>
                      <SelectItem value="edit">Tahrirlash (Edit)</SelectItem>
                      <SelectItem value="add">Qo'shish (Add)</SelectItem>
                      <SelectItem value="delete">O'chirish (Delete)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full sm:flex-1 sm:justify-end flex">{renderDefaultRightInput()}</div>
              </div>

              {renderEditControls()}
              {renderAddForm()}

              <Separator className="my-6" />

              <div className="flex justify-center">
                {user ? (
                  <div className="w-full max-w-md">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">User ID: {user.id}</CardTitle>
                        <CardDescription>Tanlangan foydalanuvchi ma&apos;lumotlari</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Ism:</span> {user.name}
                        </div>
                        <div>
                          <span className="font-medium">Yosh:</span> {user.age}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span> {user.email}
                        </div>
                        <div>
                          <span className="font-medium">Telefon:</span> {user.phone}
                        </div>
                        <div>
                          <span className="font-medium">Shahar:</span> {user.city}
                        </div>
                        <div>
                          <span className="font-medium">Lavozim:</span> {user.jobTitle}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground text-center">
                    {"Userlarning joyi."}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Toaster />
    </main>
  )
}
