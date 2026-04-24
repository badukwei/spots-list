import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SearchCategoryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;
}
