export interface Asset {
  uid: string;
  name?: string;
  filename?: string;
  is_dir: boolean;
  parent_uid: string | null;
  url?: string;
  title?: string;
  [key: string]: any;
}
