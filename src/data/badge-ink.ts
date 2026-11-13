// Text colour for initials drawn on a provider's brand colour. White fails
// WCAG AA on most bright brand colours (OpenAI #10a37f is 3.2:1), so pick
// whichever of white or dark ink has the higher contrast ratio.
const INK = '#17120d';
const WHITE = '#ffffff';

function luminance(hex: string): number | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const [r, g, b] = [0, 2, 4].map((i) => {
    const v = parseInt(m[1].slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const ratio = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

export function badgeInk(background: string | null | undefined): string {
  const bg = luminance(background ?? '');
  if (bg === null) return WHITE;
  return ratio(bg, 1) >= ratio(bg, luminance(INK)!) ? WHITE : INK;
}
