import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Read the terms and conditions governing the use of Vidro, an AI-powered screen recording and bug reporting platform.",
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
