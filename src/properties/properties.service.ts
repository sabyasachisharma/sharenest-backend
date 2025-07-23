import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common'
import { Op } from 'sequelize'
import { ConfigService } from '@nestjs/config'
import { Property } from './entities/property.entity'
import { PropertyImage } from './entities/property-image.entity'
import { Favorite } from './entities/favorite.entity'
import { User } from '../users/entities/user.entity'
import { CreatePropertyDto } from './dto/create-property.dto'
import { UpdatePropertyDto } from './dto/update-property.dto'
import { PropertySearchDto } from './dto/property-search.dto'
import { InjectModel } from '@nestjs/sequelize'
import { CloudinaryService } from '../common/services/cloudinary.service'

@Injectable()
export class PropertiesService {
  constructor(
    @InjectModel(Property)
    private readonly propertyModel: typeof Property,
    @InjectModel(PropertyImage)
    private readonly propertyImageModel: typeof PropertyImage,
    @InjectModel(Favorite)
    private readonly favoriteModel: typeof Favorite,
    private readonly configService: ConfigService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}


  async create(createPropertyDto: CreatePropertyDto, ownerId: string, files?: Express.Multer.File[]): Promise<Property> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const availableFromDate = new Date(createPropertyDto.availableFrom)
    availableFromDate.setHours(0, 0, 0, 0)
    
    if (availableFromDate < today) {
      throw new BadRequestException('Available from date must be today or a future date')
    }
    
    if (createPropertyDto.availableTo) {
      const availableToDate = new Date(createPropertyDto.availableTo)
      availableToDate.setHours(0, 0, 0, 0)
      
      if (availableToDate <= availableFromDate) {
        throw new BadRequestException('Available to date must be after the available from date')
      }
    }

    // Check for duplicate properties based on postcode, street, and house number
    if (createPropertyDto.postcode && createPropertyDto.street && createPropertyDto.houseNumber) {
      const existingProperty = await this.propertyModel.findOne({
        where: {
          postcode: createPropertyDto.postcode,
          street: createPropertyDto.street,
          houseNumber: createPropertyDto.houseNumber,
          isActive: true, // Only check active properties
        },
      })

      if (existingProperty) {
        throw new BadRequestException(
          `A property already exists at ${createPropertyDto.houseNumber} ${createPropertyDto.street}, postcode ${createPropertyDto.postcode}`
        )
      }
    }

    const property = await this.propertyModel.create({
      ...createPropertyDto,
      ownerId,
    })

    if (files && files.length > 0) {
      const uploadedImages = await this.uploadPropertyImages(property.id, files)
      
      if (uploadedImages.length > 0) {
        await property.update({
          imageUrl: uploadedImages[0].imageUrl
        })
      }
    }

