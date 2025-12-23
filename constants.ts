import { YogaCategory } from './types';

export const SUPABASE_URL = 'https://jdskbhlnqfrdsfdayqxe.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impkc2tiaGxucWZyZHNmZGF5cXhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0NDY4ODEsImV4cCI6MjA4MjAyMjg4MX0.yFdSy2cSNQ5HzUeIvB_ROhn5WguJDXilh-v4qWeNmb4';

export const ADMIN_EMAIL = 'admin@zenyoga.com';

/**
 * LOGO_URL: Representação SVG da logo minimalista de yoga enviada no anexo.
 * Definida como Base64 para garantir carregamento instantâneo e offline.
 */
const svgLogo = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <g fill="none" stroke="#e67e22" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="50" cy="25" r="7"/>
    <path d="M50 32 v60"/>
    <path d="M50 40 L25 10"/>
    <path d="M50 40 L75 10"/>
    <path d="M50 58 L20 52"/>
  </g>
</svg>`.trim();

export const LOGO_URL = `data:image/svg+xml;base64,${btoa(svgLogo)}`;

export { YogaCategory };