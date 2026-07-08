import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService {
  private client: S3Client;
  private bucket: string;

  constructor(private config: ConfigService) {
    this.client = new S3Client({
      region: 'auto',
      endpoint: this.config.getOrThrow('R2_ENDPOINT'),
      credentials: {
        accessKeyId: this.config.getOrThrow('R2_ACCESS_KEY_ID'),
        secretAccessKey: this.config.getOrThrow('R2_SECRET_ACCESS_KEY'),
      },
    });
    this.bucket = this.config.getOrThrow('R2_BUCKET_NAME');
  }

  // Upload a video buffer to R2
  async uploadVideo(
    path: string,
    buffer: Buffer,
    contentType = 'video/mp4',
  ): Promise<string> {
    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: path,
          Body: buffer,
          ContentType: contentType,
        }),
      );
      return path; // return the stable storage path
    } catch (err: any) {
      throw new InternalServerErrorException(`Upload failed: ${err.message}`);
    }
  }

  // Generate a signed URL for temporary video playback
  // Default: 1 hour expiry
  async getSignedUrl(path: string, expiresIn = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: path,
      });
      return getSignedUrl(this.client, command, { expiresIn });
    } catch (err: any) {
      throw new InternalServerErrorException(`Signing failed: ${err.message}`);
    }
  }

  // Delete a video from R2
  async deleteVideo(path: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: path,
        }),
      );
    } catch (err: any) {
      throw new InternalServerErrorException(`Delete failed: ${err.message}`);
    }
  }

  // Check if a file exists in R2
  async exists(path: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: path,
        }),
      );
      return true;
    } catch (err: any) {
      return false;
    }
  }
}
