import { Module } from '@nestjs/common';
import { JsonDb } from './jsonDB.js';

@Module({
  providers: [JsonDb],
  exports: [JsonDb],
})
export class DatabaseModule {}