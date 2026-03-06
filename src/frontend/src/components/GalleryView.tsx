import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { GalleryHorizontal, ImageOff, Loader2, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import type { Photo } from "../backend";
import { useDeletePhoto, useGetAllPhotos } from "../hooks/useQueries";

function formatCapturedAt(capturedAt: bigint) {
  const date = new Date(Number(capturedAt / 1_000_000n));
  return {
    date: date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }),
  };
}

function PhotoCard({
  photo,
  index,
}: {
  photo: Photo;
  index: number;
}) {
  const deletePhoto = useDeletePhoto();
  const { date, time } = formatCapturedAt(photo.capturedAt);
  const ocidIndex = index + 1;

  const handleDelete = async () => {
    try {
      await deletePhoto.mutateAsync(photo.id);
      toast.success("Photo deleted");
    } catch {
      toast.error("Failed to delete photo");
    }
  };

  return (
    <motion.div
      data-ocid={`gallery.item.${ocidIndex}`}
      initial={{ opacity: 0, scale: 0.92, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.88, y: -8 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.06, 0.4) }}
      className="photo-card relative rounded-xl overflow-hidden bg-card border border-border group"
    >
      {/* Photo */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={photo.blob.getDirectURL()}
          alt={`Captured on ${date} at ${time}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Caption */}
      <div className="px-3 py-2.5 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p
            className="font-mono text-xs font-semibold truncate"
            style={{ color: "oklch(0.75 0.15 65)" }}
          >
            {time}
          </p>
          <p className="font-body text-xs text-muted-foreground truncate mt-0.5">
            {date}
          </p>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              data-ocid={`gallery.delete_button.${ocidIndex}`}
              className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Delete photo"
              disabled={deletePhoto.isPending}
            >
              {deletePhoto.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-card border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display text-foreground">
                Delete this photo?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                Captured {date} at {time}. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                data-ocid="gallery.cancel_button"
                className="bg-secondary border-border text-foreground hover:bg-accent"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                data-ocid="gallery.confirm_button"
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.div>
  );
}

function GallerySkeleton() {
  return (
    <div
      data-ocid="gallery.loading_state"
      className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4"
    >
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="rounded-xl overflow-hidden bg-card border border-border"
        >
          <Skeleton className="aspect-[4/3] w-full bg-muted" />
          <div className="px-3 py-2.5 space-y-1.5">
            <Skeleton className="h-3 w-16 bg-muted" />
            <Skeleton className="h-2.5 w-24 bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function GalleryView() {
  const { data: photos, isLoading, isError, refetch } = useGetAllPhotos();

  if (isLoading) {
    return (
      <div className="w-full h-full overflow-y-auto">
        <GallerySkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div
        data-ocid="gallery.error_state"
        className="flex flex-col items-center justify-center h-full gap-4 p-8"
      >
        <div className="w-14 h-14 rounded-full bg-destructive/15 flex items-center justify-center">
          <ImageOff className="w-7 h-7 text-destructive" />
        </div>
        <div className="text-center space-y-1">
          <p className="font-display font-semibold text-foreground">
            Failed to load photos
          </p>
          <p className="text-muted-foreground text-sm">
            Check your connection and try again.
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="px-4 py-2 rounded-lg bg-secondary text-foreground text-sm font-medium hover:bg-accent transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <div
        data-ocid="gallery.empty_state"
        className="flex flex-col items-center justify-center h-full gap-5 p-8"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-24 h-24 rounded-2xl bg-muted flex items-center justify-center border border-border"
        >
          <GalleryHorizontal
            className="w-10 h-10"
            style={{ color: "oklch(0.75 0.15 65)" }}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-center space-y-2"
        >
          <h3 className="font-display font-semibold text-lg text-foreground">
            No photos yet
          </h3>
          <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
            Switch to the Camera tab to capture your first timestamped photo.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto">
      {/* Header count */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <p className="font-display text-sm text-muted-foreground">
          <span className="text-foreground font-semibold">{photos.length}</span>{" "}
          {photos.length === 1 ? "photo" : "photos"}
        </p>
        <p
          className="font-mono text-xs tracking-wider uppercase"
          style={{ color: "oklch(0.75 0.15 65 / 0.8)" }}
        >
          On-Chain
        </p>
      </div>

      <motion.div
        data-ocid="gallery.list"
        className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 pt-2"
        layout
      >
        <AnimatePresence mode="popLayout">
          {photos.map((photo, index) => (
            <PhotoCard key={photo.id} photo={photo} index={index} />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
