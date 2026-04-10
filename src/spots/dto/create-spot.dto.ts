import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateSpotDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsUrl({ require_protocol: false })
  @IsOptional()
  mapsUrl?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
