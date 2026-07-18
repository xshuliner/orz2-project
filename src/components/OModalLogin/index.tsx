import type { AuthMemberInfo } from '@/api';
import { OButton } from '@/components/OButton';
import { OIconButton } from '@/components/OIconButton';
import { OModal } from '@/components/OModal';
import { useI18n } from '@/hooks/useI18n';
import managerCache, { cacheKeys } from '@/utils/manager/cache';
import { Loader2, MessageCircle, RefreshCw, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import './index.css';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  gender: number;
  province: string;
  provinceCode: string;
  city: string;
  cityCode: string;
  area: string;
  areaCode: string;
  title: string;
  level: number;
  experience: number;
  score: number;
}

interface OModalLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: AuthUser) => void;
}

const pollingDelay = 2000;
const loadOrz2Api = () => import('@/api').then(module => module.default.Orz2);

function isRetryableLoginStatus(statusCode?: number) {
  return !statusCode || statusCode === 409 || statusCode >= 500;
}

export function toAuthUser(
  memberInfo: AuthMemberInfo,
  fallbackName = 'WeChat user'
): AuthUser {
  return {
    id: memberInfo._id || memberInfo.sys_thirdId || 'wechat-user',
    name:
      memberInfo.user_nickName || memberInfo.identity_username || fallbackName,
    email: memberInfo.identity_email || '',
    avatarUrl: memberInfo.user_avatarUrl || undefined,
    gender: memberInfo.user_gender ?? 0,
    province: memberInfo.user_province || '',
    provinceCode: memberInfo.user_province_code || '',
    city: memberInfo.user_city || '',
    cityCode: memberInfo.user_city_code || '',
    area: memberInfo.user_area || '',
    areaCode: memberInfo.user_area_code || '',
    title: memberInfo.user_title || '',
    level: memberInfo.user_level ?? 0,
    experience: memberInfo.user_exp ?? 0,
    score: memberInfo.user_score ?? 0,
  };
}

export function clearAuthStorage() {
  managerCache.removeLocalStorage(cacheKeys.authUser);
  managerCache.removeLocalStorage(cacheKeys.authToken);
  managerCache.removeLocalStorage(cacheKeys.authRefreshToken);
}

function persistTokens(token: string, refreshToken?: string) {
  managerCache.setLocalStorage(cacheKeys.authToken, token);
  if (refreshToken) {
    managerCache.setLocalStorage(cacheKeys.authRefreshToken, refreshToken);
  } else {
    managerCache.removeLocalStorage(cacheKeys.authRefreshToken);
  }
}

function readQrCodeAsDataUrl(
  buffer: unknown,
  copy: ReturnType<typeof useI18n>['messages']['login']
) {
  return new Promise<string>((resolve, reject) => {
    if (!Array.isArray(buffer)) {
      reject(new Error(copy.errors.qrDataInvalid));
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error(copy.errors.qrReadFailed));
    reader.readAsDataURL(
      new Blob([new Uint8Array(buffer)], { type: 'image/jpeg' })
    );
  });
}

