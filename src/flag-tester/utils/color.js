export function getLuminance(hex) {
  const rgb = hex.match(/\w\w/g).map(x => {
    const c = parseInt(x, 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

export function getUIColor(bgHex) {
  return getLuminance(bgHex) > 0.35 ? '#000000' : '#FFFFFF';
}

export function updateUIColor(bgHex) {
  const color = getUIColor(bgHex);
  const isBlack = color === '#000000';
  document.documentElement.style.setProperty('--ui-color', color);
  document.documentElement.style.setProperty('--ui-color-rgb', isBlack ? '0, 0, 0' : '255, 255, 255');
}
