import { Request, Response, NextFunction } from 'express';
import { WorkshopService } from '../services/workshop.service.js';

export class WorkshopController {
  static async getWorkshops(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const workshops = await WorkshopService.getPublishedWorkshops();
      res.status(200).json({
        success: true,
        count: workshops.length,
        data: workshops,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getWorkshopById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const workshopId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const workshop = await WorkshopService.getWorkshopById(workshopId);
      res.status(200).json({
        success: true,
        data: workshop,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createWorkshop(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const workshop = await WorkshopService.createWorkshop(req.body);
      res.status(201).json({
        success: true,
        message: 'Workshop created successfully.',
        data: workshop,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateWorkshop(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const workshopId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const workshop = await WorkshopService.updateWorkshop(workshopId, req.body);
      res.status(200).json({
        success: true,
        message: 'Workshop updated successfully.',
        data: workshop,
      });
    } catch (error) {
      next(error);
    }
  }
}
