export const qrcodeGeneratorToolId = 'tool-qrcode';
export const qrcodeGeneratorSeoKey = 'qrcode-generator';

export type StandardQrcodeContentType =
  | 'text'
  | 'url'
  | 'wifi'
  | 'email'
  | 'phone'
  | 'sms';
export type WifiEncryption = 'WPA' | 'WEP' | 'nopass';
export type QrcodeErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export const qrcodeByteLimits: Record<QrcodeErrorCorrectionLevel, number> = {
  L: 2800,
  M: 2200,
  Q: 1550,
  H: 1150,
};
