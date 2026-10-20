import { useEffect, useRef, useState } from "react";

import { useQueries } from "@tanstack/react-query";

import type { PostView } from "@/types/application/feed/post-view";

import { mediaApi } from "@/lib/api";
import { resolveCdnUrl } from "@/lib/api/media";
import { useInView } from "@/lib/feed/use-in-view";

/** Grade de mídias do post (vídeo único ou imagens) com visualização em tela cheia.
 *
 * `compact` encolhe as imagens para caber em espacos apertados (comentarios) sem quebrar
 * a largura em telas pequenas.
 */
export function MediaGrid({
  mediaIds,
  compact = false,
}: Pick<PostView, "mediaIds"> & { compact?: boolean }) {
  const queryResults = useQueries({
    queries: mediaIds.map((id) => ({
      queryKey: ["media", id],
      queryFn: () => mediaApi.get(id),
      staleTime: 60_000,
    })),
  });

  const items = queryResults.filter((q) => q.data?.cdnUrl).map((q) => q.data!);
  const [fullscreenUrl, setFullscreenUrl] = useState<string | null>(null);

  // Vídeo enviado no post: toca sozinho quando a publicação está à vista e pausa quando sai —
  // "play automático" sem deixar vários vídeos rodando ao mesmo tempo pelo feed.
  const { ref: videoRef, inView } = useInView<HTMLDivElement>(0.6);
  const videoElement = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = videoElement.current;
    if (!element) return;
    if (inView) {
      void element.play().catch(() => {
        // Autoplay bloqueado (aba em segundo plano, economia de energia, política do navegador):
        // o vídeo fica parado com os controles à vista, que é o comportamento seguro.
      });
    } else {
      element.pause();
    }
  }, [inView]);

  if (items.length === 0) return null;

  const isVideo = items.some((m) => m.mimeType.startsWith("video/"));

  // Áudio (gravado no comentário): player com controles, sem autoplay — som que começa sozinho no
  // meio de uma conversa é o oposto do que esta rede quer.
  if (items.some((m) => m.mimeType.startsWith("audio/"))) {
    return (
      <div className="rounded-xl border border-border-soft bg-surface-1 p-2">
        <audio
          src={resolveCdnUrl(items[0].cdnUrl)}
          controls
          preload="metadata"
          className="w-full"
        />
      </div>
    );
  }

  if (isVideo) {
    return (
      <div ref={videoRef} className="overflow-hidden rounded-xl border border-border-soft">
        <video
          ref={videoElement}
          src={resolveCdnUrl(items[0].cdnUrl)}
          // `muted` + `playsInline` são o que fazem o play automático ser aceito no navegador (e no
          // iOS, sem virar tela cheia): o som vem quando a pessoa quiser, pelo controle do vídeo.
          muted
          playsInline
          preload="metadata"
          controls
          className="max-h-96 w-full bg-surface-1"
        />
      </div>
    );
  }

  return (
    <>
      <div className={`grid gap-2 ${items.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
        {items.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setFullscreenUrl(resolveCdnUrl(m.cdnUrl) ?? null)}
            className="overflow-hidden rounded-xl border border-border-soft text-left"
          >
            <img
              src={resolveCdnUrl(m.cdnUrl)}
              alt=""
              loading="lazy"
              className={`w-full bg-surface-1 transition hover:scale-105 ${
                compact
                  ? "h-28 sm:h-36 object-cover"
                  : items.length === 1
                    ? "max-h-[32rem] object-contain"
                    : "h-48 object-cover"
              }`}
            />
          </button>
        ))}
      </div>
      {fullscreenUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setFullscreenUrl(null)}
        >
          <img
            src={fullscreenUrl}
            alt=""
            className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
