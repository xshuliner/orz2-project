import { postUpdateMemberInfo, postUploadMemberAvatar } from '@/api';
import { useAuth } from '@/components/ContextAuth';
import { LayoutPage } from '@/components/LayoutPage';
import { OButton } from '@/components/OButton';
import { OCard } from '@/components/OCard';
import { OModal } from '@/components/OModal';
import { useI18n } from '@/hooks/useI18n';
import { X, ZoomIn } from 'lucide-react';
import { ChangeEvent, useRef, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { Navigate } from 'react-router-dom';
import './index.css';

async function createCroppedImage(source: string, crop: Area) {
  const image = new Image();
  image.src = source;
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('Unable to read image'));
  });
  const canvas = document.createElement('canvas');
  canvas.width = crop.width;
  canvas.height = crop.height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas unavailable');
  context.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height
  );
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      blob =>
        blob ? resolve(blob) : reject(new Error('Unable to crop image')),
      'image/jpeg',
      0.9
    )
  );
}

export function PageMemberDetail() {
  const { locale, messages } = useI18n();
  const { user, refreshUser } = useAuth();
  const copy = messages.member;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(() => ({
    avatarUrl: user?.avatarUrl ?? '',
    nickName: user?.name ?? '',
    gender: user?.gender ?? 0,
    province: user?.province ?? '',
    provinceCode: user?.provinceCode ?? '',
    city: user?.city ?? '',
    cityCode: user?.cityCode ?? '',
    area: user?.area ?? '',
    areaCode: user?.areaCode ?? '',
    title: user?.title ?? '',
  }));
  const [cropImage, setCropImage] = useState('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState('');

  if (!user) return <Navigate replace to='/' />;
  const setField = (field: keyof typeof draft, value: string | number) =>
    setDraft(current => ({ ...current, [field]: value }));
  const selectImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setNotice(copy.imageInvalid);
      return;
    }
    setCropImage(URL.createObjectURL(file));
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };
  const applyCrop = async () => {
    if (!cropImage || !croppedArea) return;
    setIsSaving(true);
    setNotice('');
    try {
      const image = await createCroppedImage(cropImage, croppedArea);
      const response = await postUploadMemberAvatar({
        file: image,
        filename: 'avatar.jpg',
      });
      const avatarUrl =
        response.data?.code === 200 ? response.data.body : undefined;
      if (!avatarUrl) throw new Error('Upload failed');
      setDraft(current => ({ ...current, avatarUrl }));
      setCropImage('');
    } catch {
      setNotice(copy.uploadFailed);
    } finally {
      setIsSaving(false);
    }
  };
  const save = async () => {
    setIsSaving(true);
    setNotice('');
    try {
      const response = await postUpdateMemberInfo({
        ...draft,
        nickName: draft.nickName.trim(),
      });
      if (response.data?.code !== 200) throw new Error('Save failed');
      await refreshUser();
      setNotice(copy.saved);
    } catch {
      setNotice(copy.saveFailed);
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <LayoutPage
      backLink={false}
      description={copy.profileDescription}
      seoConfig={{
        title: copy.profileTitle,
        description: copy.profileDescription,
        canonicalPath: '/member/detail',
        locale,
        robots: 'noindex, follow',
      }}
      title={copy.profileTitle}
    >
      <section className='member-detail-layout' aria-label={copy.profileTitle}>
        <OCard className='profile-avatar-card' padding='lg'>
          <img
            className='profile-avatar'
            src={
              draft.avatarUrl ||
              'https://cos.orz2.online/SmartApp/Avatar/default_000000.webp'
            }
            alt={copy.avatar}
          />
          <OButton
            size='sm'
            variant='secondary'
            type='button'
            onClick={() => fileInputRef.current?.click()}
          >
            {copy.uploadAvatar}
          </OButton>
          <input
            ref={fileInputRef}
            className='sr-only'
            accept='image/*'
            type='file'
            onChange={selectImage}
          />
        </OCard>
        <OCard padding='lg'>
          <form
            className='profile-form'
            onSubmit={event => {
              event.preventDefault();
              void save();
            }}
          >
            <label>
              {copy.nickname}
              <input
                required
                maxLength={40}
                value={draft.nickName}
                onChange={event => setField('nickName', event.target.value)}
              />
            </label>
            <label>
              {copy.gender}
              <select
                value={draft.gender}
                onChange={event =>
                  setField('gender', Number(event.target.value))
                }
              >
                {copy.genders.map((label, index) => (
                  <option key={label} value={index}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {copy.title}
              <input
                maxLength={40}
                value={draft.title}
                onChange={event => setField('title', event.target.value)}
              />
            </label>
            <label>
              {copy.province}
              <input
                maxLength={40}
                value={draft.province}
                onChange={event => setField('province', event.target.value)}
              />
            </label>
            <label>
              {copy.city}
              <input
                maxLength={40}
                value={draft.city}
                onChange={event => setField('city', event.target.value)}
              />
            </label>
            <label>
              {copy.area}
              <input
                maxLength={40}
                value={draft.area}
                onChange={event => setField('area', event.target.value)}
              />
            </label>
            {notice && (
              <p className='member-detail-notice' role='status'>
                {notice}
              </p>
            )}
            <OButton className='profile-save' disabled={isSaving} type='submit'>
              {isSaving ? copy.saving : copy.save}
            </OButton>
          </form>
        </OCard>
      </section>
      <OModal
        className='crop-modal'
        isOpen={Boolean(cropImage)}
        onClose={() => setCropImage('')}
        titleId='crop-avatar-title'
      >
        <div className='crop-dialog'>
          <header className='crop-dialog-header'>
            <div>
              <h2 id='crop-avatar-title'>{copy.cropTitle}</h2>
              <p>{copy.cropDescription}</p>
            </div>
            <OButton
              aria-label={copy.cancel}
              className='crop-close'
              size='sm'
              type='button'
              variant='ghost'
              onClick={() => setCropImage('')}
            >
              <X aria-hidden='true' size={18} strokeWidth={2} />
            </OButton>
          </header>
          <div className='crop-stage' aria-label={copy.cropTitle}>
            <Cropper
              image={cropImage}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, area) => setCroppedArea(area)}
            />
          </div>
          <section className='crop-zoom' aria-labelledby='crop-zoom-label'>
            <div className='crop-zoom-heading'>
              <label id='crop-zoom-label' htmlFor='crop-zoom'>
                <ZoomIn aria-hidden='true' size={16} strokeWidth={2} />
                {copy.cropZoom}
              </label>
              <output htmlFor='crop-zoom'>{Math.round(zoom * 100)}%</output>
            </div>
            <input
              aria-labelledby='crop-zoom-label'
              id='crop-zoom'
              min='1'
              max='3'
              step='0.1'
              type='range'
              value={zoom}
              onChange={event => setZoom(Number(event.target.value))}
            />
          </section>
          <footer className='crop-actions'>
            <OButton
              variant='secondary'
              type='button'
              onClick={() => setCropImage('')}
            >
              {copy.cancel}
            </OButton>
            <OButton
              disabled={isSaving}
              type='button'
              onClick={() => void applyCrop()}
            >
              {copy.confirmCrop}
            </OButton>
          </footer>
        </div>
      </OModal>
    </LayoutPage>
  );
}
