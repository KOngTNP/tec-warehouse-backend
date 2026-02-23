import { DynamicModule, Global, Module } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import * as admin from 'firebase-admin';

export type FirebaseUser = admin.auth.DecodedIdToken;
export const FIREBASE_ADMIN_MODULE_OPTIONS = 'FIREBASE_ADMIN_MODULE_OPTIONS';
export const FIREBASE_ADMIN_NAME = 'FIREBASE_ADMIN_NAME';
export const FIREBASE_ADMIN_INJECT = 'FIREBASE_ADMIN_INJECT';

export interface FirebaseAdminModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  name?: string;
  useFactory?: (...args: any[]) => Promise<admin.AppOptions> | admin.AppOptions;
  inject?: any[];
}

export type FirebaseAdminSDK = admin.app.App;

@Global()
@Module({})
export class FirebaseAdminCoreModule {
  static forRoot(options: admin.AppOptions): DynamicModule {
    const firebaseAdminModuleOptions = {
      provide: FIREBASE_ADMIN_MODULE_OPTIONS,
      useValue: options,
    };

    const app =
      admin.apps.length === 0 ? admin.initializeApp(options) : admin.apps[0];

    const firebaseAuthencationProvider = {
      provide: FIREBASE_ADMIN_INJECT,
      useValue: app,
    };

    return {
      module: FirebaseAdminCoreModule,
      providers: [firebaseAdminModuleOptions, firebaseAuthencationProvider],
      exports: [firebaseAdminModuleOptions, firebaseAuthencationProvider],
    };
  }

  static forRootAsync(options: FirebaseAdminModuleAsyncOptions): DynamicModule {
    const firebaseAdminModuleOptions = {
      provide: FIREBASE_ADMIN_MODULE_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };

    const firebaseAuthencationProvider = {
      provide: FIREBASE_ADMIN_INJECT,
      useFactory: (opt: admin.AppOptions) => {
        const app =
          admin.apps.length === 0 ? admin.initializeApp(opt) : admin.apps[0];

        return app;
      },
      inject: [FIREBASE_ADMIN_MODULE_OPTIONS],
    };

    return {
      module: FirebaseAdminCoreModule,
      imports: options.imports,
      providers: [firebaseAdminModuleOptions, firebaseAuthencationProvider],
      exports: [firebaseAdminModuleOptions, firebaseAuthencationProvider],
    };
  }
}
