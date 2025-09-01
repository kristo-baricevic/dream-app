// import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

const links = [
  { href: '/', label: 'Landing Page' },
  { href: '/journal', label: 'Home' },
  { href: '/history', label: 'Charts' },
];

type DashboardLayoutProps<T = {}> = {
  children: React.ReactNode;
} & T;

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-pink-100 background-main font-sans">
      <header className="bg-white border-b border-black/10 sticky">
        <div className="bg-gradient-to-r from-pink-200 via-pink-300 to-pink-400 flex justify-between items-center max-w-screen-xl mx-auto p-4 tw-w-full">
          <h1 className="text-2xl">Dream With AI</h1>
          {/* <UserButton /> */}
        </div>
      </header>
      <nav className="bg-white border-b border-black/10">
        <ul className="flex space-x-4 justify-center">
          {links.map((link) => (
            <li className="hover:bg-pink-300 px-4 py-2" key={link.href}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
      <main className="max-w-screen-xl mx-auto p-2">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
