import useThemeStore from '../store/themeStore';

export default function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="w-9 h-9 rounded-xl glass-card flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-[#16A34A] dark:hover:text-[#22C55E] hover:border-[#16A34A]/40 transition-all focus-ring shadow-xs"
    >
      <span aria-hidden="true" className="text-base select-none">
        {isDark ? '☀️' : '🌙'}
      </span>
    </button>
  );
}
