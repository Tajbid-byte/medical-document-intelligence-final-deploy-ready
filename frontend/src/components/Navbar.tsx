import Link from 'next/link';

const links = [
  { href: '/', label: 'Home' },
  { href: '/analyze', label: 'Analyze' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/interactions', label: 'Interactions' },
  { href: '/reminders', label: 'Reminders' },
  { href: '/records', label: 'Records' },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-clinical-600 text-lg font-black text-white shadow-soft">M</div>
          <div>
            <p className="text-lg font-black tracking-tight text-ink">MedIntel</p>
            <p className="hidden text-xs text-slate-500 sm:block">Document Intelligence System</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-2 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
        <Link href="/analyze" className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-clinical-700">
          Start Analysis
        </Link>
      </div>
      <div className="flex gap-2 overflow-x-auto border-t border-slate-100 px-4 py-2 md:hidden">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="whitespace-nowrap rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
            {link.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
