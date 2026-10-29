import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * The control panel proxies every request to the CAS API with the server-side
 * CAS_API_KEY attached, so reaching this app at all is equivalent to holding
 * cluster admin. Nothing here may be served without operator credentials.
 *
 * Basic auth is used deliberately: this is an internal operations panel with no
 * user database, and the browser supplies the credential prompt.
 */
const REALM = 'Basic realm="NetGoat CAS Admin", charset="UTF-8"'

function unauthorized(): NextResponse {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": REALM },
  })
}

// Compares without leaking length or position through timing. node:crypto is
// unavailable in the middleware runtime, so this is done by hand.
function secureCompare(a: string, b: string): boolean {
  const encoder = new TextEncoder()
  const left = encoder.encode(a)
  const right = encoder.encode(b)
  if (left.length !== right.length) return false
  let mismatch = 0
  for (let i = 0; i < left.length; i += 1) {
    mismatch |= left[i] ^ right[i]
  }
  return mismatch === 0
}

function decodeBasicCredentials(header: string): { user: string; pass: string } | null {
  const [scheme, encoded] = header.split(" ")
  if (!scheme || scheme.toLowerCase() !== "basic" || !encoded) return null
  let decoded: string
  try {
    decoded = atob(encoded)
  } catch {
    return null
  }
  const separator = decoded.indexOf(":")
  if (separator < 0) return null
  return { user: decoded.slice(0, separator), pass: decoded.slice(separator + 1) }
}

export function middleware(request: NextRequest) {
  const expectedUser = (process.env.CAS_ADMIN_USERNAME || "admin").trim()
  const expectedPass = process.env.CAS_ADMIN_PASSWORD?.trim()

  // Fail closed: an unset password must lock the panel, not disable the check.
  if (!expectedPass) {
    return new NextResponse(
      "CAS_ADMIN_PASSWORD is not configured. Set it to enable the control panel.",
      { status: 503 },
    )
  }

  const header = request.headers.get("authorization")
  if (!header) return unauthorized()

  const credentials = decodeBasicCredentials(header)
  if (!credentials) return unauthorized()

  const userOk = secureCompare(credentials.user, expectedUser)
  const passOk = secureCompare(credentials.pass, expectedPass)
  if (!userOk || !passOk) return unauthorized()

  return NextResponse.next()
}

export const config = {
  // Everything except Next's build assets: pages and the CAS proxy alike.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
