import type { ReactNode } from "react";

export interface LegalSection {
  id: string;
  title: string;
  content: ReactNode;
}

interface LegalPageProps {
  title: string;
  /** e.g. "26 October 2026" */
  updated: string;
  intro: ReactNode;
  sections: LegalSection[];
}

/** Shared layout for policy pages (terms, privacy, shipping, returns). */
export default function LegalPage({ title, updated, intro, sections }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-cream-50 py-14">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <header className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-gray-800 mb-3">{title}</h1>
          <p className="text-sm text-gray-400">Last updated: {updated}</p>
        </header>

        <div className="card p-6 sm:p-10">
          <div className="text-gray-600 leading-relaxed space-y-3">{intro}</div>

          <nav aria-label="Contents" className="mt-8 p-5 bg-cream-50 rounded-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Contents</p>
            <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm list-decimal list-inside">
              {sections.map((s) => (
                <li key={s.id} className="text-gray-400">
                  <a href={`#${s.id}`} className="text-gray-700 hover:text-brand-700">{s.title}</a>
                </li>
              ))}
            </ol>
          </nav>

          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="mt-10 scroll-mt-28">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-gray-800 mb-3">
                {i + 1}. {s.title}
              </h2>
              <div className="text-gray-600 leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:text-brand-700 [&_a]:font-medium hover:[&_a]:underline [&_strong]:text-gray-800">
                {s.content}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
