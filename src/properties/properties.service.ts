import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common'
import { Op } from 'sequelize'
import { ConfigService } from '@nestjs/config'
import { Property, PropertyCategory } from './entities/property.entity'
import { Favorite } from './entities/favorite.entity'
import { User } from '../users/entities/user.entity'
import { CreatePropertyDto } from './dto/create-property.dto'
import { UpdatePropertyDto } from './dto/update-property.dto'
import { PropertySearchDto } from './dto/property-search.dto'
import { InjectModel } from '@nestjs/sequelize'

@Injectable()
export class PropertiesService {
  constructor(
    @InjectModel(Property)
    private readonly propertyModel: typeof Property,
    @InjectModel(Favorite)
    private readonly favoriteModel: typeof Favorite,
    private readonly configService: ConfigService,
  ) {}

  async create(createPropertyDto: CreatePropertyDto, ownerId: string): Promise<Property> {
    return this.propertyModel.create({
      ...createPropertyDto,
      ownerId,
    })
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

  async search(searchDto: PropertySearchDto): Promise<{ count: number rows: Property[] }> {
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
      ],
      limit: 6,
      order: [['createdAt', 'DESC']],
    })
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
          ],
        },
      ],
    })

    return favorites.map(favorite => favorite.property)
  }
}