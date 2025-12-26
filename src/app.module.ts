import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { RolesGuard } from './common/auth/roles.guard';
import { TagModule } from './tag/tag.module';
import { AddressModule } from './address/address.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { ReviewModule } from './review/review.module';
import { InventoryModule } from './inventory/inventory.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // Set to false in production!
        logging: true,
      }),
    }),
    UserModule,
    AuthModule,
    PostModule,
    CommentModule,
    CategoryModule,
    ProductModule,
    TagModule,
    AddressModule,
    CartModule,
    OrderModule,
    ReviewModule,
    InventoryModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
