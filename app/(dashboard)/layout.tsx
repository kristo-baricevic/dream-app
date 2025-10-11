// import { UserButton } from "@clerk/nextjs";
'use client';
import { RootState } from '@/redux/rootReducer';
import { IconCloudFilled } from '@tabler/icons-react';
import Link from 'next/link';
import { useSelector } from 'react-redux';

type DashboardLayoutProps<T = {}> = {
  children: React.ReactNode;
} & T;

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const firstEntry = useSelector((state: RootState) => state.journal.entries[0]);

  const links = [
    // { href: '/', label: 'Landing Page' },
    { href: '/journal', label: 'Home' },
    { href: `/journal/${firstEntry?.id}`, label: 'Journal' },
    { href: '/analysis', label: 'Analysis' },
    { href: '/history', label: 'Charts' },
    // { href: '/playlist', label: 'Playlist' },
    { href: '/settings', label: 'Settings' },
    { href: '/about', label: 'About' },
  ];

  return (
    <div className="min-h-screen bg-pink-100 background-main font-sans">
      <header className="bg-white border-b border-black/10 sticky">
        <div className="bg-gradient-to-r from-pink-200 via-pink-300 to-pink-400 flex justify-between items-center min-w-screen mx-auto p-4 tw-w-full">
          <div className="flex flex-row">
            <h1 className="flex justify-center items-center text-2xl gap-2">
              {' '}
              <IconCloudFilled className="flex justify-center items-center w-6 h-6 text-white" />
              <span className="font-mono ml-2 text-[20px]">Dream With AI</span>
            </h1>
          </div>
          {/* <UserButton /> */}
        </div>
      </header>
      <nav className="bg-white border-b border-black/10">
        <ul className="flex sm:space-x-4 justify-center">
          {links.map((link) => (
            <li
              className="hover:bg-pink-300 sm:px-4 px-[8px] py-2 text-xs sm:text-base"
              key={link.href}
            >
              <Link href={link.href}>
                <span className="text-mono">{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <main className="max-w-screen-xl mx-auto p-2">{children}</main>
    </div>
  );
};

export default DashboardLayout;
