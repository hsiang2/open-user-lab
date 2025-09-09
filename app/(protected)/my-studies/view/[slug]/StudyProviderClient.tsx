"use client";
import { StudyForResearcher } from "@/contracts/study";
import { createContext, useContext } from "react";

export type Step = { id: string; order: number; name: string; note: string | null; deadline: string | null };
export type Status = { stepId: string; status: "todo" | "completed" };

type StudyCtx = {
  study: StudyForResearcher;
  workflow: { studyId: string; steps: Step[]; statuses: Status[] };
};

const StudyContext = createContext<StudyCtx | null>(null);

export const useStudy = () => {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error("useStudy must be used within StudyProvider");
  return ctx;
};

export function StudyProvider({
  study,
  workflow,
  children,
}: {
  study: StudyForResearcher;
  slug: string; 
  workflow: { studyId: string; steps: Step[]; statuses: Status[] };
  children: React.ReactNode;
}) {
  return <StudyContext.Provider value={{ study, workflow }}>{children}</StudyContext.Provider>;
}