import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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

// Format errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatError(error: any) {
  if (error.name === 'ZodError' && Array.isArray(error.issues)) {
    // Handle Zod error (Zod v3+)
    const messages = error.issues.map((issue: any) => issue.message);
    return messages.join('. ');
  // if (error.name === 'ZodError') {
  //   // Handle Zod error
  //   const fieldErrors = Object.keys(error.errors).map(
  //     (field) => error.errors[field].message
  //   );

  //   return fieldErrors.join('. ');
  } else if (
    error.name === 'PrismaClientKnownRequestError' &&
    error.code === 'P2002'
  ) {
    // Handle Prisma error
    const field = error.meta?.target ? error.meta.target[0] : 'Field';
    return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  } else {
    // Handle other errors
    return typeof error.message === 'string'
      ? error.message
      : JSON.stringify(error.message);
  }
}


// 這些泛型只適用於 "as const" 的字串常量陣列

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
