export const priceType = [
  { value: 'tokens', label: '按Token收费' },
  { value: 'times', label: '按次收费' }
];

export function ValueFormatter(value) {
  if (value == null) {
    return '';
  }
  if (value === 0) {
    return 0;
  }
  return `${value} 倍，$${parseFloat(value * 0.002).toFixed(6)}`;
}
