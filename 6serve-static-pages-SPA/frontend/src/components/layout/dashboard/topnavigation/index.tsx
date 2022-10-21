import { MoonIcon, SunIcon } from '@heroicons/react/solid';
import React from 'react';

import { useTheme } from '../../../../context/ThemeProvider';

export default function TopNavigation() {
  const { dark, setDark } = useTheme();
  console.log(dark);

  return (
    <header className="h-16 md:h-16 flex-shrink-0 shadow bg-white dark:bg-gray-900 items-center relative z-10">
      <div className="flex flex-center flex-col h-full justify-center mx-auto relative px-3 text-white z-10">
        <div className="flex items-center pl-1 relative w-full sm:ml-0 sm:pr-2 lg:max-w-68">
          <div className="flex items-center justify-end ml-5 mr-0 p-1 relative text-gray-700 w-full sm:mr-0 sm:right-auto">
            <button onClick={() => setDark((t) => !t)}>
              {dark ? (
                <SunIcon className="h-7 w-7 text-yellow-400" />
              ) : (
                <MoonIcon className="h-7 w-7 text-indigo-500" />
              )}
              {dark}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
