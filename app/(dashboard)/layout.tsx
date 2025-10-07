// import { UserButton } from "@clerk/nextjs";
import { IconCloudFilled } from '@tabler/icons-react';
import Link from 'next/link';

const links = [
  // { href: '/', label: 'Landing Page' },
  { href: '/journal', label: 'Home' },
  { href: '/history', label: 'Charts' },
  { href: '/analysis', label: 'Analysis' },
  { href: '/playlist', label: 'Playlist' },
  { href: '/settings', label: 'Settings' },
  { href: '/about', label: 'About' },
];

type DashboardLayoutProps<T = {}> = {
  children: React.ReactNode;
} & T;

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-pink-100 background-main font-sans">
      <header className="bg-white border-b border-black/10 sticky">
        <div className="bg-gradient-to-r from-pink-200 via-pink-300 to-pink-400 flex justify-between items-center min-w-screen mx-auto p-4 tw-w-full">
          <div className="flex flex-row">
            <h1 className="flex justify-center items-center text-2xl gap-2">
              {' '}
              <IconCloudFilled className="flex justify-center items-center w-6 h-6 text-white" />
              Dream With AI
            </h1>
          </div>
          {/* <UserButton /> */}
        </div>
      </header>
      <nav className="bg-white border-b border-black/10">
        <ul className="flex sm:space-x-4 justify-center">
          {links.map((link) => (
            <li className="hover:bg-pink-300 px-4 py-2 text-xs sm:text-base" key={link.href}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
      <main className="max-w-screen-xl mx-auto p-2">{children}</main>
    </div>
  );
};

export default DashboardLayout;
