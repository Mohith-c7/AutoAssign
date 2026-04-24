export default function Footer() {
  return (
    <footer className="flex h-[40px] items-center justify-between border-t border-white/10 px-4 text-xs text-slate-400">
      <button className="transition hover:text-white">Delete my data</button>
      <a href="https://example.com/privacy" target="_blank" rel="noreferrer">
        Privacy policy
      </a>
    </footer>
  );
}

