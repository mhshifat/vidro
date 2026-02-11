import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bug Report",
  description: "View bug report details with AI insights, video playback, annotations, and comments.",
  robots: { index: false, follow: false },
};

export default function ReportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
