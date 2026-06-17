export interface XshulinerBuildInfo {
  schemaVersion: string;
  app: {
    name: string;
    version?: string;
    env: string;
    mode?: string;
  };
  build: {
    time: string;
    timestamp: number;
    user?: string;
    machine?: string;
    nodeVersion?: string;
    packageManager?: string;
  };
  git: {
    branch?: string;
    tag?: string;
    nearestTag?: string;
    commit: string;
    shortCommit: string;
    commitTime?: string;
    dirty?: boolean;
    remote?: string;
    latestCommits: Array<{
      hash: string;
      shortHash: string;
      author: string;
      date: string;
      message: string;
    }>;
  };
  ci?: {
    provider?: string;
    runId?: string;
    runNumber?: string;
    workflow?: string;
    jobUrl?: string;
    commitUrl?: string;
  };
  deploy?: {
    target?: string;
    region?: string;
    url?: string;
    releaseId?: string;
    buildId?: string;
  };
  runtime?: {
    apiBaseUrl?: string;
    publicPath?: string;
  };
}

export type XshulinerBuildInfoWithPrint = XshulinerBuildInfo & {
  print?: () => XshulinerBuildInfo;
};

declare global {
  interface Window {
    __xshuliner__?: XshulinerBuildInfoWithPrint;
  }
}

export {};
