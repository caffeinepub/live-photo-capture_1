# Live Photo Capture App

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Camera view that shows a live feed from the device camera
- Capture button to take a photo
- Timestamp overlay on captured photos (date and time at moment of capture)
- Photo gallery that displays all captured photos with their timestamps
- Backend storage for captured photos (as blobs) with associated timestamp metadata
- Delete individual photos from the gallery

### Modify
N/A

### Remove
N/A

## Implementation Plan

### Backend
- Store photos as blobs with metadata: id, imageData (blob), capturedAt (timestamp as Int)
- APIs: capturePhoto(imageData: Blob, capturedAt: Int) -> PhotoId, getPhotos() -> [Photo], deletePhoto(id: PhotoId) -> Bool

### Frontend
- Camera page: access device camera via WebRTC getUserMedia, show live video feed
- Timestamp display: show current date/time live on the camera preview
- Capture button: snapshot from video stream, overlay timestamp on canvas, send blob + timestamp to backend
- Gallery view: grid of saved photos each showing the image and the captured date/time
- Delete button per photo
- Navigation between Camera and Gallery views
