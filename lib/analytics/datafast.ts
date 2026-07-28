import { initDataFast } from "datafast"

import {
  DATAFAST_DOMAIN,
  DATAFAST_WEBSITE_ID,
} from "@/lib/macwall-datafast"

type DataFastClient = Awaited<ReturnType<typeof initDataFast>>

let datafast: DataFastClient | null = null
let initPromise: Promise<DataFastClient> | null = null

/**
 * Singleton DataFast client for browser use.
 * Pageviews auto-capture on init (including App Router navigations).
 */
export async function getDataFast(): Promise<DataFastClient> {
  if (datafast) return datafast
  if (!initPromise) {
    initPromise = initDataFast({
      websiteId: DATAFAST_WEBSITE_ID,
      domain: DATAFAST_DOMAIN,
      autoCapturePageviews: true,
    })
      .then((client) => {
        datafast = client
        return client
      })
      .catch((error) => {
        initPromise = null
        throw error
      })
  }
  return initPromise
}
