import { Workshop, IWorkshop } from '../models/Workshop.js';
import { ApiError } from '../utils/apiError.js';
import { CreateWorkshopInput, UpdateWorkshopInput } from '../validators/workshop.validator.js';
import mongoose from 'mongoose';

export class WorkshopService {
  static async getPublishedWorkshops(): Promise<IWorkshop[]> {
    const workshops = await Workshop.find({
      status: 'published',
    }).sort({ startDate: 1 });

    return workshops;
  }

  static async getWorkshopById(idOrSlug: string): Promise<IWorkshop> {
    let workshop: IWorkshop | null = null;

    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      workshop = await Workshop.findById(idOrSlug);
    } else {
      workshop = await Workshop.findOne({ slug: idOrSlug });
    }

    if (!workshop) {
      throw ApiError.notFound(`Workshop '${idOrSlug}' not found.`);
    }

    return workshop;
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
    });

    return workshop;
  }

  static async updateWorkshop(id: string, input: UpdateWorkshopInput): Promise<IWorkshop> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest('Invalid workshop ID format.');
    }

    const updateData: any = { ...input };
    if (input.startDate) updateData.startDate = new Date(input.startDate);
    if (input.endDate) updateData.endDate = new Date(input.endDate);

    const workshop = await Workshop.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!workshop) {
      throw ApiError.notFound('Workshop not found.');
    }

    return workshop;
  }
}

