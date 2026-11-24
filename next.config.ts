import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

export default function nextConfig(phase: string): NextConfig {
  const isProdBuild = phase === PHASE_PRODUCTION_BUILD;

  return {
    ...(isProdBuild ? { output: "export" } : {}),
    images: {
      unoptimized: true,
    },
  };
}
