import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how Vidro collects, uses, and protects your personal information. Our privacy policy covers data handling for screen recordings, screenshots, and bug reports.",
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
