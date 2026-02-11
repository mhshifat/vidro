// Centralized SEO metadata utility
// Place all page metadata here for single source of truth

export interface SeoMeta {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
}

export const seoConfig: Record<string, SeoMeta> = {
  dashboard: {
    title: "Dashboard | Vidro",
    description: "View and manage your reports, usage, and analytics.",
    keywords: ["dashboard", "reports", "analytics", "vidro"],
    image: "/uploads/dashboard-og.png",
    url: "/dashboard"
  },
  reportNew: {
    title: "Create Report | Vidro",
    description: "Create a new video or screenshot report.",
    keywords: ["report", "create", "video", "screenshot", "vidro"],
    image: "/uploads/report-og.png",
    url: "/report/new"
  },
  // Add more pages as needed
};

export function getSeoMeta(page: string): SeoMeta {
  return seoConfig[page] || {
    title: "Vidro",
    description: "Minimalist Maximalism reporting platform.",
    keywords: ["vidro", "reporting", "analytics"],
    image: "/uploads/default-og.png",
    url: "/"
  };
}
