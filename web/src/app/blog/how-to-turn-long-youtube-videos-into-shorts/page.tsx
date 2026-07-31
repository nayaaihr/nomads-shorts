import Link from "next/link";
import { Article } from "../article";
import { POSTS } from "../posts";

const post = POSTS.find(
  (p) => p.slug === "how-to-turn-long-youtube-videos-into-shorts",
)!;

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
        You uploaded a 20-minute vlog on Tuesday. It got a few hundred views.
        Meanwhile, the vlogger you follow posts a 40-second clip from
        essentially the same footage and it does 200,000 views on YouTube
        Shorts by Friday. What&apos;s the difference?
      </p>
      <p>
        Not the content. The format. Short-form video is where discovery
        happens in 2026 — Reels, Shorts, and TikTok all algorithmically
        promote vertical short clips to people who don&apos;t follow you yet.
        Long-form video is where deep audience relationships form, but if
        nobody discovers you first, there&apos;s no audience to deepen.
      </p>
      <p>
        The good news: your long-form videos already contain the raw
        material for a dozen shorts. This guide covers the three practical
        ways to turn them into that format, and when each makes sense.
      </p>

      <h2>The three approaches</h2>
      <ol>
        <li>
          <strong>Edit them yourself</strong> — full control, zero cost,
          eats your afternoon.
        </li>
        <li>
          <strong>Free tools with light automation</strong> — CapCut,
          Descript free tier, YouTube&apos;s built-in Shorts editor.
        </li>
        <li>
          <strong>AI clip generators</strong> — paste a URL, get vertical
          clips back. Costs a few cents per video.
        </li>
      </ol>
      <p>None is objectively best. It depends on volume and your time.</p>

      <h2>Option 1 — Edit them yourself</h2>
      <p>
        Open Premiere / Final Cut / DaVinci Resolve, drop the source vlog on
        the timeline, and start scrubbing. You&apos;re looking for 30- to
        60-second sections that stand alone: a punchline, a story beat, a
        reveal, a strong quote. For each pick, you&apos;ll need to:
      </p>
      <ul>
        <li>Cut a clean start and end</li>
        <li>
          Reformat from 16:9 to 9:16 (usually a centered crop, sometimes
          re-keyframing to follow the subject)
        </li>
        <li>Add captions (a huge percentage of shorts are watched muted)</li>
        <li>Colour-correct if needed, especially if the source was HDR</li>
        <li>Export and upload separately to each platform</li>
      </ul>
      <p>
        Realistically that&apos;s 15–30 minutes per clip if you know your
        way around your editor, more if you don&apos;t. For ten clips from
        one vlog, budget 3–5 hours. Some creators build this into their
        weekly workflow and it works — but it&apos;s the single most-cited
        reason vloggers say they &quot;never got around to posting
        shorts.&quot;
      </p>

      <h2>Option 2 — Free tools with light automation</h2>
      <p>
        A middle path. Nothing generates clips for you, but the mechanics
        get easier.
      </p>
      <h3>CapCut (desktop or mobile)</h3>
      <p>
        Free. You still pick the moments yourself, but auto-captions work
        remarkably well, the vertical reframing tool is good, and there
        are one-click templates. Realistic time per clip: 5–10 minutes
        once you have the workflow down.
      </p>
      <h3>YouTube&apos;s Shorts editor</h3>
      <p>
        If your source is a YouTube video already, YouTube itself lets you
        clip up to 60 seconds directly into a Short. Free, no editor
        needed. Downside: no captions, no reframing (it&apos;ll just
        letterbox horizontal content), and the clip only appears on
        YouTube.
      </p>
      <h3>Descript</h3>
      <p>
        Free tier is generous. You edit video by editing a text transcript
        — remove a word, the video cuts around it. Great for cleaning up
        &quot;ums&quot; and long pauses. Manual work is still on you
        though.
      </p>

      <h2>Option 3 — AI clip generators</h2>
      <p>
        The category that grew rapidly in 2024–2026. Paste a YouTube URL,
        wait 5–15 minutes, get 5–15 vertical clips with captions and
        reframing done. Prices range from free tiers with watermarks to
        $30–100/month subscriptions.
      </p>
      <p>The workflow is essentially always:</p>
      <ol>
        <li>Download the source video</li>
        <li>
          Transcribe it (using something like Whisper) to get a time-coded
          transcript
        </li>
        <li>
          Feed that transcript to an LLM (usually GPT-4 or Claude) with a
          prompt asking it to pick the most clip-worthy segments
        </li>
        <li>
          Cut and reframe each pick using ffmpeg, adding burned-in
          captions
        </li>
      </ol>
      <p>
        Quality varies. The picking model is the differentiator: some tools
        pick great moments, others pick random 30-second chunks. Captions
        can be a mess for accented speech or non-English content.
      </p>
      <h3>What to look for</h3>
      <ul>
        <li>
          <strong>Multi-language support.</strong> If you vlog in anything
          other than American English, most tools fall over.
        </li>
        <li>
          <strong>No watermark.</strong> Free tiers usually add one.
          It&apos;s ugly and it tells your audience the clip wasn&apos;t
          made by you.
        </li>
        <li>
          <strong>Pay-per-video pricing over subscription.</strong> Unless
          you&apos;re posting daily, credit packs are much cheaper than
          $30/month subscriptions you use twice.
        </li>
        <li>
          <strong>1080p output.</strong> Shorts get compressed hard by
          every platform; starting at 720p means arriving at 480p on the
          viewer&apos;s phone.
        </li>
      </ul>

      <h2>Which should you use?</h2>
      <table className="w-full border rounded-md overflow-hidden text-sm mt-4">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="p-2">If you...</th>
            <th className="p-2">Use this</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          <tr>
            <td className="p-2">Post 1 short a week, love editing</td>
            <td className="p-2">Manual (Premiere / Final Cut)</td>
          </tr>
          <tr>
            <td className="p-2">
              Post 2–3 shorts a week, don&apos;t mind spending 30 min
            </td>
            <td className="p-2">CapCut</td>
          </tr>
          <tr>
            <td className="p-2">
              Post daily / want 10+ clips from every long video
            </td>
            <td className="p-2">AI clip generator</td>
          </tr>
          <tr>
            <td className="p-2">Vlog in Hindi, Spanish, or non-English</td>
            <td className="p-2">
              AI generator with multi-language transcription
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Where Nomads Shorts fits</h2>
      <p>
        We built{" "}
        <Link href="/">Nomads Shorts</Link> because we were the target
        audience for option 3 and couldn&apos;t find a tool that actually
        worked for travel content — most existing tools are English-only,
        watermark aggressively on the free tier, and charge $30+/month.
      </p>
      <p>Ours does:</p>
      <ul>
        <li>Paste a YouTube URL, get 5–10 clips</li>
        <li>English and Hindi transcription (with English caption output)</li>
        <li>1080×1920 output, no watermark</li>
        <li>Credits from $9 that never expire — no monthly subscription</li>
        <li>Sensible moment-picking (Claude Haiku reads the transcript)</li>
      </ul>
      <p>
        You get{" "}
        <Link href="/sign-in">15 free credits on sign-up</Link>, enough to
        try it on a 15-minute vlog and see if the picks are good enough for
        your channel. If they are, great. If not, you know what
        doesn&apos;t work for your specific content and can pick
        differently.
      </p>

      <h2>The honest bottom line</h2>
      <p>
        AI clip tools got a lot better in 2024–2026 but they&apos;re not
        magic. For a well-shot, single-speaker vlog with clear story
        structure, they&apos;ll pick genuinely good clips 70–80% of the
        time. For chaotic vlogs with multiple speakers, ambient audio, or
        heavy narration overlay, results are more mixed.
      </p>
      <p>
        The right way to think about it: an AI generator gives you a first
        draft in 10 minutes instead of 3 hours. You still get to reject the
        picks you don&apos;t like. That trade — accepting some imperfect
        picks in exchange for actually posting shorts — is the reason
        people who use these tools consistently post 3–5x more short-form
        content than people who don&apos;t.
      </p>
      <p>
        Whichever route you go, the meta-lesson is: the vloggers winning on
        shorts are the ones who post them regularly. Any workflow that
        gets you to weekly-or-better posting will move you further than the
        &quot;perfect&quot; workflow you never use.
      </p>

      <h3>Related reading</h3>
      <ul>
        <li>
          <Link href="/blog/youtube-shorts-from-travel-vlogs">
            The travel vlogger&apos;s guide to YouTube Shorts
          </Link>
        </li>
        <li>
          <Link href="/blog/convert-horizontal-to-vertical-video">
            How to convert horizontal video to vertical for Reels, Shorts,
            and TikTok
          </Link>
        </li>
      </ul>
    </Article>
  );
}
