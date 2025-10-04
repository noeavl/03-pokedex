import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { isValidObjectId, Model, HydratedDocument } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationDto } from 'src/common/dto/pagintation.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {
  private defaultLimit: number | undefined;
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService,
  ) {
    //console.log(process.env.DEFAULT_LIMIT); // Si se hace desde aquí obtenemos undefined porque no esta definido
    console.log(this.configService.get<number>('defaultLimit')); // Si se hace desde aquí obtenemos el valor como un numero
    //console.log(this.configService.get('DEFAULT_LIMIT')); // Si se hace desde aquí obtenemos el valor como un numero
    //this.defaultLimit = this.configService.get<number>('defaultLimit');asd
    //console.log(this.defaultLimit);
  }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
    // Se lanza una excepción para solo hacer una consulta a la BD
    try {
      const createdPokemon = new this.pokemonModel(createPokemonDto);
      return await createdPokemon.save();
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async batchCreate(createdPokemonBatchDto: CreatePokemonDto[]) {
    try {
      const createdPokemonBatch = this.pokemonModel.insertMany(
        createdPokemonBatchDto,
      );
      return createdPokemonBatch;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<HydratedDocument<Pokemon>[]> {
    const { limit = this.defaultLimit ? this.defaultLimit : 0, offset = 0 } =
      paginationDto;
    return await this.pokemonModel
      .find()
      .limit(limit)
      .skip(offset)
      .sort({ no: 1 })
      .select('-__v');
  }

  async findOne(term: string): Promise<HydratedDocument<Pokemon>> {
    let pokemonFound: HydratedDocument<Pokemon> | null = null;

    if (!isNaN(+term)) {
      pokemonFound = await this.pokemonModel.findOne({ no: term });
    }

    if (!pokemonFound && isValidObjectId(term)) {
      pokemonFound = await this.pokemonModel.findOne({ _id: term });
    }

    if (!pokemonFound) {
      pokemonFound = await this.pokemonModel.findOne({ name: term });
    }

    if (!pokemonFound) throw new NotFoundException('Pokemon not found in db');

    return pokemonFound;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemonFound = await this.findOne(term);
    if (updatePokemonDto.name)
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();

    try {
      await pokemonFound.updateOne(updatePokemonDto);
    } catch (error) {
      this.handleExceptions(error);
    }

    return { ...pokemonFound.toJSON(), ...updatePokemonDto };
  }

  async remove(id: string) {
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });
    if (deletedCount === 0)
      throw new BadRequestException(`Pokemon with id ${id} not found`);
  }

  async removeAll() {
    await this.pokemonModel.deleteMany();
  }

  private handleExceptions(error: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (error.code) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === 11000) {
        throw new BadRequestException(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          `Pokemon already exists in db ${JSON.stringify(error.keyValue)}`,
        );
      }
      console.error(error);
      throw new InternalServerErrorException(
        'Can´t create Pokemon - Check server logs',
      );
    }
  }
}
