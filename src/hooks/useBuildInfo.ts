import type {
  XshulinerBuildInfo,
  XshulinerBuildInfoWithPrint,
} from '@/types/buildInfo';
import { buildInfoJsonPath } from '@/utils/buildInfo';
import {
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';

type BuildInfoStatus = 'loading' | 'ready' | 'error';

interface BuildInfoState {
  error: Error | null;
  info: XshulinerBuildInfoWithPrint | null;
  status: BuildInfoStatus;
}

function readGlobalBuildInfo() {
  if (typeof window === 'undefined') return null;
  return window.__xshuliner__ ?? null;
}

function createPrintableInfo(
  info: XshulinerBuildInfo
): XshulinerBuildInfoWithPrint {
  const printableInfo = { ...info } as XshulinerBuildInfoWithPrint;
  Object.defineProperty(printableInfo, 'print', {
    enumerable: false,
    value: () => {
      console.group('%cXshuliner Build Info', 'font-weight:bold;');
      console.log('App:', printableInfo.app.name);
      console.log('Version:', printableInfo.app.version || '');
      console.log('Env:', printableInfo.app.env);
      console.log('Build time:', printableInfo.build.time);
      console.log('Build user:', printableInfo.build.user || '');
      console.log('Branch:', printableInfo.git.branch || '');
      console.log(
        'Tag:',
        printableInfo.git.tag || printableInfo.git.nearestTag || ''
      );
      console.log(
        'Commit:',
        printableInfo.git.shortCommit,
        printableInfo.git.commit
      );
      console.log(
        'CI:',
        printableInfo.ci?.jobUrl ? printableInfo.ci.jobUrl : ''
      );
      console.table(printableInfo.git.latestCommits || []);
      console.groupEnd();
      return printableInfo;
    },
  });

  return Object.freeze(printableInfo);
}

function mountGlobalBuildInfo(info: XshulinerBuildInfo) {
  const globalInfo = readGlobalBuildInfo();
  if (globalInfo) return globalInfo;

  const printableInfo = createPrintableInfo(info);
  if (typeof window !== 'undefined') {
    window.__xshuliner__ = printableInfo;
  }
  return printableInfo;
}

async function fetchBuildInfo(signal: AbortSignal) {
  const response = await fetch(buildInfoJsonPath, {
    cache: 'no-store',
    signal,
  });
  if (!response.ok) {
    throw new Error(`Failed to load build info: ${response.status}`);
  }
  return (await response.json()) as XshulinerBuildInfo;
}

function updateReady(
  setState: Dispatch<SetStateAction<BuildInfoState>>,
  info: XshulinerBuildInfoWithPrint
) {
  setState({
    error: null,
    info,
    status: 'ready',
  });
}

export function useBuildInfo() {
  const [state, setState] = useState<BuildInfoState>(() => {
    const globalInfo = readGlobalBuildInfo();
    return {
      error: null,
      info: globalInfo,
      status: globalInfo ? 'ready' : 'loading',
    };
  });

  const load = useCallback(() => {
    const controller = new AbortController();
    const globalInfo = readGlobalBuildInfo();
    if (globalInfo) {
      updateReady(setState, globalInfo);
      return () => controller.abort();
    }

    setState(current => ({
      error: null,
      info: current.info,
      status: 'loading',
    }));

    void fetchBuildInfo(controller.signal)
      .then(info => {
        if (!controller.signal.aborted) {
          updateReady(setState, mountGlobalBuildInfo(info));
        }
      })
      .catch(error => {
        if (!controller.signal.aborted) {
          setState({
            error: error instanceof Error ? error : new Error(String(error)),
            info: null,
            status: 'error',
          });
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => load(), [load]);

  return {
    ...state,
    reload: load,
    src: buildInfoJsonPath,
  };
}
