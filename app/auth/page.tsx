import type { Metadata } from "next"
import Link from "next/link"
import { MacWallWordmark } from "@/components/macwall-wordmark"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your MacWall account.",
  robots: { index: false, follow: false },
}

const Page = () => {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-[#f5f5f7] p-4">
      <div className="relative z-10 flex flex-col items-center">
        <MacWallWordmark
          href="/"
          iconClassName="h-10 w-10"
          labelClassName="text-xl text-[#1d1d1f]"
        />
      </div>

      <Card className="relative z-10 w-full max-w-[420px] rounded-[28px] border border-black/[0.08] bg-white">
        <CardContent className="space-y-8 px-8 pt-8 pb-8">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">
              Create an account
            </h1>
            <p className="mt-2 text-[14px] text-[#86868b]">
              Enter your email below to create your account
            </p>
          </div>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="h-11 w-full rounded-full border-black/[0.12] bg-white text-[#1d1d1f] hover:bg-[#f5f5f7]"
            >
              <svg
                className="mr-2 size-4"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
              >
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              Continue with Apple
            </Button>

            <Button
              variant="outline"
              className="h-11 w-full rounded-full border-black/[0.12] bg-white text-[#1d1d1f] hover:bg-[#f5f5f7]"
            >
              <svg className="mr-2 size-4" viewBox="0 0 24 24" aria-hidden>
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
          </div>

          <div className="flex flex-row items-center gap-2">
            <Separator className="flex-1 bg-black/[0.08]" />
            <span className="px-2 text-[12px] text-[#86868b] uppercase">
              Or continue with
            </span>
            <Separator className="flex-1 bg-black/[0.08]" />
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-[14px] font-medium text-[#1d1d1f]"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                className="h-11 rounded-xl border-black/[0.12] bg-white focus-visible:ring-[#0071e3]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-[14px] font-medium text-[#1d1d1f]"
                >
                  Password
                </Label>
                <a
                  href="mailto:support@macwall.app?subject=Password%20help"
                  className="text-[14px] text-[#0066cc] hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                className="h-11 rounded-xl border-black/[0.12] bg-white focus-visible:ring-[#0071e3]"
              />
            </div>

            <Button className="h-11 w-full rounded-full bg-[#0071e3] text-white hover:bg-[#0077ed]">
              Sign in
            </Button>
          </div>

          <p className="text-center text-[14px] text-[#86868b]">
            Don&apos;t have an account?{" "}
            <Link href="/download" className="text-[#0066cc] hover:underline">
              Get MacWall
            </Link>
          </p>
        </CardContent>
      </Card>

      <p className="relative z-10 max-w-xs text-center text-[12px] text-[#86868b]">
        By clicking continue, you agree to our{" "}
        <Link href="/terms" className="text-[#0066cc] hover:underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-[#0066cc] hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  )
}

export default Page
