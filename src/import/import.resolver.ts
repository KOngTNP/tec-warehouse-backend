import { Mutation, Resolver } from '@nestjs/graphql';
import { ImportService } from './import.service';
import { ImportResultDto } from './import.dto';

@Resolver()
export class ImportResolver {
  constructor(private readonly importService: ImportService) {}

  @Mutation(() => ImportResultDto, {
    description: 'Trigger manual DBF import for all companies',
  })
  async triggerImportAll(): Promise<ImportResultDto> {
    return this.importService.triggerImportAll();
  }
}
