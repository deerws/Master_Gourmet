import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface ProcessedVideo {
  videoPath: string;
  audioPath: string;
  thumbnailPath: string;
  duration: number;
}

export class VideoProcessor {
  private uploadsDir: string;
  
  constructor() {
    this.uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async downloadInstagramVideo(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const videoId = crypto.randomUUID();
      const outputPath = path.join(this.uploadsDir, `${videoId}.%(ext)s`);
      
      const ytdlp = spawn("yt-dlp", [
        "--output", outputPath,
        "--format", "best[height<=720]",
        "--no-playlist",
        url
      ]);

      let finalPath = "";
      
      ytdlp.stdout.on("data", (data) => {
        const output = data.toString();
        // Parse the actual output filename
        const match = output.match(/\[download\] (.+?) has already been downloaded/);
        if (match) {
          finalPath = match[1];
        }
      });

      ytdlp.stderr.on("data", (data) => {
        console.error(`yt-dlp stderr: ${data}`);
      });

      ytdlp.on("close", (code) => {
        if (code === 0) {
          // Find the downloaded file
          const files = fs.readdirSync(this.uploadsDir).filter(f => f.startsWith(videoId));
          if (files.length > 0) {
            resolve(path.join(this.uploadsDir, files[0]));
          } else {
            reject(new Error("Downloaded file not found"));
          }
        } else {
          reject(new Error("Instagram requer login para baixar vídeos. Use o upload manual: baixe o vídeo pelo Instagram e faça upload aqui."));
        }
      });
    });
  }

  async processVideo(inputPath: string): Promise<ProcessedVideo> {
    const videoId = crypto.randomUUID();
    const videoPath = path.join(this.uploadsDir, `${videoId}.mp4`);
    const audioPath = path.join(this.uploadsDir, `${videoId}.wav`);
    const thumbnailPath = path.join(this.uploadsDir, `${videoId}.jpg`);

    // Copy/convert video to standard format
    await this.runFFmpeg([
      "-i", inputPath,
      "-c:v", "libx264",
      "-c:a", "aac",
      "-movflags", "+faststart",
      "-y", videoPath
    ]);

    // Extract audio for transcription
    await this.runFFmpeg([
      "-i", videoPath,
      "-vn",
      "-acodec", "pcm_s16le",
      "-ar", "16000",
      "-ac", "1",
      "-y", audioPath
    ]);

    // Generate thumbnail
    await this.runFFmpeg([
      "-i", videoPath,
      "-ss", "00:00:02",
      "-vframes", "1",
      "-q:v", "2",
      "-y", thumbnailPath
    ]);

    // Get video duration
    const duration = await this.getVideoDuration(videoPath);

    return {
      videoPath,
      audioPath,
      thumbnailPath,
      duration
    };
  }

  private async runFFmpeg(args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn("ffmpeg", args);

      ffmpeg.stderr.on("data", (data) => {
        console.log(`FFmpeg: ${data}`);
      });

      ffmpeg.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg failed with code ${code}`));
        }
      });
    });
  }

  private async getVideoDuration(videoPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const ffprobe = spawn("ffprobe", [
        "-v", "quiet",
        "-show_entries", "format=duration",
        "-of", "csv=p=0",
        videoPath
      ]);

      let output = "";
      ffprobe.stdout.on("data", (data) => {
        output += data.toString();
      });

      ffprobe.on("close", (code) => {
        if (code === 0) {
          const duration = parseFloat(output.trim());
          resolve(duration);
        } else {
          reject(new Error("Failed to get video duration"));
        }
      });
    });
  }

  async extractVideoFrame(videoPath: string): Promise<string> {
    const frameId = crypto.randomUUID();
    const framePath = path.join(this.uploadsDir, `${frameId}_frame.jpg`);

    await this.runFFmpeg([
      "-i", videoPath,
      "-ss", "00:00:05",
      "-vframes", "1",
      "-q:v", "2",
      "-y", framePath
    ]);

    // Convert to base64
    const frameBuffer = fs.readFileSync(framePath);
    const base64Frame = frameBuffer.toString('base64');
    
    // Clean up temporary frame file
    fs.unlinkSync(framePath);
    
    return base64Frame;
  }
}

export const videoProcessor = new VideoProcessor();
