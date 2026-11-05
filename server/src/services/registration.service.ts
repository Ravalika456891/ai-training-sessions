import mongoose from 'mongoose';
import { Registration, IRegistration } from '../models/Registration.js';
import { ApiError } from '../utils/apiError.js';
import { CreateRegistrationInput } from '../validators/registration.validator.js';
import { isDBConnected } from '../config/db.js';
import { memoryStore } from './memoryStore.js';
import { EmailService } from './email.service.js';

export interface RegistrationResult {
  registration: any;
  emailDispatched: boolean;
}

export class RegistrationService {
  /**
   * Create a new student registration with duplicate protection and email confirmation
   */
  static async createRegistration(input: CreateRegistrationInput): Promise<RegistrationResult> {
    const name = input.name.trim();
    const email = input.email.toLowerCase().trim();
    const phone = input.phone.trim();
    const batchId = input.batchId.trim();

    // 1. Attempt Database Registration if MongoDB is connected
    if (isDBConnected()) {
      try {
        // Prevent duplicate registration for the same email and training batch
        const existing = await Registration.findOne({ email, batchId });
        if (existing) {
          throw ApiError.conflict(
            `You have already registered for this training batch (${batchId}) with this email address.`
          );
        }

        const registration = await Registration.create({
          name,
          email,
          phone,
          batchId,
          registrationStatus: 'confirmed',
          paymentStatus: 'unpaid',
        });

        // 2. Dispatch Confirmation Email only after registration is successfully saved
        const emailResult = await EmailService.sendRegistrationConfirmation({
          id: registration._id.toString(),
          name: registration.name,
          email: registration.email,
          phone: registration.phone,
          batchId: registration.batchId,
          createdAt: registration.createdAt,
        });

        return {
          registration: {
            id: registration._id.toString(),
            name: registration.name,
            email: registration.email,
            phone: registration.phone,
            batchId: registration.batchId,
            registrationStatus: registration.registrationStatus,
            paymentStatus: registration.paymentStatus,
            createdAt: registration.createdAt,
          },
          emailDispatched: emailResult.sent,
        };
      } catch (err: any) {
        // Handle MongoDB E11000 duplicate key error
        if (err.code === 11000) {
          throw ApiError.conflict(
            `You have already registered for this training batch (${batchId}) with this email address.`
          );
        }
        if (err.statusCode) throw err;
        console.warn('[MongoDB Registration Fallback to MemoryStore]', err.message);
      }
    }

    // 3. Resilient In-Memory Fallback if MongoDB Atlas is pending/offline
    const existingInMemory = await memoryStore.findRegistration(email, batchId);
    if (existingInMemory) {
      throw ApiError.conflict(
        `You have already registered for this training batch (${batchId}) with this email address.`
      );
    }

    const savedInMemory = await memoryStore.createRegistration({
      name,
      email,
      phone,
      batchId,
      registrationStatus: 'confirmed',
      paymentStatus: 'unpaid',
    });

    const emailResult = await EmailService.sendRegistrationConfirmation({
      id: savedInMemory._id,
      name: savedInMemory.name,
      email: savedInMemory.email,
      phone: savedInMemory.phone,
      batchId: savedInMemory.batchId,
      createdAt: savedInMemory.createdAt,
    });

    return {
      registration: {
        id: savedInMemory._id,
        name: savedInMemory.name,
        email: savedInMemory.email,
        phone: savedInMemory.phone,
        batchId: savedInMemory.batchId,
        registrationStatus: savedInMemory.registrationStatus,
        paymentStatus: savedInMemory.paymentStatus,
        createdAt: savedInMemory.createdAt,
      },
      emailDispatched: emailResult.sent,
    };
  }

  /**
   * Retrieve registrations (for verification or admin audits)
   */
  static async getRegistrations(filter?: { email?: string; batchId?: string }): Promise<any[]> {
    if (isDBConnected()) {
      try {
        const query: any = {};
        if (filter?.email) query.email = filter.email.toLowerCase().trim();
        if (filter?.batchId) query.batchId = filter.batchId.trim();

        const list = await Registration.find(query).sort({ createdAt: -1 }).lean();
        return list.map((item: any) => ({
          id: item._id.toString(),
          name: item.name,
          email: item.email,
          phone: item.phone,
          batchId: item.batchId,
          registrationStatus: item.registrationStatus,
          paymentStatus: item.paymentStatus,
          createdAt: item.createdAt,
        }));
      } catch (err: any) {
        console.warn('[MongoDB GetRegistrations Fallback]', err.message);
      }
    }

    const all = await memoryStore.getAllRegistrations();
    return all.filter((r) => {
      if (filter?.email && r.email.toLowerCase() !== filter.email.toLowerCase().trim()) return false;
      if (filter?.batchId && r.batchId !== filter.batchId.trim()) return false;
      return true;
    });
  }
}

