import Link from "next/link";
import { Article } from "../article";
import { POSTS } from "../posts";

const post = POSTS.find((p) => p.slug === "convert-horizontal-to-vertical-video")!;

export const metadata = {
  title: post.title,
  description: post.description,
  alternates: {
    canonical: `/blog/${post.slug}`,
  },
};

export default function Page() {
  return (
    <Article {...post}>
      <p>
        You shot in 16:9 landscape. Reels, TikTok, and YouTube Shorts want
        9:16 vertical. What&apos;s the least-worst way to bridge that gap?
      </p>
      <p>
        There are four common approaches, and the right one depends on
        what&apos;s IN your footage. This guide walks through each with
        the tradeoffs, so you can pick the right one for a given clip.
      </p>

      <h2>Why this is harder than it looks</h2>
      <p>
        A 1920×1080 landscape frame and a 1080×1920 vertical frame have
        the same total pixel count, but their shapes are so different
        that ~40% of the original width is either cropped or letterboxed
        in the vertical version. What you keep and what you throw away is
        an editorial choice, not a technical one.
      </p>
      <p>
        If your subject is centered (single speaker, product shot,
        centered landscape) any approach works. If your subject moves
        across the frame, or the important content is at the edges
        (burned-in text, someone else in frame), the approach matters a
        lot.
      </p>

      <h2>Approach 1 — Fixed center crop</h2>
      <p>
        The simplest and most common. You take a 9:16 slice from the
        center of the frame and throw away the rest.
      </p>
      <ul>
        <li>
          <strong>Pros:</strong> Simple, works with any tool, subject
          fills the frame at full resolution
        </li>
        <li>
          <strong>Cons:</strong> Anything on the far left or right of the
          frame gets cropped. Burned-in text (lower thirds, location
          tags, subtitle strips) gets cut in half.
        </li>
      </ul>
      <p>
        <strong>Use when:</strong> your subject stays center-frame the
        whole clip. Interview / talking-head footage. Product close-ups.
      </p>
      <p>
        <strong>Avoid when:</strong> the source has significant
        graphics/text near the edges, or the subject moves.
      </p>
      <h3>How to do it</h3>
      <ul>
        <li>
          <strong>CapCut:</strong> Import → aspect ratio 9:16 → auto
          places a centered crop. Move the crop rectangle if needed.
        </li>
        <li>
          <strong>Premiere / Final Cut / DaVinci Resolve:</strong>{" "}
          Duplicate the sequence, set output to 1080×1920, transform each
          clip&apos;s scale to fill.
        </li>
        <li>
          <strong>ffmpeg (command line):</strong>{" "}
          <code>
            ffmpeg -i in.mp4 -vf &quot;crop=ih*9/16:ih,scale=1080:1920&quot;
            -c:a copy out.mp4
          </code>
        </li>
      </ul>

      <h2>Approach 2 — Blurred background fill</h2>
      <p>
        Instead of cropping the source, you scale it to fit vertically
        (leaving black bars top and bottom), then fill those bars with a
        blurred + darkened copy of the same frame. Result: the whole
        original video is visible, just smaller, and the frame looks
        aesthetically full.
      </p>
      <ul>
        <li>
          <strong>Pros:</strong> Nothing gets cropped. Original text,
          logos, graphics all survive. Looks intentional (this is what
          most TikTok-first meme reposts use).
        </li>
        <li>
          <strong>Cons:</strong> Source video is smaller on screen.
          Feels less &quot;native&quot; to short-form.
        </li>
      </ul>
      <p>
        <strong>Use when:</strong> source has important content near the
        edges (burned-in text, multiple subjects). Or when you&apos;re
        reposting older long-form content and want to preserve everything.
      </p>
      <h3>How to do it (ffmpeg)</h3>
      <p>
        The magic is a filter graph with <code>split</code>, one
        stream gets scaled + blurred for background, the other gets
        scaled to fit for the foreground, then <code>overlay</code>{" "}
        composites them:
      </p>
      <ul>
        <li>
          <code>
            [0:v]split=2[bg][fg];[bg]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=30:2[bgb];[fg]scale=1080:1920:force_original_aspect_ratio=decrease[fgs];[bgb][fgs]overlay=(W-w)/2:(H-h)/2
          </code>
        </li>
      </ul>
      <p>
        CapCut also has this as a preset (called &quot;Background Blur&quot;
        or &quot;Fill&quot;). Most modern editors have it too.
      </p>

      <h2>Approach 3 — Static keyframed reframe (&quot;pan and scan&quot;)</h2>
      <p>
        You pick a few keyframes throughout the clip and manually move
        the 9:16 crop window to follow the action. Between keyframes the
        editor interpolates smoothly.
      </p>
      <ul>
        <li>
          <strong>Pros:</strong> Subject stays in frame even when they
          move. Looks polished.
        </li>
        <li>
          <strong>Cons:</strong> Manual work. Bad interpolation looks
          jerky. Doesn&apos;t scale to hundreds of clips.
        </li>
      </ul>
      <p>
        <strong>Use when:</strong> you have 1–3 hero clips that are worth
        20 minutes of manual reframing each.
      </p>

      <h2>Approach 4 — AI face-tracking reframe</h2>
      <p>
        The 9:16 crop window automatically follows detected faces in the
        video, smoothly panning between them. When only one face is
        visible, it centers on that face; when multiple faces appear, it
        jumps or zooms to include them.
      </p>
      <ul>
        <li>
          <strong>Pros:</strong> Automatic. Handles subject movement.
          Works at scale.
        </li>
        <li>
          <strong>Cons:</strong> Requires more compute. Occasionally
          picks wrong subject in complex scenes. Doesn&apos;t know that
          the &quot;subject&quot; might actually be a mountain in the
          background.
        </li>
      </ul>
      <p>
        <strong>Use when:</strong> talking-head vlogs, interviews,
        speaker-on-stage content — anything face-driven.
      </p>
      <p>
        <strong>Avoid when:</strong> landscape / cinematic footage where
        the subject is the environment, not a person.
      </p>
      <p>
        Tools with face-tracking reframe include most of the AI clip
        generators. It&apos;s becoming table-stakes in the category.
      </p>

      <h2>Quick decision guide</h2>
      <table className="w-full border rounded-md overflow-hidden text-sm mt-4">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="p-2">Content type</th>
            <th className="p-2">Best approach</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          <tr>
            <td className="p-2">Talking-head vlog, single speaker</td>
            <td className="p-2">Center crop or face-tracking</td>
          </tr>
          <tr>
            <td className="p-2">Interview, multiple speakers</td>
            <td className="p-2">Face-tracking</td>
          </tr>
          <tr>
            <td className="p-2">Landscape / drone / cinematic B-roll</td>
            <td className="p-2">Blurred background fill</td>
          </tr>
          <tr>
            <td className="p-2">Content with heavy on-screen graphics</td>
            <td className="p-2">Blurred background fill</td>
          </tr>
          <tr>
            <td className="p-2">Product demo, centered subject</td>
            <td className="p-2">Center crop</td>
          </tr>
          <tr>
            <td className="p-2">Highlight reel from a hero moment</td>
            <td className="p-2">Manual keyframed reframe</td>
          </tr>
        </tbody>
      </table>

      <h2>Common mistakes when reframing</h2>
      <ul>
        <li>
          <strong>Not exporting at 1080×1920.</strong> Some editors
          default to 720×1280 which looks noticeably softer on modern
          phones. Always export at 1080×1920 minimum.
        </li>
        <li>
          <strong>Baking in captions before reframing.</strong> Reframe
          first, add captions after — otherwise captions end up in the
          wrong position for the vertical crop.
        </li>
        <li>
          <strong>Forgetting to include padding at the top/bottom.</strong>{" "}
          Reels and Shorts UIs overlay text (like/comment/share icons,
          username) on the bottom third of the video. If your caption or
          key subject sits in that zone, it gets covered.
        </li>
        <li>
          <strong>Using different reframe styles across a series.</strong>{" "}
          Pick one look for your channel and stick with it. Consistency
          builds recognizability.
        </li>
      </ul>

      <h2>Where Nomads Shorts fits</h2>
      <p>
        <Link href="/">Nomads Shorts</Link> currently uses <strong>center
        crop</strong> — the simplest approach — because it&apos;s
        reliable and works well for the talking-head travel content we
        were designing for. Face-tracking is on the roadmap.
      </p>
      <p>
        If your content is heavier on landscape/cinematic B-roll or has
        important edge content, you might get better results with a
        blurred-fill workflow in CapCut. If it&apos;s primarily
        talking-head footage, center crop (what we do) is usually the
        right choice.
      </p>
      <p>
        Try it with{" "}
        <Link href="/sign-in">15 free credits</Link> to see how our
        reframing works for your specific footage.
      </p>

      <h3>Related reading</h3>
      <ul>
        <li>
          <Link href="/blog/how-to-turn-long-youtube-videos-into-shorts">
            How to turn long YouTube videos into shorts (2026 guide)
          </Link>
        </li>
        <li>
          <Link href="/blog/youtube-shorts-from-travel-vlogs">
            The travel vlogger&apos;s guide to YouTube Shorts
          </Link>
        </li>
      </ul>
    </Article>
  );
}
