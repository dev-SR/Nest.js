import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
interface Props {
  children: React.ReactNode;
  initialTheme?: string;
}
interface Context extends React.HTMLAttributes<HTMLElement> {
  dark: boolean;
  showDarkModeSplash: boolean;
  setDark: Dispatch<SetStateAction<boolean>>;
}
const ThemeContext = React.createContext<Context>({} as Context);
// custom hook to consume all context values { theme,setTheme }
export function useTheme() {
  return React.useContext(ThemeContext);
}

const getInitialTheme = () => {
  const isDark = window.localStorage.getItem('DarkTheme');
  if (typeof window !== 'undefined' && isDark) {
    if (isDark == 'true') {
      return 'dark';
    } else {
      return 'light';
    }
  }
  const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
  if (userMedia.matches) {
    return 'dark';
  }
  // If you want to use dark theme as the default, return 'dark' instead
  return 'light';
};

const ThemeProvider: React.FC<Props> = ({ children }) => {
  const [dark, setDark] = useState(false);
  /*For showing blink black splash screen when dark mode is set until the whole webpage get fully converted into dark mode  */
  const [showDarkModeSplash, setShowDarkModeSplash] = useState(false);

  // get and Set Initial Mode
  useEffect(() => {
    const theme = getInitialTheme();
    let isDark = theme == 'dark' ? true : false;
    console.log(isDark);
    setShowDarkModeSplash(isDark);
    setDark(isDark);
  }, []);

  /* Handle Splash Screen */
  useEffect(() => {
    let load: ReturnType<typeof setTimeout>;
    if (showDarkModeSplash) {
      load = setTimeout(() => setShowDarkModeSplash(false), 500);
    }
    return () => {
      clearTimeout(load);
    };
  }, [showDarkModeSplash]);

  // Toggle Mode
  useEffect(() => {
    let root = window.document.documentElement;
    if (dark === true) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    window.localStorage.setItem('DarkTheme', JSON.stringify(dark));
  }, [dark]);

  return (
    <ThemeContext.Provider value={{ dark, setDark, showDarkModeSplash }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
