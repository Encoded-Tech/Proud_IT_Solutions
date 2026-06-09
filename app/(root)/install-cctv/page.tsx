import CctvBuilderClient from "@/components/client/CctvBuilderClient";
import { APP_NAME, SERVER_PRODUCTION_URL } from "@/config/env";
import { fetchPublicCctvParts } from "@/lib/server/fetchers/fetchCctv";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: `Install CCTV Cameras | ${APP_NAME}`,
  description:
    "Build a CCTV installation package with cameras, NVR, storage, networking accessories and installation service.",
  alternates: {
    canonical: `${SERVER_PRODUCTION_URL}/install-cctv`,
  },
};

export default async function InstallCctvPage() {
  const result = await fetchPublicCctvParts();

  return <CctvBuilderClient parts={result.data} />;
}
