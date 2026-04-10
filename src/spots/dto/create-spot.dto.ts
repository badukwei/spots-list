import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateSpotDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsUrl()
  @IsOptional()
  mapsUrl?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
