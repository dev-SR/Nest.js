import React from 'react';
import { Helmet } from 'react-helmet';

import TopNavigation from './topnavigation';

// const style = {
// 	container: `bg-gray-100 h-screen overflow-hidden relative`,
// 	mainContainer: `flex flex-col h-screen pl-0 w-full lg:space-y-4 lg:w-99`,
// 	main: `h-screen overflow-auto pb-36 pt-8 px-2 md:pb-8 md:pt-4 md:px-8 lg:pt-0`
// };
interface Props {
  children: React.ReactNode;
  title?: string;
  description?: string;
}
const DashboardLayout: React.FC<Props> = ({ children, title, description }) => {
  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Helmet>
      <div className="bg-gray-100 dark:bg-gray-800 h-screen overflow-hidden relative">
        <div className="flex">
          {/* <SideNavigation /> */}
          <div className="w-screen overflow-y-auto">
            <div className="flex flex-col h-screen pl-0 w-full lg:space-y-4 lg:w-full">
              <TopNavigation />
              <main className="h-screen overflow-auto pb-36 pt-8 px-2 md:pb-8 md:pt-4 md:px-8 lg:pt-0 lg:w-full">
                {children}
              </main>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default DashboardLayout;
