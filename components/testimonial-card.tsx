import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import Image from "next/image"

export type TestimonialProps = {
  logo?: string
  quote: string
  author: string
  role: string
  avatarSrc: string
  className?: string
}

export default function TestimonialCard({
  logo,
  quote,
  author,
  role,
  avatarSrc,
  className,
}: TestimonialProps) {
  return (
    <Card
      style={{ backgroundColor: "var(--background)" }}
      className={cn(
        "flex h-full flex-col gap-2 border border-border bg-background text-card-foreground shadow-none ring-0",
        className
      )}
    >
      {logo && (
        <CardHeader className="md:pb-2 xl:pb-4">
          <Image
            src={logo}
            alt={logo}
            width={100}
            height={100}
            className="invert dark:invert-0"
          />
        </CardHeader>
      )}
      <CardContent className="flex-1">
        <p className="4xl:text-2xl text-lg leading-relaxed">{quote}</p>
      </CardContent>
      <div
        style={{ backgroundColor: "var(--background)" }}
        className="flex items-center rounded-b-xl border-t-0 bg-background px-6 pt-4"
      >
        <div className="flex items-center gap-3">
          <Avatar className="4xl:size-20 size-10 md:size-12">
            <AvatarImage
              src={avatarSrc}
              alt={author}
              className="4xl:w-20 4xl:h-20"
            />
            <AvatarFallback className="4xl:text-2xl">
              {author[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="4xl:text-2xl text-base font-medium text-foreground">
              {author}
            </p>
            <p className="4xl:text-2xl text-sm text-muted-foreground">{role}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
