import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {PrismaService} from "./prisma.service";
import {UsersService} from "./user.service";
import {PostsService} from "./post.service";
import {WorkerService} from "./worker.service";

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, PrismaService, UsersService, PostsService, WorkerService],
})
export class AppModule {}
