import { NextResponse } from "next/server"

import { requireAdminApi } from "@/lib/admin/auth"
import { deleteCreatorDeal, updateCreatorDeal } from "@/lib/admin/creators"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdminApi()
  if (denied) return denied

  try {
    const { id } = await params
    const body = (await request.json()) as Record<string, unknown>
    const deal = await updateCreatorDeal(id, {
      creatorName: body.creatorName as string | undefined,
      instagramHandle: body.instagramHandle as string | undefined,
      deliverable: body.deliverable as string | undefined,
      reelsPromised:
        body.reelsPromised === undefined
          ? undefined
          : Number(body.reelsPromised),
      reelsDelivered:
        body.reelsDelivered === undefined
          ? undefined
          : Number(body.reelsDelivered),
      agreedAmount:
        body.agreedAmount === undefined
          ? undefined
          : Number(body.agreedAmount),
      paidAmount:
        body.paidAmount === undefined ? undefined : Number(body.paidAmount),
      currency: body.currency as string | undefined,
      email: body.email as string | null | undefined,
      phone: body.phone as string | null | undefined,
      upiId: body.upiId as string | null | undefined,
      contentStatus: body.contentStatus as never,
      paymentStatus: body.paymentStatus as never,
      contentLink: body.contentLink as string | null | undefined,
      dueDate: body.dueDate as string | null | undefined,
      paidAt: body.paidAt as string | null | undefined,
      notes: body.notes as string | null | undefined,
    })
    return NextResponse.json({ deal })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update creator"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdminApi()
  if (denied) return denied

  try {
    const { id } = await params
    await deleteCreatorDeal(id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete creator"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
