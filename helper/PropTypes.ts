export interface ConfigPayload {
  cmaToken: string;
  deliveryToken: string;
  appRegion: string;
  apiKey: string;
  branch: string;
  stackname: string;
  ts?: number;
  exp?: number;
}