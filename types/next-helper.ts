// types/next-helpers.ts
export type PageParams<P extends Record<string, string> = {}> = {
  params: Promise<P>;
};

export type PageProps<
  P extends Record<string, string> = {},
  S extends Record<string, string | undefined> = {}
> = {
  params: Promise<P>;
  searchParams: Promise<S>;
};
