import {
  DESCEND_PREPARATIONS,
  NICKNAME_ADJECTIVES,
  NICKNAME_NOUNS,
} from '@/pages/Products/ProductSilicon/config';

export const generateRandomNickName = () => {
  if (!NICKNAME_ADJECTIVES.length || !NICKNAME_NOUNS.length) return '';
  const adjective =
    NICKNAME_ADJECTIVES[Math.floor(Math.random() * NICKNAME_ADJECTIVES.length)];
  const noun =
    NICKNAME_NOUNS[Math.floor(Math.random() * NICKNAME_NOUNS.length)];

  return `${adjective}${noun}`;
};

export const getRandomDescendPreparation = (): string => {
  return DESCEND_PREPARATIONS[
    Math.floor(Math.random() * DESCEND_PREPARATIONS.length)
  ];
};
