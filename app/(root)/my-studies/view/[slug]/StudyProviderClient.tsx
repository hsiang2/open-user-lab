"use client";
import { createContext, useContext } from "react";

type Study = any; // 你自己的型別

const StudyContext = createContext<Study | null>(null);
export const useStudy = () => useContext(StudyContext);

export function StudyProvider({
  study,
  slug,
  children,
}: {
  study: Study;
  slug: string; // 若需要也可存起來
  children: React.ReactNode;
}) {
  return <StudyContext.Provider value={study}>{children}</StudyContext.Provider>;
}