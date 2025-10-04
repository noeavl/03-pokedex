import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-response.interface';
import { PokemonService } from 'src/pokemon/pokemon.service';
import { CreatePokemonDto } from '../pokemon/dto/create-pokemon.dto';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {
  private readonly axios: AxiosInstance = axios;
  constructor(
    private readonly pokemonService: PokemonService,
    private httpService: AxiosAdapter,
  ) {}
  async executeSeed() {
    await this.pokemonService.removeAll();
    const data = await this.httpService.get<PokeResponse>(
      'https://pokeapi.co/api/v2/pokemon?limit=10',
    );
    const pokemonBatchFound: CreatePokemonDto[] = data.results.map(
      ({ name, url }) => {
        const segments = url.split('/');
        const no = +segments[segments.length - 2];
        return { name, no };
      },
    );
    return await this.pokemonService.batchCreate(pokemonBatchFound);
  }
}
