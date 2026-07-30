import styles from "./demo.module.css";
import { LogoMark } from "@/components/logo";

// Marketing demo. 9:16 canvas, 15-second loop. Screen-record this in
// QuickTime (Cmd+Shift+5 → Record Selected Portion) and post directly to
// Reels / Shorts / TikTok. No auth, no header, no footer — pure content.

export const metadata = {
  title: "See how Nomads Shorts works",
  robots: { index: false, follow: false }, // marketing-only, don't index
};

export default function DemoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950">
      <div className={styles.stage}>
        <div className={styles.brand}>
          <LogoMark className="size-5" />
          <span>Nomads Shorts</span>
        </div>

        {/* Scene 1 — paste a URL */}
        <div className={`${styles.scene} ${styles.s1}`}>
          <div style={{ marginTop: 100 }}>
            <div className={styles.pasteLabel}>Step 1 · Paste YouTube URL</div>
            <div className={styles.urlBar}>
              <span className={styles.typing}>youtu.be/travel-porto</span>
            </div>
          </div>
          <div className={styles.tagline}>
            One long vlog
            <br />→ ten viral shorts
          </div>
          <p className={styles.sub}>Built for travel creators</p>
        </div>

        {/* Scene 2 — pipeline steps ticking off */}
        <div className={`${styles.scene} ${styles.s2}`}>
          <div className={styles.steps}>
            <div className={`${styles.pasteLabel}`}>Step 2 · AI does the work</div>
            <div className={`${styles.step} ${styles.step1} ${styles.done}`}>
              <div className={styles.stepDot}>✓</div>
              <span>Download source</span>
            </div>
            <div className={`${styles.step} ${styles.step2} ${styles.done}`}>
              <div className={styles.stepDot}>✓</div>
              <span>Transcribe with Whisper</span>
            </div>
            <div className={`${styles.step} ${styles.step3} ${styles.done}`}>
              <div className={styles.stepDot}>✓</div>
              <span>Pick best moments (Claude)</span>
            </div>
            <div className={`${styles.step} ${styles.step4} ${styles.done}`}>
              <div className={styles.stepDot}>✓</div>
              <span>Render vertical clips</span>
            </div>
          </div>
          <div className={styles.tagline}>Under 5 min</div>
          <p className={styles.sub}>For a 20-minute vlog</p>
        </div>

        {/* Scene 3 — clips appear */}
        <div className={`${styles.scene} ${styles.s3}`}>
          <div className={styles.pasteLabel} style={{ marginTop: 60 }}>
            Step 3 · Your shorts, ready
          </div>
          <div className={styles.grid}>
            <div className={styles.clipCard} data-title="Sunset hack" />
            <div className={styles.clipCard} data-title="Ate the WHOLE thing" />
            <div className={styles.clipCard} data-title="Never trust GPS" />
            <div className={styles.clipCard} data-title="Best view in Porto" />
          </div>
          <div className={styles.tagline}>5–10 clips per video</div>
          <p className={styles.sub}>Captioned. Vertical. No watermark.</p>
        </div>

        {/* Scene 4 — a single clip playing */}
        <div className={`${styles.scene} ${styles.s4}`}>
          <div className={styles.pasteLabel} style={{ marginTop: 40 }}>
            Post to Reels · Shorts · TikTok
          </div>
          <div className={styles.playing} />
          <div className={styles.tagline}>1080×1920 · MP4</div>
          <p className={styles.sub}>Download and post. Done.</p>
        </div>

        {/* Scene 5 — CTA */}
        <div className={`${styles.scene} ${styles.s5}`}>
          <div className={styles.cta}>
            <div className={styles.ctaKicker}>Try it free</div>
            <div className={styles.ctaHead}>
              Stop editing.
              <br />
              Start posting.
            </div>
            <div className={styles.ctaUrl}>nomadsshorts.com</div>
            <div className={styles.ctaFree}>15 free credits on sign-up</div>
          </div>
        </div>
      </div>
    </div>
  );
}
