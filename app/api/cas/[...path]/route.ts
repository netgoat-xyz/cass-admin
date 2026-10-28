import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

function casBaseUrl() {
  return (process.env.CAS_URL || "http://127.0.0.1:8088").replace(/\/$/, "")
}

async function proxy(request: NextRequest, pathSegments: string[]) {
  const targetPath = pathSegments.length ? `/${pathSegments.join("/")}` : "/"
  const url = `${casBaseUrl()}${targetPath}${request.nextUrl.search}`

  const headers = new Headers()
  headers.set("Accept", "application/json")
  const contentType = request.headers.get("content-type")
  if (contentType) headers.set("Content-Type", contentType)

  const apiKey = process.env.CAS_API_KEY?.trim()
  if (apiKey) headers.set("Authorization", `Bearer ${apiKey}`)

  let body: string | undefined
  if (request.method !== "GET" && request.method !== "HEAD") {
    body = await request.text()
  }

  try {
    const upstream = await fetch(url, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    })

    const text = await upstream.text()
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("Content-Type") || "application/json",
      },
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "CAS API unreachable"
    return NextResponse.json(
      {
        error: `Cannot reach CAS at ${casBaseUrl()}: ${message}`,
      },
      { status: 502 }
    )
  }
}

type RouteContext = { params: Promise<{ path?: string[] }> }

export async function GET(request: NextRequest, context: RouteContext) {
  const { path = [] } = await context.params
  return proxy(request, path)
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { path = [] } = await context.params
  return proxy(request, path)
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { path = [] } = await context.params
  return proxy(request, path)
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { path = [] } = await context.params
  return proxy(request, path)
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { path = [] } = await context.params
  return proxy(request, path)
}
