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
    home: {
        path: '/',
        getHref: () => '/',
    } satisfies PathItem,

    comparison: {
        path: '/comparison',
        getHref: () => '/comparison',
    } satisfies PathItem,

    dashboard: {
        path: '/dashboard',
        getHref: () => '/dashboard',
    } satisfies PathItem,

    upload: {
        path: '/upload',
        getHref: () => '/upload',
    } satisfies PathItem,
} as const;

export type AppPath = keyof typeof Paths;
