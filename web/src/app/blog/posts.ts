// Blog post index. Adding a new post: (1) create the slug directory
// with page.tsx, (2) add its metadata here, (3) it appears on /blog and
// in the sitemap automatically.

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  readingMinutes: number;
};

export const POSTS: PostMeta[] = [
  {
    slug: "how-to-turn-long-youtube-videos-into-shorts",
    title:
      "How to turn long YouTube videos into shorts (2026 guide)",
    description:
      "Three ways to convert a long-form YouTube video into short vertical clips — manual editing, capable free tools, and AI-powered clippers — with the pros and cons of each.",
    publishedAt: "2026-07-31",
    readingMinutes: 8,
  },
  {
    slug: "youtube-shorts-from-travel-vlogs",
    title:
      "The travel vlogger's guide to YouTube Shorts: 10 clips from every vlog",
    description:
      "A workflow for turning your 15-30 minute travel vlogs into 10 vertical shorts a week, without spending your whole afternoon in a timeline editor.",
    publishedAt: "2026-07-31",
    readingMinutes: 7,
  },
  {
    slug: "convert-horizontal-to-vertical-video",
    title:
      "How to convert horizontal video to vertical for Reels, Shorts, and TikTok",
    description:
      "Four ways to reformat 16:9 landscape video into 9:16 vertical — free tools, manual crop, blurred-background fill, and AI face-tracking. Which to use when.",
    publishedAt: "2026-07-31",
    readingMinutes: 7,
  },
];
