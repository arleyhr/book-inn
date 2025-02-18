import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(imageUrl: string): Promise<string> {
    try {
      const result = await cloudinary.uploader.upload(imageUrl, {
        folder: 'hotels',
      });
      return result.secure_url;
    } catch (error) {
      this.logger.error(`Error uploading image to Cloudinary: ${error.message}`);
      throw error;
    }
  }

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      const publicId = this.getPublicIdFromUrl(imageUrl);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    } catch (error) {
      this.logger.error(`Error deleting image from Cloudinary: ${error.message}`);
      throw error;
    }
  }

  private getPublicIdFromUrl(imageUrl: string): string | null {
    const regex = /\/hotels\/([^/]+)\./;
    const match = imageUrl.match(regex);
    return match ? `hotels/${match[1]}` : null;
  }
}
