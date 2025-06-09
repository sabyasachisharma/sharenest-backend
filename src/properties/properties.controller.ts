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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertySearchDto } from './dto/property-search.dto';

@ApiTags('properties')
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  @ApiOperation({ summary: 'Search properties with filters' })
  @ApiResponse({ status: 200, description: 'Return filtered properties' })
  async search(@Query() searchDto: PropertySearchDto) {
    return this.propertiesService.search(searchDto);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured properties' })
  @ApiResponse({ status: 200, description: 'Return featured properties' })
  async getFeatured() {
    return this.propertiesService.getFeatured();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get property by id' })
  @ApiResponse({ status: 200, description: 'Return the property' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async findOne(@Param('id') id: string) {
    const property = await this.propertiesService.findOne(id);
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    return property;
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LANDLORD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new property' })
  @ApiResponse({ status: 201, description: 'Property has been created' })
  @ApiResponse({ status: 403, description: 'Forbidden resource' })
  async create(@Request() req, @Body() createPropertyDto: CreatePropertyDto) {
    return this.propertiesService.create(createPropertyDto, req.user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LANDLORD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a property' })
  @ApiResponse({ status: 200, description: 'Property has been updated' })
  @ApiResponse({ status: 403, description: 'Forbidden resource' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    const property = await this.propertiesService.findOne(id);
    
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    
    if (property.ownerId !== req.user.id) {
      throw new ForbiddenException('You do not have permission to update this property');
    }
    
    return this.propertiesService.update(id, updatePropertyDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LANDLORD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a property' })
  @ApiResponse({ status: 200, description: 'Property has been deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden resource' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async remove(@Request() req, @Param('id') id: string) {
    const property = await this.propertiesService.findOne(id);
    
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    
    if (property.ownerId !== req.user.id) {
      throw new ForbiddenException('You do not have permission to delete this property');
    }
    
    await this.propertiesService.remove(id);
    return { message: 'Property deleted successfully' };
  }

  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add property to favorites' })
  async addToFavorites(@Request() req, @Param('id') propertyId: string) {
    await this.propertiesService.toggleFavorite(req.user.id, propertyId, true);
    return { message: 'Property added to favorites' };
  }

  @Delete(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove property from favorites' })
  async removeFromFavorites(@Request() req, @Param('id') propertyId: string) {
    await this.propertiesService.toggleFavorite(req.user.id, propertyId, false);
    return { message: 'Property removed from favorites' };
  }

  @Get('user/favorites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user favorite properties' })
  async getFavorites(@Request() req) {
    return this.propertiesService.getUserFavorites(req.user.id);
  }

  @Get('user/landlord')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LANDLORD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get properties owned by the landlord' })
  async getLandlordProperties(@Request() req) {
    return this.propertiesService.getLandlordProperties(req.user.id);
  }
}