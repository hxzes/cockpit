import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: { extend: { borderRadius: { xl: '14px' } } },
  plugins: [],
}
export default config
