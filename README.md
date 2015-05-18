# Tube.js

## Requirements

- `youtube-dl`
- `ffmpeg` (includes `ffprobe`)

## How to run

- `npm install`
- `node app.js`

## Video conversion

	ffmpeg -i input.mkv -c:v copy -c:a aac -strict experimental -movflags faststart output.mp4

	ffmpeg -i input.avi -c:v libx264 -c:a aac -strict experimental -movflags faststart output.mp4

(use `ffprobe`'s json output)