    return property
  }

  async findAll(): Promise<Property[]> {
    return this.propertyModel.findAll({
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
    })
  }

  async findOne(id: string): Promise<Property> {
    const property = await this.propertyModel.findByPk(id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'firstName', 'lastName', 'email', 'profileImage'],
        },
      ],
    })

    if (!property) {
      throw new NotFoundException('Property not found')
    }

    return property
  }

  async update(id: string, updatePropertyDto: UpdatePropertyDto): Promise<Property> {
    const property = await this.findOne(id)
    await property.update(updatePropertyDto)
    return this.findOne(id)
  }

  async remove(id: string): Promise<void> {
    const property = await this.findOne(id)
    await property.destroy()
  }

  async search(searchDto: PropertySearchDto): Promise<{ count: number; rows: Property[] }> {
    const {
      query,
      category,
      city,
      postcode,
      minPrice,
      maxPrice,
      minBedrooms,
      minBathrooms,
      availableFrom,
      availableTo,
      page = 1,
      limit = 10,
    } = searchDto

    const offset = (page - 1) * limit
    
    const whereClause: any = {
      isActive: true,
    }
    
    if (query) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${query}%` } },
        { description: { [Op.iLike]: `%${query}%` } },
      ]
    }
    
    if (category) {
      whereClause.category = category
    }
    
    if (city) {
      whereClause.city = { [Op.iLike]: `%${city}%` }
    }
    
    if (postcode) {
      whereClause.postcode = { [Op.iLike]: `%${postcode}%` }
    }
    
    if (minPrice) {
      whereClause.price = { ...whereClause.price, [Op.gte]: minPrice }
    }
    
    if (maxPrice) {
      whereClause.price = { ...whereClause.price, [Op.lte]: maxPrice }
    }
    
    if (minBedrooms) {
      whereClause.bedrooms = { [Op.gte]: minBedrooms }
    }
    
    if (minBathrooms) {
      whereClause.bathrooms = { [Op.gte]: minBathrooms }
    }
    
    if (availableFrom) {
      whereClause.availableFrom = { [Op.lte]: new Date(availableFrom) }
    }
    
    if (availableTo) {
      whereClause.availableTo = {
        [Op.or]: [
          { [Op.gte]: new Date(availableTo) },
          { [Op.eq]: null },
        ],
      }
    }
    
    return this.propertyModel.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'firstName', 'lastName'],
        },
        {
          model: PropertyImage,
          as: 'images',
          order: [['sortOrder', 'ASC']],
        },
      ],
      limit,
      offset,
      distinct: true,
      order: [['createdAt', 'DESC']],
    })
  }

  async getFeatured(): Promise<Property[]> {
    return this.propertyModel.findAll({
      where: { isActive: true },
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'firstName', 'lastName'],
        },
        {
          model: PropertyImage,
          as: 'images',
          order: [['sortOrder', 'ASC']],
        },
      ],
      limit: 6,
      order: [['createdAt', 'DESC']],
    })
  }

  async getAllActiveProperties(searchDto: PropertySearchDto): Promise<{ count: number; rows: Property[] }> {
    // This is similar to search but optimized for grid view
    return this.search(searchDto)
  }

  async getCategories(): Promise<{ category: string; count: number }[]> {
    const categories = await this.propertyModel.findAll({
      where: { isActive: true },
      attributes: [
        'category',
        [this.propertyModel.sequelize.fn('COUNT', this.propertyModel.sequelize.col('id')), 'count']
      ],
      group: ['category'],
      raw: true,
    })
    
    return categories.map((cat: any) => ({
      category: cat.category,
      count: parseInt(cat.count)
    }))
  }

  async getCities(): Promise<{ city: string; count: number }[]> {
    const cities = await this.propertyModel.findAll({
      where: { 
        isActive: true,
        city: { [Op.ne]: null }
      },
      attributes: [
        'city',
        [this.propertyModel.sequelize.fn('COUNT', this.propertyModel.sequelize.col('id')), 'count']
      ],
      group: ['city'],
      raw: true,
    })
    
    return cities.map((city: any) => ({
      city: city.city,
      count: parseInt(city.count)
    }))
  }

  async getPriceRange(): Promise<{ min: number; max: number; avg: number }> {
    const result = await this.propertyModel.findOne({
      where: { isActive: true },
      attributes: [
        [this.propertyModel.sequelize.fn('MIN', this.propertyModel.sequelize.col('price')), 'min'],
        [this.propertyModel.sequelize.fn('MAX', this.propertyModel.sequelize.col('price')), 'max'],
        [this.propertyModel.sequelize.fn('AVG', this.propertyModel.sequelize.col('price')), 'avg']
      ],
      raw: true,
    }) as any
    
    return {
      min: result?.min || 0,
      max: result?.max || 0,
      avg: Math.round(result?.avg || 0)
    }
  }

  async getLandlordProperties(landlordId: string): Promise<Property[]> {
    return this.propertyModel.findAll({
      where: { ownerId: landlordId },
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: PropertyImage,
          as: 'images',
          order: [['sortOrder', 'ASC']],
        },
      ],
      order: [['createdAt', 'DESC']],
    })
  }

  async toggleFavorite(userId: string, propertyId: string, isFavorite: boolean): Promise<void> {
    if (isFavorite) {
      // Add to favorites
      await this.favoriteModel.findOrCreate({
        where: { userId, propertyId },
        defaults: { userId, propertyId },
      })
    } else {
      // Remove from favorites
      await this.favoriteModel.destroy({
        where: { userId, propertyId },
      })
    }
  }

  async getUserFavorites(userId: string): Promise<Property[]> {
    const favorites = await this.favoriteModel.findAll({
      where: { userId },
      include: [
        {
          model: Property,
          include: [
            {
              model: User,
              as: 'owner',
              attributes: ['id', 'firstName', 'lastName'],
            },
            {
              model: PropertyImage,
              as: 'images',
              order: [['sortOrder', 'ASC']],
            },
          ],
        },
      ],
    })

    return favorites.map(favorite => favorite.property)
  }

  async uploadPropertyImages(propertyId: string, files: Express.Multer.File[]): Promise<PropertyImage[]> {
    const property = await this.findOne(propertyId)
    if (!property) {
      throw new NotFoundException('Property not found')
    }

    const currentImageCount = await this.propertyImageModel.count({
      where: { propertyId }
    })

    if (currentImageCount + files.length > 3) {
      throw new BadRequestException(`Cannot upload ${files.length} images. Property already has ${currentImageCount} images. Maximum 3 images allowed.`)
    }

    const uploadedImages: PropertyImage[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      const imageUrl = await this.cloudinaryService.uploadImage(file, 'properties')      
      const cloudinaryPublicId = this.cloudinaryService.getPublicIdFromUrl(imageUrl)
      const propertyImage = await this.propertyImageModel.create({
        propertyId,
        imageUrl,
        cloudinaryPublicId,
        sortOrder: currentImageCount + i,
      })

      uploadedImages.push(propertyImage)
    }

    return uploadedImages
  }

  async getPropertyImages(propertyId: string): Promise<PropertyImage[]> {
    return this.propertyImageModel.findAll({
      where: { propertyId },
      order: [['sortOrder', 'ASC']],
    })
  }

  async deletePropertyImage(imageId: string, propertyId: string): Promise<void> {
    const image = await this.propertyImageModel.findOne({
      where: { id: imageId, propertyId }
    })

    if (!image) {
      throw new NotFoundException('Property image not found')
    }

    // Delete from Cloudinary if public ID exists
    if (image.cloudinaryPublicId) {
      try {
        await this.cloudinaryService.deleteImage(image.cloudinaryPublicId)
      } catch (error) {
        console.error('Failed to delete image from Cloudinary:', error)
      }
    }

    // Delete from database
    await image.destroy()
  }

  async reorderPropertyImages(propertyId: string, imageIds: string[]): Promise<void> {
    // Validate that all images belong to the property
    const images = await this.propertyImageModel.findAll({
      where: { propertyId }
    })

    if (images.length !== imageIds.length) {
      throw new BadRequestException('Invalid image count for reordering')
    }

    // Update sort order for each image
    for (let i = 0; i < imageIds.length; i++) {
      await this.propertyImageModel.update(
        { sortOrder: i },
        { where: { id: imageIds[i], propertyId } }
      )
    }
  }

  async findOneWithImages(id: string): Promise<Property> {
    const property = await this.propertyModel.findByPk(id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'firstName', 'lastName', 'email', 'profileImage'],
        },
        {
          model: PropertyImage,
          as: 'images',
          order: [['sortOrder', 'ASC']],
        },
      ],
    })

    if (!property) {
      throw new NotFoundException('Property not found')
    }

    return property
  }
}