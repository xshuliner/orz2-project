export const utilityTools = {
  'json-formatter': { id: 'tool-json', kind: 'json' },
  'palette-lab': { id: 'tool-color', kind: 'color' },
  'base64-converter': { id: 'tool-base64', kind: 'base64' },
  'markdown-editor': { id: 'tool-markdown', kind: 'markdown' },
  'qrcode-generator': { id: 'tool-qrcode', kind: 'qrcode' },
} as const;

export type UtilityToolSlug = keyof typeof utilityTools;
export type UtilityToolKind = (typeof utilityTools)[UtilityToolSlug]['kind'];
