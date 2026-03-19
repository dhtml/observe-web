"use client";

import { ObserveShell } from "@/app/observe-shell";
import type { ReactNode } from "react";
import { use } from "react";

interface Props {
  params: Promise<{ id: string }>;
  children: ReactNode;
}

export default function ProjectLayout({ params, children }: Props) {
  const { id } = use(params);
  return <ObserveShell projectId={id}>{children}</ObserveShell>;
}
