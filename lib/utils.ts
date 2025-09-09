import { Prisma } from "@prisma/client";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ZodError } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')   
    .replace(/\s+/g, '-')      
    .slice(0, 50);           
}

function capitalize(s: string) {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

export function formatError(error: unknown): string {
  // Zod 
  if (error instanceof ZodError) {
    const msgs = error.issues.map(i => i.message).filter(Boolean);
    return msgs.length ? msgs.join(". ") : "Validation failed.";
  }

  // Prisma 
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      // error.meta?.target 
      let field = "Field";
      const meta = error.meta; // Record<string, unknown> | undefined
      if (meta && typeof meta === "object" && "target" in meta) {
        const t = (meta as { target?: unknown }).target;
        if (Array.isArray(t) && t.length > 0) {
          const first = t[0];
          if (typeof first === "string" || typeof first === "number") {
            field = String(first);
          }
        }
      }
      return `${capitalize(field)} already exists`;
    }
    // Other Prisma error
    return `Database error (${error.code}).`;
  }

  // General Error
  if (error instanceof Error) {
    return error.message;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export function inConst<T extends readonly string[]>(
  arr: T,
  v: unknown
): v is T[number] {
  return typeof v === "string" && (arr as readonly string[]).includes(v);
}

export function toConstOrNull<T extends readonly string[]>(
  arr: T,
  v: unknown
): T[number] | null {
  return inConst(arr, v) ? (v as T[number]) : null;
}

export function toConstOrDefault<T extends readonly string[]>(
  arr: T,
  v: unknown,
  def: T[number]
): T[number] {
  return inConst(arr, v) ? (v as T[number]) : def;
}
