export const DEFAULT_LOCALE = 'en-GB' as const;

export type SupportedLocale = 'en-GB' | 'es' | 'pt-BR' | 'zh-Hans';
export type TranslationState = 'source' | 'reviewed' | 'machine-assisted';

export interface LocaleMeta {
  code: SupportedLocale;
  slug: string;
  label: string;
  nativeLabel: string;
  dir: 'ltr' | 'rtl';
}

export interface LocaleSwitcherLink extends LocaleMeta {
  href: string;
  current: boolean;
}

export const SITE_LOCALES: LocaleMeta[] = [
  { code: 'en-GB', slug: '', label: 'English', nativeLabel: 'English', dir: 'ltr' },
  { code: 'es', slug: 'es', label: 'Spanish', nativeLabel: 'Espa\u00f1ol', dir: 'ltr' },
  { code: 'pt-BR', slug: 'pt-br', label: 'Portuguese (Brazil)', nativeLabel: 'Portugu\u00eas (Brasil)', dir: 'ltr' },
  { code: 'zh-Hans', slug: 'zh-hans', label: 'Chinese (Simplified)', nativeLabel: '\u7b80\u4f53\u4e2d\u6587', dir: 'ltr' },
];

export interface TranslationStateMeta {
  label: string;
  detail: string;
  indexed: boolean;
}

export function getLocaleMeta(code: SupportedLocale = DEFAULT_LOCALE): LocaleMeta {
  return SITE_LOCALES.find((locale) => locale.code === code) ?? SITE_LOCALES[0];
}

export function getLocaleHomeHref(base: string, code: SupportedLocale): string {
  const locale = getLocaleMeta(code);
  return locale.slug ? `${base}${locale.slug}/` : base;
}

export function buildLocaleSwitcherLinks(
  base: string,
  currentLocale: SupportedLocale,
  overrides: Partial<Record<SupportedLocale, string>> = {},
): LocaleSwitcherLink[] {
  return SITE_LOCALES.map((locale) => ({
    ...locale,
    href: overrides[locale.code] ?? getLocaleHomeHref(base, locale.code),
    current: locale.code === currentLocale,
  }));
}

export function buildAlternateTranslations(
  base: string,
  alternates: Partial<Record<SupportedLocale, string>> = {},
): Array<{ hreflang: string; href: string }> {
  return SITE_LOCALES
    .filter((locale) => alternates[locale.code])
    .map((locale) => ({
      hreflang: locale.code === 'en-GB' ? 'en-GB' : locale.code.toLowerCase(),
      href: alternates[locale.code] ?? getLocaleHomeHref(base, locale.code),
    }));
}

export function getTranslationStateMeta(state: TranslationState): TranslationStateMeta {
  switch (state) {
    case 'reviewed':
      return {
        label: 'Reviewed translation',
        detail: 'This page has a reviewed locale shell. English remains the source of truth when data changes.',
        indexed: true,
      };
    case 'machine-assisted':
      return {
        label: 'Machine-assisted translation',
        detail: 'This locale layer is for reading help only. It should stay non-indexed until someone reviews it.',
        indexed: false,
      };
    case 'source':
    default:
      return {
        label: 'Source language',
        detail: 'English is the source of truth for the live data and publishing pipeline.',
        indexed: true,
      };
  }
}
