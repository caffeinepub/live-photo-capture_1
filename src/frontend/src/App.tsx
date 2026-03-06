import { Toaster } from "@/components/ui/sonner";
import { Camera, Images } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import CameraView from "./components/CameraView";
import GalleryView from "./components/GalleryView";

type Tab = "camera" | "gallery";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("camera");

  return (
    <div className="flex flex-col w-full h-dvh bg-background overflow-hidden">
      {/* Header */}
      <header
        className="shrink-0 flex items-center justify-center px-4 pt-safe-top"
        style={{ paddingTop: "max(env(safe-area-inset-top), 12px)" }}
      >
        <div className="flex items-center gap-2 py-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              background: "oklch(0.75 0.15 65 / 0.15)",
              border: "1px solid oklch(0.75 0.15 65 / 0.3)",
            }}
          >
            <Camera
              className="w-3.5 h-3.5"
              style={{ color: "oklch(0.75 0.15 65)" }}
            />
          </div>
          <h1
            className="font-display font-bold text-base tracking-tight"
            style={{ color: "oklch(0.94 0.01 90)" }}
          >
            SnapChron
          </h1>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {activeTab === "camera" ? (
            <motion.div
              key="camera"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <CameraView />
            </motion.div>
          ) : (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0"
            >
              <GalleryView />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav
        className="nav-glass shrink-0 flex items-center justify-around px-4"
        style={{
          paddingBottom: "max(env(safe-area-inset-bottom), 8px)",
          height: "calc(64px + max(env(safe-area-inset-bottom), 8px))",
        }}
      >
        <button
          type="button"
          data-ocid="nav.camera.tab"
          onClick={() => setActiveTab("camera")}
          className="flex flex-col items-center gap-1 min-w-[72px] py-1.5 rounded-xl transition-colors"
          aria-label="Camera"
          aria-current={activeTab === "camera" ? "page" : undefined}
        >
          <motion.div
            animate={{
              color:
                activeTab === "camera"
                  ? "oklch(0.75 0.15 65)"
                  : "oklch(0.55 0.015 285)",
              scale: activeTab === "camera" ? 1.1 : 1,
            }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            <Camera className="w-5 h-5" />
            {activeTab === "camera" && (
              <motion.span
                layoutId="tab-indicator"
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                style={{ background: "oklch(0.75 0.15 65)" }}
              />
            )}
          </motion.div>
          <motion.span
            animate={{
              color:
                activeTab === "camera"
                  ? "oklch(0.75 0.15 65)"
                  : "oklch(0.55 0.015 285)",
            }}
            className="text-[10px] font-display font-semibold tracking-widest uppercase"
          >
            Camera
          </motion.span>
        </button>

        <button
          type="button"
          data-ocid="nav.gallery.tab"
          onClick={() => setActiveTab("gallery")}
          className="flex flex-col items-center gap-1 min-w-[72px] py-1.5 rounded-xl transition-colors"
          aria-label="Gallery"
          aria-current={activeTab === "gallery" ? "page" : undefined}
        >
          <motion.div
            animate={{
              color:
                activeTab === "gallery"
                  ? "oklch(0.75 0.15 65)"
                  : "oklch(0.55 0.015 285)",
              scale: activeTab === "gallery" ? 1.1 : 1,
            }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            <Images className="w-5 h-5" />
            {activeTab === "gallery" && (
              <motion.span
                layoutId="tab-indicator"
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                style={{ background: "oklch(0.75 0.15 65)" }}
              />
            )}
          </motion.div>
          <motion.span
            animate={{
              color:
                activeTab === "gallery"
                  ? "oklch(0.75 0.15 65)"
                  : "oklch(0.55 0.015 285)",
            }}
            className="text-[10px] font-display font-semibold tracking-widest uppercase"
          >
            Gallery
          </motion.span>
        </button>
      </nav>

      {/* Sonner Toast */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "oklch(0.18 0.008 285)",
            border: "1px solid oklch(0.28 0.01 285)",
            color: "oklch(0.94 0.01 90)",
            fontFamily: "Figtree, sans-serif",
          },
        }}
      />
    </div>
  );
}
