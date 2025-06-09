import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Op } from 'sequelize';
import { ConfigService } from '@nestjs/config';
import { Property, PropertyCategory } from './entities/property.entity';
import { PropertyImage } from './entities/property-image.entity';
import { Favorite } from './entities/favorite.entity';
import { User } from '../users/entities/user.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertySearchDto } from './dto/property-search.dto';
import { InjectModel } from '@nestjs/sequelize';

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
  ) {}

  async create(createPropertyDto: CreatePropertyDto, ownerId: string): Promise<Property> {
    return this.propertyModel.create({
      ...createPropertyDto,
      ownerId,
    });
  }

  async findAll(): Promise<Property[]> {
    return this.propertyModel.findAll({
      include: [
        {
          model: PropertyImage,
          attributes: ['id', 'url', 'isFeatured'],
        },
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
    });
  }

  async findOne(id: string): Promise<Property> {
    return this.propertyModel.findByPk(id, {
      include: [
        {
          model: PropertyImage,
          attributes: ['id', 'url', 'isFeatured', 'displayOrder'],
        },
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'firstName', 'lastName', 'email', 'profileImage'],
        },
      ],
    });
  }

  async update(id: string, updatePropertyDto: UpdatePropertyDto): Promise<Property> {
    const property = await this.findOne(id);
    
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    
    await property.update(updatePropertyDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const property = await this.findOne(id);
    
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    
    await property.destroy();
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
    } = searchDto;

    const offset = (page - 1) * limit;
    
    const whereClause: any = {
      isActive: true,
    };
    
    if (query) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${query}%` } },
        { description: { [Op.iLike]: `%${query}%` } },
      ];
    }
    
    if (category) {
      whereClause.category = category;
    }
    
    if (city) {
      whereClause.city = { [Op.iLike]: `%${city}%` };
    }
    
    if (postcode) {
      whereClause.postcode = { [Op.iLike]: `%${postcode}%` };
    }
    
    if (minPrice) {
      whereClause.price = { ...whereClause.price, [Op.gte]: minPrice };
    }
    
    if (maxPrice) {
      whereClause.price = { ...whereClause.price, [Op.lte]: maxPrice };
    }
    
    if (minBedrooms) {
      whereClause.bedrooms = { [Op.gte]: minBedrooms };
    }
    
    if (minBathrooms) {
      whereClause.bathrooms = { [Op.gte]: minBathrooms };
    }
    
    if (availableFrom) {
      whereClause.availableFrom = { [Op.lte]: new Date(availableFrom) };
    }
    
    if (availableTo) {
      whereClause.availableTo = {
        [Op.or]: [
          { [Op.gte]: new Date(availableTo) },
          { [Op.eq]: null },
        ],
      };
    }
    
    return this.propertyModel.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: PropertyImage,
          attributes: ['id', 'url', 'isFeatured'],
          limit: 1,
          order: [['isFeatured', 'DESC'], ['displayOrder', 'ASC']],
        },
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
    });
  }

  async getFeatured(): Promise<Property[]> {
    return this.propertyModel.findAll({
      where: { isActive: true },
      include: [
        {
          model: PropertyImage,
          attributes: ['id', 'url', 'isFeatured'],
          limit: 1,
          order: [['isFeatured', 'DESC'], ['displayOrder', 'ASC']],
        },
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
      limit: 6,
      order: [['createdAt', 'DESC']],
    });
  }

  async getLandlordProperties(landlordId: string): Promise<Property[]> {
    return this.propertyModel.findAll({
      where: { ownerId: landlordId },
      include: [
        {
          model: PropertyImage,
          attributes: ['id', 'url', 'isFeatured'],
          limit: 1,
          order: [['isFeatured', 'DESC'], ['displayOrder', 'ASC']],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async addImages(propertyId: string, files: Express.Multer.File[]): Promise<PropertyImage[]> {
    const property = await this.findOne(propertyId);
    
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    
    const apiUrl = this.configService.get('API_URL');
    const images: PropertyImage[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const imagePath = `${file.path.replace('\\', '/')}`;
      const imageUrl = `${apiUrl}/${imagePath}`;
      
      // Set the first image as featured if no images exist
      const existingImagesCount = await this.propertyImageModel.count({
        where: { propertyId },
      });
      
      const image = await this.propertyImageModel.create({
        propertyId,
        url: imageUrl,
        isFeatured: existingImagesCount === 0,
        displayOrder: existingImagesCount + i,
      });
      
      images.push(image);
    }
    
    return images;
  }

  async findImage(id: string): Promise<PropertyImage> {
    return this.propertyImageModel.findByPk(id);
  }

  async removeImage(id: string): Promise<void> {
    const image = await this.findImage(id);
    
    if (!image) {
      throw new NotFoundException('Image not found');
    }
    
    // If removing featured image, set another one as featured
    if (image.isFeatured) {
      const nextImage = await this.propertyImageModel.findOne({
        where: {
          propertyId: image.propertyId,
          id: { [Op.ne]: id },
        },
        order: [['displayOrder', 'ASC']],
      });
      
      if (nextImage) {
        await nextImage.update({ isFeatured: true });
      }
    }
    
    await image.destroy();
  }

  async toggleFavorite(userId: string, propertyId: string, isFavorite: boolean): Promise<void> {
    const property = await this.findOne(propertyId);
    
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    
    if (isFavorite) {
      await this.favoriteModel.findOrCreate({
        where: { userId, propertyId },
      });
    } else {
      await this.favoriteModel.destroy({
        where: { userId, propertyId },
      });
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
              model: PropertyImage,
              attributes: ['id', 'url', 'isFeatured'],
              limit: 1,
              order: [['isFeatured', 'DESC'], ['displayOrder', 'ASC']],
            },
            {
              model: User,
              as: 'owner',
              attributes: ['id', 'firstName', 'lastName'],
            },
          ],
        },
      ],
    });
    
    return favorites.map(favorite => favorite.property);
  }
}