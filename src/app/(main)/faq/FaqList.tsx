"use client";
import Link from "next/link";
import * as Accordion from "@radix-ui/react-accordion";
import { ArrowRight, ChevronDown } from "lucide-react";
import type { FaqSection } from "./faqs";

export default function FaqList({ sections }: { sections: FaqSection[] }) {
  return (
    <div className="space-y-10">
      {sections.map((section) => (
        <section key={section.id} id={section.id} className="scroll-mt-28">
          <h2 className="font-display text-2xl font-bold text-gray-800 mb-4">{section.title}</h2>
          <div className="card p-2 sm:p-3">
            <Accordion.Root type="single" collapsible>
              {section.faqs.map((f) => (
                <Accordion.Item key={f.q} value={f.q} className="border-b border-gray-100 last:border-0">
                  <Accordion.Header>
                    <Accordion.Trigger className="group w-full flex items-center justify-between gap-4 px-3 py-4 text-left text-sm sm:text-base font-semibold text-gray-800 hover:text-brand-700 transition-colors">
                      {f.q}
                      <ChevronDown className="w-4 h-4 flex-shrink-0 text-gray-400 transition-transform group-data-[state=open]:rotate-180" />
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content className="px-3 pb-4 text-sm text-gray-600 leading-relaxed">
                    <p>{f.a}</p>
                    {f.links && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
                        {f.links.map((l) => (
                          <Link key={l.href} href={l.href} className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:text-brand-800">
                            {l.label} <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </div>
        </section>
      ))}
    </div>
  );
}
