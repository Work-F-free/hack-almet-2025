export type PathItem<TParams extends string | undefined = undefined> = TParams extends string
    ? {
          path: string;
          getHref: (param: string | number) => string;
      }
    : {
          path: string;
          getHref: () => string;
      };

export const Paths = {
    dashboard: {
        path: '/',
        getHref: () => '/',
    } satisfies PathItem,
} as const;
