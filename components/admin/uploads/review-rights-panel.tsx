"use client"

/** Who sent the upload and what they declared about the rights to it. */

import { ArrowUpRight } from "lucide-react"
import type { ReactNode } from "react"

import { Badge, CopyButton } from "@/components/admin/ui"

import { DetailSection } from "./review-section"
import {
  LICENSE_LABELS,
  RIGHTS_STATEMENTS,
  formatDateTime,
  type UploadItem,
} from "./review-types"

export function ReviewRightsPanel({
  upload,
}: Readonly<{ upload: UploadItem }>) {
  const declared = Boolean(upload.rightsAttestedAt && upload.rightsBasis)

  return (
    <>
      <DetailSection title="Uploader">
        <FactList>
          <Fact label="Install ID">
            <span className="flex items-start gap-1">
              <span className="min-w-0 flex-1">
                <span className="block font-mono text-xs leading-5 break-all">
                  {upload.submitterId}
                </span>
                <span className="block text-xs text-muted-foreground">
                  Anonymous install, not an account
                </span>
              </span>
              <CopyButton
                value={upload.submitterId}
                label="Copy install ID"
                className="-mt-1 -mr-1 shrink-0"
              />
            </span>
          </Fact>
          <Fact label="Display name">
            {upload.authorName?.trim() || <Missing />}
          </Fact>
          <Fact label="Origin">Community upload</Fact>
          <Fact label="Submitted">{formatDateTime(upload.createdAt)}</Fact>
        </FactList>
      </DetailSection>

      <DetailSection
        title="Rights declaration"
        aside={
          <Badge tone={declared ? "green" : "red"} dot>
            {declared ? "Declared by uploader" : "No declaration"}
          </Badge>
        }
      >
        <FactList>
          {declared && upload.rightsBasis && upload.rightsAttestedAt ? (
            <>
              <Fact label="Statement">
                “{RIGHTS_STATEMENTS[upload.rightsBasis]}”
              </Fact>
              <Fact label="Author and origin">
                {upload.authorOriginConfirmed
                  ? "Confirmed accurate by uploader"
                  : "Not confirmed"}
              </Fact>
              <Fact label="Declared">
                {formatDateTime(upload.rightsAttestedAt)}
                {upload.rightsAttestationVersion ? (
                  <span className="block text-xs text-muted-foreground">
                    Statement {upload.rightsAttestationVersion}
                  </span>
                ) : null}
              </Fact>
            </>
          ) : (
            <Fact label="Statement">
              Submitted before the declaration existed (2 Oct 2026), or from an
              older app.
            </Fact>
          )}
          {upload.rightsBasis === "licensed" ? (
            <>
              <Fact label="Rights holder">
                {upload.rightsHolder?.trim() || <Missing />}
              </Fact>
              <Fact label="License type">
                {upload.licenseType ? (
                  (LICENSE_LABELS[upload.licenseType] ?? upload.licenseType)
                ) : (
                  <Missing label="None" />
                )}
              </Fact>
            </>
          ) : null}
          <Fact label="Source">
            <ExternalValue url={upload.sourceUrl} />
          </Fact>
          <Fact label="Evidence">
            <ExternalValue url={upload.rightsEvidenceUrl} />
          </Fact>
        </FactList>
      </DetailSection>
    </>
  )
}

function FactList({ children }: Readonly<{ children: ReactNode }>) {
  return <dl className="space-y-2.5 text-[13px]">{children}</dl>
}

/** Label column and a value that wraps: these values are sentences and URLs. */
function Fact({
  label,
  children,
}: Readonly<{ label: string; children: ReactNode }>) {
  return (
    <div className="grid grid-cols-[7.25rem_minmax(0,1fr)] gap-x-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words text-foreground">{children}</dd>
    </div>
  )
}

function Missing({ label = "None given" }: Readonly<{ label?: string }>) {
  return <span className="text-muted-foreground">{label}</span>
}

/** Uploader-supplied, so only http(s) addresses become links. */
function ExternalValue({ url }: Readonly<{ url: string | null }>) {
  const value = url?.trim()
  if (!value) return <Missing />
  if (!/^https?:\/\//i.test(value)) {
    return <span className="break-all">{value}</span>
  }
  return (
    <a
      href={value}
      target="_blank"
      rel="noreferrer noopener"
      className="decoration-line-strong rounded-sm break-all underline underline-offset-2 transition-colors duration-150 outline-none hover:decoration-foreground focus-visible:ring-2 focus-visible:ring-ring"
    >
      {value}
      <ArrowUpRight
        aria-hidden
        className="ml-0.5 inline size-3 align-[-1px] text-muted-foreground"
      />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  )
}
