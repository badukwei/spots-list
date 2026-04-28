import { IsString, IsNotEmpty, IsOptional, IsUrl, MaxLength } from 'class-validator';

export class CreateSpotDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  address?: string;

  @IsUrl()
  @IsNotEmpty()
  @MaxLength(500)
  mapsUrl: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}
