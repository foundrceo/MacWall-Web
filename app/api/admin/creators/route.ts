import { NextResponse } from "next/server"

import { requireAdminApi } from "@/lib/admin/auth"
import {
  createCreatorDeal,
  listCreatorDeals,
} from "@/lib/admin/creators"

export async function GET(request: Request) {
  const denied = await requireAdminApi()
  if (denied) return denied

  try {
    const { searchParams } = new URL(request.url)
    const deals = await listCreatorDeals({
      search: searchParams.get("search") ?? undefined,
      contentStatus: searchParams.get("content") ?? undefined,
      paymentStatus: searchParams.get("payment") ?? undefined,
    })
    return NextResponse.json({ deals })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load creators"
    // PostgREST missing-table error: "Could not find the table
    // 'public.creator_deals' in the schema cache" (PGRST205).
    const missingTable =
      /could not find the table|schema cache|PGRST205|does not exist|relation/i.test(
        message
      ) && message.includes("creator_deals")
    const status = missingTable ? 503 : 500
    return NextResponse.json(
      {
        error: message,
        setupRequired: missingTable,
        setupHint:
          status === 503
            ? "Run supabase/migrations/20260919_creator_deals.sql in your Supabase SQL editor to create the creator_deals table."
            : undefined,
      },
      { status }
    )
  }
}

export async function POST(request: Request) {
  const denied = await requireAdminApi()
  if (denied) return denied

  try {
    const body = (await request.json()) as {
      creatorName?: string
      instagramHandle?: string
      deliverable?: string
      reelsPromised?: number
      reelsDelivered?: number
      agreedAmount?: number
      paidAmount?: number
      currency?: string
      email?: string | null
      phone?: string | null
      upiId?: string | null
      contentStatus?: string
      paymentStatus?: string
      contentLink?: string | null
      dueDate?: string | null
      paidAt?: string | null
      notes?: string | null
    }
    const deal = await createCreatorDeal({
      creatorName: body.creatorName ?? "",
      instagramHandle: body.instagramHandle ?? "",
      deliverable: body.deliverable ?? "reel",
      reelsPromised: Number(body.reelsPromised ?? 0),
      reelsDelivered: Number(body.reelsDelivered ?? 0),
      agreedAmount: Number(body.agreedAmount ?? 0),
      paidAmount: Number(body.paidAmount ?? 0),
      currency: body.currency ?? "INR",
      email: body.email ?? null,
      phone: body.phone ?? null,
      upiId: body.upiId ?? null,
      contentStatus: (body.contentStatus as never) ?? "contacted",
      paymentStatus: (body.paymentStatus as never) ?? "unpaid",
      contentLink: body.contentLink ?? null,
      dueDate: body.dueDate ?? null,
      paidAt: body.paidAt ?? null,
      notes: body.notes ?? null,
    })
    return NextResponse.json({ deal }, { status: 201 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create creator"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
