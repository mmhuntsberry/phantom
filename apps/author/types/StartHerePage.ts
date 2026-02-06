export type StartHereEntryPoint = {
  title: string;
  description?: string;
  ctaLabel?: string;
  customHref?: string;
  link?: {
    _type: string;
    slug?: string;
    title?: string;
  };
};

export type StartHerePage = {
  brandPromise: string;
  entryPoints: StartHereEntryPoint[];
  expectations?: string[];
};
