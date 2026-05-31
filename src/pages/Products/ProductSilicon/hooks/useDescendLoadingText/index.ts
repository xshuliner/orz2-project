import { getRandomDescendPreparation } from '@/pages/Products/ProductSilicon/utils';
import { useEffect, useState } from 'react';

export const useDescendLoadingText = (
  isLoading: boolean,
  interval: number = 2000
): string => {
  const [text, setText] = useState<string>('下山中…');

  useEffect(() => {
    if (!isLoading) {
      setText('下山中…');
      return;
    }

    setText(getRandomDescendPreparation());

    const timer = setInterval(() => {
      setText(getRandomDescendPreparation());
    }, interval);

    return () => {
      clearInterval(timer);
    };
  }, [isLoading, interval]);

  return text;
};
