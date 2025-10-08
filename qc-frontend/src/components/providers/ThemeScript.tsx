export default function ThemeScript() {
  const codeToRunOnClient = `
    (function() {
      function getInitialTheme() {
        const persistedTheme = window.localStorage.getItem('qc-theme');
        const hasPersistedTheme = typeof persistedTheme === 'string';
        
        if (hasPersistedTheme) {
          return persistedTheme;
        }
        
        // Default to light theme if no preference is saved
        return 'light';
      }
      
      const theme = getInitialTheme();
      
      // Only add dark class if explicitly set to dark
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    })()
  `;

  return <script dangerouslySetInnerHTML={{ __html: codeToRunOnClient }} />;
}