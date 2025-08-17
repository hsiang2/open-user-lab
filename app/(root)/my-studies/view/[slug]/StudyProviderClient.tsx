"use client";
import { createContext, useContext } from "react";

type Study = any; // 你自己的型別

export type Step = { id: string; order: number; name: string; note: string | null; deadline: string | null };
export type Status = { stepId: string; status: "todo" | "completed" };

const StudyContext = createContext<Study | null>(null);
export const useStudy = () => useContext(StudyContext);

export function StudyProvider({
  study,
  slug,
  workflow,
  children,
}: {
  study: Study;
  slug: string; // 若需要也可存起來
  workflow?: { studyId: string; steps: Step[]; statuses: Status[] };
  children: React.ReactNode;
}) {
  return <StudyContext.Provider value={{ study, slug, workflow }}>{children}</StudyContext.Provider>;
}