import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Photo {
    id: string;
    blob: ExternalBlob;
    capturedAt: bigint;
}
export interface backendInterface {
    deletePhoto(id: string): Promise<void>;
    getAllPhotos(): Promise<Array<Photo>>;
    savePhoto(id: string, blob: ExternalBlob, capturedAt: bigint): Promise<Photo>;
}
