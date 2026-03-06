import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalBlob } from "../backend";
import { useActor } from "./useActor";

export function useGetAllPhotos() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["photos"],
    queryFn: async () => {
      if (!actor) return [];
      const photos = await actor.getAllPhotos();
      // Sort by newest first
      return [...photos].sort((a, b) => Number(b.capturedAt - a.capturedAt));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSavePhoto() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      bytes,
      capturedAt,
    }: {
      id: string;
      bytes: Uint8Array<ArrayBuffer>;
      capturedAt: bigint;
    }) => {
      if (!actor) throw new Error("No actor available");
      const externalBlob = ExternalBlob.fromBytes(bytes);
      return actor.savePhoto(id, externalBlob, capturedAt);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photos"] });
    },
  });
}

export function useDeletePhoto() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("No actor available");
      return actor.deletePhoto(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photos"] });
    },
  });
}