/** Shared QR-code login modal. Mount one instance near the auth provider. */
export function OModalLogin({ isOpen, onClose, onLogin }: OModalLoginProps) {
  const { messages } = useI18n();
  const loginCopy = messages.login;
  const [isLoading, setIsLoading] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [error, setError] = useState('');
  const pollingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionRef = useRef(0);

  const stopPolling = useCallback(() => {
    sessionRef.current += 1;
    if (pollingTimerRef.current) {
      clearTimeout(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
  }, []);

  const queryLoginStatus = useCallback(
    async (uuid: string, session: number) => {
      if (session !== sessionRef.current) return;
      const scheduleNextPoll = () => {
        if (session !== sessionRef.current) return;
        pollingTimerRef.current = setTimeout(
          () => queryLoginStatus(uuid, session),
          pollingDelay
        );
      };

      try {
        const api = await loadOrz2Api();
        const response = await api.getQueryMiniCodeLogin({ uuid });
        if (session !== sessionRef.current) return;
        if (response.statusCode !== 200) {
          if (isRetryableLoginStatus(response.statusCode)) {
            scheduleNextPoll();
          } else {
            setError(loginCopy.errors.loginFailed);
            stopPolling();
          }
          return;
        }

        const { status, token, refreshToken } = response.data?.body || {};

        if (token) {
          const memberResponse = await api.getQueryMemberInfo(token);
          if (session !== sessionRef.current) return;
          if (memberResponse.statusCode !== 200) {
            if (isRetryableLoginStatus(memberResponse.statusCode)) {
              scheduleNextPoll();
            } else {
              setError(loginCopy.errors.loginFailed);
              stopPolling();
            }
            return;
          }

          const memberInfo = memberResponse.data?.body?.memberInfo;
          if (!memberInfo) {
            clearAuthStorage();
            setError(loginCopy.errors.loginFailed);
            stopPolling();
            return;
          }
          persistTokens(token, refreshToken);
          stopPolling();
          onLogin(toAuthUser(memberInfo, loginCopy.wechatUser));
          return;
        }

        if (status === 'pending') {
          scheduleNextPoll();
          return;
        }

        setIsExpired(true);
        stopPolling();
      } catch (queryError) {
        console.error('OModalLogin query login status error', queryError);
        scheduleNextPoll();
      }
    },
    [loginCopy.errors.loginFailed, loginCopy.wechatUser, onLogin, stopPolling]
  );

  const initQrCode = useCallback(async () => {
    stopPolling();
    const session = sessionRef.current;
    setIsLoading(true);
    setIsExpired(false);
    setQrCodeUrl('');
    setError('');

    try {
      const api = await loadOrz2Api();
      const response = await api.postCreateMiniCodeLogin();
      if (session !== sessionRef.current) return;
      const { data, uuid } = response?.data?.body || {};
      if (!uuid) throw new Error(loginCopy.errors.qrCreateFailed);
      setQrCodeUrl(await readQrCodeAsDataUrl(data?.data, loginCopy));
      if (session === sessionRef.current) {
        queryLoginStatus(uuid, session);
      }
    } catch (initError) {
      console.error('OModalLogin init QR code error', initError);
      if (session === sessionRef.current) {
        setError(loginCopy.errors.qrLoadFailed);
      }
    } finally {
      if (session === sessionRef.current) {
        setIsLoading(false);
      }
    }
  }, [loginCopy, queryLoginStatus, stopPolling]);

  useEffect(() => {
    if (!isOpen) {
      stopPolling();
      return;
    }
    initQrCode();

    return () => {
      stopPolling();
    };
  }, [initQrCode, isOpen, stopPolling]);

  if (!isOpen) return null;

  return (
    <OModal
      className='login-modal'
      isOpen={isOpen}
      onClose={onClose}
      overlayClassName='login-modal-overlay'
      titleId='login-modal-title'
    >
      <>
        <OIconButton
          className='login-modal-close'
          size='sm'
          aria-label={loginCopy.closeAriaLabel}
          onClick={onClose}
        >
          <X size={18} aria-hidden='true' />
        </OIconButton>
        <div className='login-modal-heading'>
          <span className='login-modal-icon' aria-hidden='true'>
            <MessageCircle size={22} />
          </span>
          <div>
            <p className='login-modal-kicker'>{loginCopy.kicker}</p>
            <h2 id='login-modal-title'>{loginCopy.title}</h2>
            <p>{loginCopy.description}</p>
          </div>
        </div>

        <div className='login-qr-panel'>
          {isLoading ? (
            <div className='login-qr-placeholder'>
              <Loader2 className='login-spin' size={30} aria-hidden='true' />
              <span>{loginCopy.loading}</span>
            </div>
          ) : qrCodeUrl ? (
            <div className='login-qr-image-wrap'>
              <img
                className={
                  isExpired ? 'login-qr-image expired' : 'login-qr-image'
                }
                src={qrCodeUrl}
                alt={loginCopy.qrAlt}
              />
              {isExpired || error ? (
                <div className='login-qr-expired'>
                  <span>{error || loginCopy.expired}</span>
                  <RefreshButton onClick={initQrCode} />
                </div>
              ) : null}
            </div>
          ) : (
            <div className='login-qr-placeholder'>
              <span>{error || loginCopy.noQr}</span>
              <RefreshButton onClick={initQrCode} />
            </div>
          )}
        </div>

        <p className='login-modal-hint'>{loginCopy.hint}</p>
      </>
    </OModal>
  );
}

function RefreshButton({ onClick }: { onClick: () => void }) {
  const { messages } = useI18n();
  const loginCopy = messages.login;

  return (
    <OButton type='button' variant='secondary' onClick={onClick}>
      <RefreshCw size={16} aria-hidden='true' />
      {loginCopy.refreshButton}
    </OButton>
  );
}
