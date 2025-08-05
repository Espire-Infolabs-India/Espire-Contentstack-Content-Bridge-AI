type PageProps = Record<string, any>;

export type Props = {
  page: Page;
  entryUrl: string;
  Component: any;
  pageProps: PageProps;
};

export type Page = {
  uid: string;
  locale: string;
  url: string;
  title: string;
};

export type Context = {
  resolvedUrl: string;
  setHeader: Function;
  write: Function;
  end: Function;
};

export type Pages = [page: Page];


export type PageUrl = string;
