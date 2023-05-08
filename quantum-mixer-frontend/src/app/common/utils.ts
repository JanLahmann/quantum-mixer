/**
   * Get a CSS value relative to CSS variable `--qo-qubit-height`
   * @param value
   * @returns
   */
export function cssRelValue(value?: number): string {
  if(!value) {
    return '0';
  }
  return `calc(${value} * var(--qo-qubit-height))`;
}
