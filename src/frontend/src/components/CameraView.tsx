import { AlertCircle, Camera, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useSavePhoto } from "../hooks/useQueries";

function useLiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export default function CameraView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [permissionState, setPermissionState] = useState<
    "idle" | "requesting" | "granted" | "denied" | "error"
  >("idle");
  const [isFlashing, setIsFlashing] = useState(false);

  const now = useLiveClock();
  const savePhoto = useSavePhoto();

  const startCamera = useCallback(async () => {
    setPermissionState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setPermissionState("granted");
    } catch (err: unknown) {
      if (
        err instanceof DOMException &&
        (err.name === "NotAllowedError" || err.name === "PermissionDeniedError")
      ) {
        setPermissionState("denied");
      } else {
        setPermissionState("error");
      }
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        for (const t of streamRef.current.getTracks()) t.stop();
      }
    };
  }, [startCamera]);

  const handleCapture = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    if (savePhoto.isPending) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Draw timestamp watermark onto the photo
    const capturedAt = BigInt(Date.now()) * 1_000_000n;
    const dateStr = formatDate(new Date());
    const timeStr = formatTime(new Date());
    const label = `${dateStr}  ${timeStr}`;

    const padding = Math.round(canvas.width * 0.015);
    const fontSize = Math.round(canvas.width * 0.022);
    ctx.font = `${fontSize}px "Geist Mono", monospace`;
    ctx.textBaseline = "bottom";
    const textW = ctx.measureText(label).width;
    const boxX = canvas.width - textW - padding * 2.4;
    const boxY = canvas.height - fontSize - padding * 1.8;
    ctx.fillStyle = "rgba(10,10,20,0.65)";
    ctx.beginPath();
    ctx.roundRect(
      boxX - padding * 0.6,
      boxY - padding * 0.4,
      textW + padding * 1.6,
      fontSize + padding,
      6,
    );
    ctx.fill();
    ctx.fillStyle = "rgba(240,200,110,0.95)";
    ctx.fillText(label, boxX, boxY + fontSize);

    // Trigger flash
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 400);

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          toast.error("Failed to capture image");
          return;
        }
        const arrayBuffer = await blob.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer) as Uint8Array<ArrayBuffer>;
        const id = crypto.randomUUID();

        try {
          await savePhoto.mutateAsync({ id, bytes, capturedAt });
          toast.success("Photo saved!", {
            description: `${dateStr} · ${timeStr}`,
            duration: 2500,
          });
        } catch {
          toast.error("Failed to save photo");
        }
      },
      "image/jpeg",
      0.92,
    );
  }, [savePhoto]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-background overflow-hidden">
      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Permission / Error States */}
      <AnimatePresence>
        {permissionState === "requesting" && (
          <motion.div
            key="requesting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-20 bg-background"
          >
            <Loader2 className="w-10 h-10 text-amber animate-spin" />
            <p className="font-display text-muted-foreground text-sm tracking-widest uppercase">
              Accessing Camera
            </p>
          </motion.div>
        )}

        {permissionState === "denied" && (
          <motion.div
            key="denied"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-5 z-20 bg-background p-8"
          >
            <div className="w-16 h-16 rounded-full bg-destructive/15 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="font-display font-semibold text-xl text-foreground">
                Camera Access Denied
              </h2>
              <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
                Please allow camera access in your browser settings, then
                refresh the page to use the camera.
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-display font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Refresh Page
            </button>
          </motion.div>
        )}

        {permissionState === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-5 z-20 bg-background p-8"
          >
            <div className="w-16 h-16 rounded-full bg-destructive/15 flex items-center justify-center">
              <Camera className="w-8 h-8 text-destructive" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="font-display font-semibold text-xl text-foreground">
                Camera Unavailable
              </h2>
              <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
                No camera was detected on this device, or another app is using
                it.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Feed */}
      {(permissionState === "granted" || permissionState === "requesting") && (
        <div className="relative w-full h-full camera-grain">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Capture Flash */}
          <AnimatePresence>
            {isFlashing && (
              <motion.div
                key="flash"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.85 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="absolute inset-0 bg-white pointer-events-none z-30"
              />
            )}
          </AnimatePresence>

          {/* Viewfinder corners */}
          <div className="viewfinder-corner viewfinder-tl" />
          <div className="viewfinder-corner viewfinder-tr" />
          <div className="viewfinder-corner viewfinder-bl" />
          <div className="viewfinder-corner viewfinder-br" />

          {/* Timestamp Overlay */}
          {permissionState === "granted" && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute top-5 left-1/2 -translate-x-1/2 timestamp-overlay rounded-xl px-4 py-2.5 z-20 text-center"
            >
              <p
                className="font-mono text-xs tracking-[0.18em] uppercase"
                style={{ color: "oklch(0.85 0.15 65)" }}
              >
                {formatDate(now)}
              </p>
              <p
                className="font-mono text-2xl font-semibold tracking-[0.12em] leading-tight mt-0.5"
                style={{ color: "oklch(0.95 0.01 90)" }}
              >
                {formatTime(now)}
              </p>
            </motion.div>
          )}

          {/* Saving indicator */}
          {savePhoto.isPending && (
            <div
              data-ocid="camera.loading_state"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 timestamp-overlay rounded-2xl px-6 py-4 z-40 flex items-center gap-3"
            >
              <Loader2
                className="w-5 h-5 animate-spin"
                style={{ color: "oklch(0.75 0.15 65)" }}
              />
              <span className="font-display text-sm text-foreground font-medium">
                Saving…
              </span>
            </div>
          )}

          {/* Success feedback (handled via toast) */}
          <div data-ocid="camera.success_state" className="hidden" />

          {/* Capture Button */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
            <motion.button
              type="button"
              data-ocid="camera.capture_button"
              onClick={handleCapture}
              disabled={savePhoto.isPending || permissionState !== "granted"}
              whileTap={{ scale: 0.9 }}
              className="relative disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Take photo"
            >
              {/* Outer ring */}
              <span
                className={`absolute inset-0 rounded-full border-2 border-white/70 ${!savePhoto.isPending ? "shutter-idle" : ""}`}
                style={{ margin: "-6px" }}
              />
              {/* Button body */}
              <span className="block w-16 h-16 rounded-full bg-white hover:bg-white/90 transition-colors shadow-2xl" />
              {/* Inner accent dot */}
              <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span
                  className="block w-14 h-14 rounded-full border-2"
                  style={{ borderColor: "oklch(0.75 0.15 65 / 0.3)" }}
                />
              </span>
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
