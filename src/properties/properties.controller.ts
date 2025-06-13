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
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { Roles } from '../auth/roles/roles.decorator'
import { JwtAccessGuard } from '../auth/strategies/jwt-access-token.guard'
import { PropertiesService } from './properties.service'
import { CreatePropertyDto } from './dto/create-property.dto'
import { UpdatePropertyDto } from './dto/update-property.dto'
import { PropertySearchDto } from './dto/property-search.dto'
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

  @Get('featured')
  @ApiOperation({ summary: 'Get featured properties' })
  @ApiResponse({ status: 200, description: 'Return featured properties' })
  async getFeatured() {
    return this.propertiesService.getFeatured()
  }

  @Get(':id')
  @UseGuards(JwtAccessGuard, RolesGuard)
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
  async create(@Request() req, @Body() createPropertyDto: CreatePropertyDto) {
    return this.propertiesService.create(createPropertyDto, req.user.id)
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
}