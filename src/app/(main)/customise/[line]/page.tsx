import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLine, LINES } from "@/lib/designs";
import DesignGallery from "./DesignGallery";

interface Props {
  params: Promise<{ line: string }>;
}

export function generateStaticParams() {
  return LINES.map((l) => ({ line: l.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const line = getLine((await params).line);
  if (!line) return {};
  return { title: `Customise ${line.title}`, description: line.intro };
}

export default async function CustomiseGalleryPage({ params }: Props) {
  const line = getLine((await params).line);
  if (!line) notFound();
  return <DesignGallery lineId={line.id} />;
}
