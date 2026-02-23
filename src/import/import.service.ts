import { Injectable } from '@nestjs/common';
import { ImportScheduler } from '../import.scheduler';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class ImportService {
  constructor(private readonly importScheduler: ImportScheduler) {}

  @Cron('20 0,12 * * *')
  async handleCron() {
    await this.importScheduler.handleImportAll();
  }
  
  async triggerImportAll(): Promise<{
    status: 'success' | 'error';
    message: string;
    startTime: string;
    endTime: string;
    duration: string;
    error?: string;
  }> {
    const startTime = new Date();
    try {
      await this.importScheduler.handleImportAll();

      const endTime = new Date();
      const durationMs = endTime.getTime() - startTime.getTime();

      // 🧮 แปลงเวลาเป็น ชั่วโมง นาที วินาที
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);

      return {
        status: 'success',
        message: '✅ All DBF imports completed successfully',
        startTime: startTime.toLocaleString('th-TH'),
        endTime: endTime.toLocaleString('th-TH'),
        duration: `${hours} ชั่วโมง ${minutes} นาที ${seconds} วินาที`,
      };
    } catch (error) {
      const endTime = new Date();
      const durationMs = endTime.getTime() - startTime.getTime();
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);

      return {
        status: 'error',
        message: '❌ Error during DBF import',
        startTime: startTime.toLocaleString('th-TH'),
        endTime: endTime.toLocaleString('th-TH'),
        duration: `${hours} ชั่วโมง ${minutes} นาที ${seconds} วินาที`,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
