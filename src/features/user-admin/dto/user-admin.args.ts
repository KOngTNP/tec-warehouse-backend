import { ArgsType, Field } from '@nestjs/graphql';
import { PaginationArgs } from 'src/shared/pagination/pagination.args';

@ArgsType()
export class UserAdminArgs extends PaginationArgs {}
