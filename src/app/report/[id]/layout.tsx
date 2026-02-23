import type { Metadata } from "next";
import { ReportService } from "@/services/report-service";
import { Logger } from "@/lib/logger";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://vidro.dev";

interface ReportLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ReportLayoutProps): Promise<Metadata> {
  const { id } = await params;
  const context = Logger.createContext();

  const { report } = await ReportService.getById(id, context);

  if (!report) {
    return {
      title: "Report Not Found",
      description: "This bug report could not be found.",
      robots: { index: false, follow: false },
    };
  }

  const title = report.title || "Bug Report";
  const description =
    report.description ||
    report.stakeholderSummary ||
    `${report.type === "SCREENSHOT" ? "Screenshot" : "Video"} bug report captured with Vidro.`;
  const reportUrl = `${APP_URL}/report/${id}`;

  const ogImageUrl = `${APP_URL}/report/${id}/opengraph-image`;

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      type: "article",
      title: `${title} | Vidro`,
      description,
      url: reportUrl,
      siteName: "Vidro",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Vidro`,
      description,
      images: [ogImageUrl],
    },
  };
}

export default function ReportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
