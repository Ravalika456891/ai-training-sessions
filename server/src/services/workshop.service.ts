import { Workshop, IWorkshop } from '../models/Workshop.js';
import { ApiError } from '../utils/apiError.js';
import { CreateWorkshopInput, UpdateWorkshopInput } from '../validators/workshop.validator.js';
import { isDBConnected } from '../config/db.js';
import { seedDatabase } from '../utils/seed.js';
import { memoryStore } from './memoryStore.js';
import mongoose from 'mongoose';

export class WorkshopService {
  static async getPublishedWorkshops(): Promise<any[]> {
    if (isDBConnected()) {
      try {
        let workshops = await Workshop.find({
          status: 'published',
        }).sort({ startDate: 1 });

        // If database is connected but no cohorts exist yet, auto-seed default batches
        if (workshops.length === 0) {
          try {
            await seedDatabase();
            workshops = await Workshop.find({
              status: 'published',
            }).sort({ startDate: 1 });
          } catch (seedErr) {
            console.warn('[Auto-Seed Error]', seedErr);
          }
        }

        if (workshops && workshops.length > 0) {
          return workshops;
        }
      } catch (err: any) {
        console.warn('[MongoDB getPublishedWorkshops Fallback]', err.message);
      }
    }

    return memoryStore.getPublishedWorkshops();
  }

  static async getWorkshopById(idOrSlug: string): Promise<any> {
    if (isDBConnected()) {
      try {
        let workshop: IWorkshop | null = null;
        if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
          workshop = await Workshop.findById(idOrSlug);
        } else {
          workshop = await Workshop.findOne({
            $or: [{ slug: idOrSlug }, { batchCode: idOrSlug }],
          });
        }
        if (workshop) {
          return workshop;
        }
      } catch (err: any) {
        console.warn('[MongoDB getWorkshopById Fallback]', err.message);
      }
    }

    const memWorkshop = await memoryStore.findWorkshop(idOrSlug);
    if (!memWorkshop) {
      throw ApiError.notFound(`Workshop '${idOrSlug}' not found.`);
    }
    return memWorkshop;
  }

  static async createWorkshop(input: CreateWorkshopInput): Promise<IWorkshop> {
    const existing = await Workshop.findOne({
      $or: [{ slug: input.slug }, { batchCode: input.batchCode }],
    });

    if (existing) {
      throw ApiError.conflict('A workshop with this slug or batch code already exists.');
    }

    const workshop = await Workshop.create({
      ...input,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      enrolledCount: 0,
      reservedCount: 0,
    });

    return workshop;
  }

  static async updateWorkshop(id: string, input: UpdateWorkshopInput): Promise<IWorkshop> {
    const workshop = await Workshop.findByIdAndUpdate(
      id,
      {
        ...input,
        ...(input.startDate && { startDate: new Date(input.startDate) }),
        ...(input.endDate && { endDate: new Date(input.endDate) }),
      },
      { new: true, runValidators: true }
    );

    if (!workshop) {
      throw ApiError.notFound(`Workshop with ID '${id}' not found.`);
    }

    return workshop;
  }
}
