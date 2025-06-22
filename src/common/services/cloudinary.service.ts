import { Injectable, BadRequestException } from '@nestjs/common'
import { v2 as cloudinary } from 'cloudinary'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class CloudinaryService {
  private readonly allowedImageTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png'
  ]

  constructor(private configService: ConfigService) {
    // Check if CLOUDINARY_URL is available first, then fall back to individual config
    const cloudinaryUrl = this.configService.get('CLOUDINARY_URL')
    
    if (cloudinaryUrl) {
      // Use CLOUDINARY_URL if available (recommended approach)
      cloudinary.config(cloudinaryUrl)
    } else {
      // Fall back to individual environment variables
      cloudinary.config({
        cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
        api_key: this.configService.get('CLOUDINARY_API_KEY'),
        api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
      })
    }
  }

  private validateImageFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided')
    }

    if (!file.mimetype) {
      throw new BadRequestException('File type not detected')
    }

    if (!this.allowedImageTypes.includes(file.mimetype.toLowerCase())) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${this.allowedImageTypes.join(', ')}`
      )
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size too large. Maximum size is 10MB')
    }
  }

  async uploadImage(file: Express.Multer.File, folder: string = 'properties'): Promise<string> {
    try {
      // Validate file format
      this.validateImageFile(file)

      // Convert buffer to base64 string for upload
      const base64Image = file.buffer.toString('base64')
      const dataURI = `data:${file.mimetype};base64,${base64Image}`
      
      const result = await cloudinary.uploader.upload(dataURI, {
        folder,
        resource_type: 'image', // Explicitly set to image
        transformation: [
          { width: 800, height: 600, crop: 'fill' },
          { quality: 'auto' }
        ]
      })
      
      return result.secure_url
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      console.error('Cloudinary upload error:', error)
      throw new Error(`Failed to upload image: ${error.message}`)
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId)
    } catch (error) {
      console.error('Cloudinary delete error:', error)
      throw new Error(`Failed to delete image: ${error.message}`)
    }
  }

  getPublicIdFromUrl(url: string): string {
    try {
      // Extract public ID from Cloudinary URL
      // Example URL: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/image_name.jpg
      const urlParts = url.split('/')
      const uploadIndex = urlParts.findIndex(part => part === 'upload')
      
      if (uploadIndex === -1) {
        throw new Error('Invalid Cloudinary URL format')
      }
      
      // Get everything after 'upload' and before the version (if exists)
      const pathAfterUpload = urlParts.slice(uploadIndex + 1)
      const versionIndex = pathAfterUpload.findIndex(part => part.startsWith('v'))
      
      let publicIdParts
      if (versionIndex !== -1) {
        publicIdParts = pathAfterUpload.slice(versionIndex + 1)
      } else {
        publicIdParts = pathAfterUpload
      }
      
      // Remove file extension
      const publicId = publicIdParts.join('/')
      return publicId.replace(/\.[^/.]+$/, '') // Remove file extension
    } catch (error) {
      console.error('Error extracting public ID from URL:', error)
      throw new Error('Invalid Cloudinary URL format')
    }
  }

  // Helper method to get cloudinary config for debugging
  getConfig() {
    return {
      cloud_name: cloudinary.config().cloud_name,
      api_key: cloudinary.config().api_key,
      // Don't log api_secret for security
    }
  }

  // Helper method to get allowed image types
  getAllowedImageTypes(): string[] {
    return [...this.allowedImageTypes]
  }
} 