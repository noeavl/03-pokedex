import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {
  getStaticPokemonImage(imageName: string) {
    const path = join(process.cwd(), 'upload/pokemons', imageName);

    if (!existsSync(path))
      throw new BadRequestException(`No pokemon found with image ${imageName}`);

    return path;
  }
}
