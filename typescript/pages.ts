type AdditionalParam = {
  title: string;
  title_h2: string;
  title_h3: string;
  description: string;
  banner_title: string;
  banner_description: string;
  designation: string;
  name: string;
  html_code: string;
  body: string;
  date: string;
  uid: string;
  related_post: [];
  copyright: string;
  announcement_text: string;
  label: {};
  url: string;
};

type Post = {
  url: string;
  is_archived: boolean;
  body: string;
  title: string;
  date: string;
  author: [Author];
  $: AdditionalParam;
};

type Author = {
  title: string;
  $: AdditionalParam;
};

type PageProps = {
  page: Page;
  posts: [];
  archivePost: [];
};

type Seo = {
  enable_search_indexing: boolean;
};

type Blog = {
  url: string;
  body: string;
  title: string;
  $: AdditionalParam;
};

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
  seo: Seo;
  title: string;
};

export type Context = {
  resolvedUrl: string;
  setHeader: Function;
  write: Function;
  end: Function;
};

export type Pages = [page: Page];

export type PostPage = [post: Post];

export type PageUrl = string;
