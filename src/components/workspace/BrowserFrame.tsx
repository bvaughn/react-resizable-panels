import { ArrowTopRightOnSquareIcon } from "@heroicons/react/16/solid";

/**
 * An iframe dressed up as a small browser window (with an address bar), to show that it loads its own copy of the app.
 */
export function BrowserFrame({ src, title }: { src: string; title: string }) {
  return (
    <div className="flex flex-col rounded-lg border border-ink/15 overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 px-2 py-1.5 bg-ink/8 border-b border-ink/10">
        <div aria-hidden className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        {/* Both frames show the same origin, since copies of an app can only exchange tabs within one */}
        <div className="flex-1 min-w-0 truncate rounded-md bg-ink/8 px-2 py-0.5 text-xs text-ink/60 text-center">
          {location.host}
          {src}
        </div>
        <a
          aria-label={`Open ${title} in new window`}
          className="p-0.5 rounded text-ink/60 hover:text-ink hover:bg-ink/10"
          href={src}
          rel="noreferrer"
          target="_blank"
          title="Open in new window"
        >
          <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
        </a>
      </div>
      {/* The embedded page is transparent, so this background is also shown while it loads */}
      <iframe className="block h-64 w-full bg-ink/5" src={src} title={title} />
    </div>
  );
}
