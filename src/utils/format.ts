// src/utils/format.ts
const formatter = new Intl.NumberFormat('zh-TW');

export const formatNumber = (num: number): string => {
  return formatter.format(Math.round(num));
};