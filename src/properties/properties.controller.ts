import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  NotFoundException,
  ForbiddenException,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
} from '@nestjs/swagger'
import { FilesInterceptor } from '@nestjs/platform-express'
import { Roles } from '../auth/roles/roles.decorator'
import { JwtAccessGuard } from '../auth/strategies/jwt-access-token.guard'
import { PropertiesService } from './properties.service'
import { CreatePropertyDto } from './dto/create-property.dto'
import { UpdatePropertyDto } from './dto/update-property.dto'
import { PropertySearchDto } from './dto/property-search.dto'
import { UploadPropertyImagesDto } from './dto/upload-property-images.dto'
import { UserRole } from 'src/auth/enums/role.enum'
import { RolesGuard } from 'src/auth/roles/roles.guard'

@ApiTags('properties')
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  @ApiOperation({ summary: 'Search properties with filters' })
  @ApiResponse({ status: 200, description: 'Return filtered properties' })
  async search(@Query() searchDto: PropertySearchDto) {
    return this.propertiesService.search(searchDto)
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all active properties for grid view' })
  @ApiResponse({ status: 200, description: 'Return all active properties' })
  async getAllProperties(@Query() searchDto: PropertySearchDto) {
    return this.propertiesService.getAllActiveProperties(searchDto)
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured properties' })
  @ApiResponse({ status: 200, description: 'Return featured properties' })
  async getFeatured() {
    return this.propertiesService.getFeatured()
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all property categories' })
  @ApiResponse({ status: 200, description: 'Return all property categories' })
  async getCategories() {
    return this.propertiesService.getCategories()
  }

  @Get('cities')
  @ApiOperation({ summary: 'Get all available cities' })
  @ApiResponse({ status: 200, description: 'Return all available cities' })
  async getCities() {
    return this.propertiesService.getCities()
  }

  @Get('price-range')
  @ApiOperation({ summary: 'Get price range statistics' })
  @ApiResponse({ status: 200, description: 'Return price range statistics' })
  async getPriceRange() {
    return this.propertiesService.getPriceRange()
  }

  @Get(':id')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.TENANT)
  async findOne(@Param('id') id: string) {
    const property = await this.propertiesService.findOne(id)
    if (!property) {
      throw new NotFoundException('Property not found')
    }
    return property
  }

  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.LANDLORD)
  @Post()
  @UseInterceptors(FilesInterceptor('images'))
  @ApiConsumes('multipart/form-data')
  async create(
    @Request() req,
    @Body('data') data: string,
    @UploadedFiles() files?: Express.Multer.File[]
  ) {
    const parsed: CreatePropertyDto = JSON.parse(data)
    return this.propertiesService.create(parsed, req.user.id, files)
  }

  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.LANDLORD)
  @Put(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    const property = await this.propertiesService.findOne(id)
    
    if (!property) {
      throw new NotFoundException('Property not found')
    }
    
    if (property.ownerId !== req.user.id) {
      throw new ForbiddenException('You do not have permission to update this property')
    }
    
    return this.propertiesService.update(id, updatePropertyDto)
  }

  @Delete(':id')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.LANDLORD)
  async remove(@Request() req, @Param('id') id: string) {
    const property = await this.propertiesService.findOne(id)
    
    if (!property) {
      throw new NotFoundException('Property not found')
    }
    
    if (property.ownerId !== req.user.id) {
      throw new ForbiddenException('You do not have permission to delete this property')
    }
    
    await this.propertiesService.remove(id)
    return { message: 'Property deleted successfully' }
  }

  @Post(':id/favorite')
  @UseGuards(JwtAccessGuard, RolesGuard)
  async addToFavorites(@Request() req, @Param('id') propertyId: string) {
    await this.propertiesService.toggleFavorite(req.user.id, propertyId, true)
    return { message: 'Property added to favorites' }
  }

  @Delete(':id/favorite')
  @UseGuards(JwtAccessGuard, RolesGuard)
  async removeFromFavorites(@Request() req, @Param('id') propertyId: string) {
    await this.propertiesService.toggleFavorite(req.user.id, propertyId, false)
    return { message: 'Property removed from favorites' }
  }

  @Get('user/favorites')
  @UseGuards(JwtAccessGuard, RolesGuard)
  async getFavorites(@Request() req) {
    return this.propertiesService.getUserFavorites(req.user.id)
  }

  @Get('user/landlord')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.LANDLORD)
  async getLandlordProperties(@Request() req) {
    return this.propertiesService.getLandlordProperties(req.user.id)
  }

  @Delete(':propertyId/images/:imageId')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(UserRole.LANDLORD)
  @ApiOperation({ summary: 'Delete property image' })
  @ApiResponse({ status: 200, description: 'Image deleted successfully' })
  async deletePropertyImage(
    @Request() req,
    @Param('propertyId') propertyId: string,
    @Param('imageId') imageId: string,
  ) {
    const property = await this.propertiesService.findOne(propertyId)
    
    if (property.ownerId !== req.user.id) {
      throw new ForbiddenException('You do not have permission to delete images for this property')
    }

    await this.propertiesService.deletePropertyImage(imageId, propertyId)
    return { message: 'Image deleted successfully' }
  }
}