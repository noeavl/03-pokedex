import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileNamer, fileFilter } from 'src/common/helpers';
import { diskStorage } from 'multer';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}
  @Get('pokemon/:imageName')
  findPokemonImage(
    @Res() res: Response,
    @Param('imageName') imageName: string,
  ) {
    const path = this.filesService.getStaticPokemonImage(imageName);
    return res.sendFile(path);
  }

  @Post('pokemon')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
      storage: diskStorage({
        filename: fileNamer,
        destination: './upload/pokemons',
      }),
    }),
  )
  uploadPokemonImage(@UploadedFile() file: Express.Multer.File) {
    if (!file)
      throw new BadRequestException('Make sure that the file is an image');
    const secureUrl = `${this.configService.get('host')}/files/pokemon/${file.filename}`;
    return { secureUrl };
  }
}
