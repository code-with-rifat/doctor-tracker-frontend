export function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white/70 px-4 py-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
        <p className="text-xs text-slate-500">
          © {year} Doctor Tracker
        </p>
        <p className="text-xs text-slate-500">
          Crafted by{' '}
          <span className="font-semibold tracking-tight text-slate-800">
            Riazul Islam Rifat
          </span>
        </p>
      </div>
    </footer>
  );
}
