import React, { useEffect, useId, useRef, useState } from 'react';

interface ManimPlayerProps {
  src: string;
  title: string;
  subtitle: string;
  caption: React.ReactNode;
}

function formatTime(seconds: number) {
  const total = Math.floor(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

export function ManimPlayer({ src, title, subtitle, caption }: ManimPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const figureRef = useRef<HTMLElement>(null);
  const expandButton = useRef<HTMLButtonElement>(null);
  const captionId = useId();
  const [playing, setPlaying] = useState(false);
  const [nearby, setNearby] = useState(false);
  const [rate, setRate] = useState(1);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [error, setError] = useState(false);
  const [expandedHeight, setExpandedHeight] = useState<number | null>(null);
  const expanded = expandedHeight !== null;
  const url = /^https?:/.test(src) || src.startsWith(import.meta.env.BASE_URL)
    ? src
    : import.meta.env.BASE_URL + src.replace(/^\//, '');
  const poster = url.replace(/\.mp4$/, '.webp');

  useEffect(() => {
    const figure = figureRef.current;
    if (!figure) return;
    if (typeof IntersectionObserver === 'undefined') {
      setNearby(true);
      return;
    }
    const approach = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setNearby(true);
      approach.disconnect();
    }, { rootMargin: '400px' });
    const offscreen = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) videoRef.current?.pause();
    });
    approach.observe(figure);
    offscreen.observe(figure);
    return () => { approach.disconnect(); offscreen.disconnect(); };
  }, []);

  useEffect(() => {
    if (!expanded) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    expandButton.current?.focus({ preventScroll: true });
    return () => { document.body.style.overflow = previousOverflow; };
  }, [expanded]);

  function getVideo() {
    const video = videoRef.current;
    if (!video) return null;
    if (!video.getAttribute('src')) video.src = url;
    return video;
  }

  function play() {
    setNearby(true);
    const video = getVideo();
    if (!video) return;
    if (video.error) video.load();
    if (video.ended || video.currentTime >= video.duration) video.currentTime = 0;
    void video.play().catch(() => setPlaying(false));
  }

  function seek(time: number) {
    const video = getVideo();
    if (!video) return;
    video.pause();
    video.currentTime = Math.max(0, Math.min(video.duration || 0, time));
    setPosition(video.currentTime);
  }

  function restart() {
    const video = getVideo();
    if (!video) return;
    video.currentTime = 0;
    play();
  }

  function cycleSpeed() {
    const next = rate === 1 ? 0.5 : rate === 0.5 ? 1.5 : 1;
    setRate(next);
    if (videoRef.current) videoRef.current.playbackRate = next;
  }

  function handleFigureKey(event: React.KeyboardEvent<HTMLElement>) {
    if (!expanded) return;
    if (event.key === 'Escape') {
      event.stopPropagation();
      setExpandedHeight(null);
      expandButton.current?.focus({ preventScroll: true });
    } else if (event.key === 'Tab') {
      const controls = event.currentTarget.querySelectorAll<HTMLElement>('button:enabled, input:enabled');
      const first = controls[0];
      const last = controls[controls.length - 1];
      const boundary = event.shiftKey ? first : last;
      if (document.activeElement === boundary) {
        event.preventDefault();
        (event.shiftKey ? last : first)?.focus();
      }
    }
  }

  return <>
    {expanded && <div className="manim-placeholder" style={{ height: expandedHeight }} aria-hidden="true" />}
    <figure ref={figureRef} className={`figure-breakout manim-figure${expanded ? ' manim-expanded' : ''}`}
      role={expanded ? 'dialog' : undefined} aria-modal={expanded || undefined}
      aria-label={expanded ? title : undefined} onKeyDown={handleFigureKey}>
      <div className="figure-header">
        <div>
          <div className="figure-title">{title}</div>
          {subtitle && <div className="figure-subtitle">{subtitle}</div>}
        </div>
        <div className="figure-controls" aria-label={"Playback controls for " + title}>
          <button type="button" className="ctrl-btn" onClick={restart}>Restart</button>
          <button type="button" className="ctrl-btn" disabled={!duration} onClick={() => seek((videoRef.current?.currentTime ?? position) - 1)}>−1s</button>
          <button type="button" className="ctrl-btn active" onClick={() => {
            if (playing) videoRef.current?.pause();
            else play();
          }}>{playing ? 'Pause' : error ? 'Retry' : 'Play'}</button>
          <button type="button" className="ctrl-btn" disabled={!duration} onClick={() => seek((videoRef.current?.currentTime ?? position) + 1)}>+1s</button>
          <button type="button" className="ctrl-btn" aria-label={"Playback speed " + rate + " times"} onClick={cycleSpeed}>{rate}×</button>
          <button ref={expandButton} type="button" className="ctrl-btn manim-expand" onClick={() => {
            setNearby(true);
            setExpandedHeight(expanded ? null : (figureRef.current?.offsetHeight ?? 0));
          }}
            aria-label={expanded ? 'Close expanded animation' : 'Expand animation'}
            title={expanded ? 'Close expanded animation' : 'Expand animation'}>
            <svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d={expanded
                ? 'M3 7h4V3m10 4h-4V3M3 13h4v4m10-4h-4v4'
                : 'M7 3H3v4m10-4h4v4M7 17H3v-4m10 4h4v-4'} />
            </svg>
          </button>
        </div>
      </div>

      <div className="manim-stage">
        <video
          ref={videoRef}
          src={nearby ? url : undefined}
          poster={nearby ? poster : undefined}
          preload="metadata"
          muted
          playsInline
          aria-label={title}
          aria-describedby={captionId}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onError={() => { setError(true); setPlaying(false); }}
          onLoadedMetadata={(event) => {
            const total = event.currentTarget.duration;
            setDuration(Number.isFinite(total) ? total : 0);
            setError(false);
          }}
          onTimeUpdate={(event) => setPosition(event.currentTarget.currentTime)}
        />
      </div>
      {!!duration && (
        <div className="manim-timeline" data-note-ui>
          <input type="range" className="manim-scrubber" aria-label={"Seek through " + title}
            aria-valuetext={`${formatTime(position)} of ${formatTime(duration)}`}
            min={0} max={duration} step={0.05} value={position} onChange={(event) => seek(Number(event.target.value))}
          />
          <span className="manim-time" aria-hidden="true">{formatTime(position)} / {formatTime(duration)}</span>
        </div>
      )}
      {error && <p className="manim-error" role="status">The animation could not load. The explanation below describes what it shows.</p>}
      <figcaption className="figure-caption" id={captionId}>{caption}</figcaption>
    </figure>
  </>;
}
