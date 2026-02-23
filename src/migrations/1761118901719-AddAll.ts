import {MigrationInterface, QueryRunner} from "typeorm";

export class AddAll1761118901719 implements MigrationInterface {
    name = 'AddAll1761118901719'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `user_admin` (`id` varchar(36) NOT NULL, `userId` varchar(255) NOT NULL, `role` varchar(255) NOT NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `modifiedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `user` (`id` varchar(36) NOT NULL, `firstName` varchar(255) NULL, `lastName` varchar(255) NULL, `email` varchar(255) NULL, `status` enum ('active', 'inactive', 'pending') NOT NULL DEFAULT 'pending', `lastLogin` datetime NULL, `userType` enum ('personal', 'admin') NOT NULL DEFAULT 'personal', `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `modifiedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `deletedAt` datetime(6) NULL, `loginAttempt` int NULL DEFAULT '0', `attemptLifeTime` datetime NULL, `resetPasswordCode` varchar(255) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP TABLE `user`");
        await queryRunner.query("DROP TABLE `user_admin`");
    }

}
