import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service.js';

export class PaymentController {
  static async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orderData = await PaymentService.createOrder(
        req.body,
        req.user?._id?.toString()
      );

      res.status(200).json({
        success: true,
        message: 'Razorpay order created successfully.',
        data: orderData,
      });
    } catch (error) {
      next(error);
    }
  }

  static async verify(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const verification = await PaymentService.verifyPayment(req.body);

      res.status(200).json({
        success: true,
        message: verification.message,
        data: verification,
      });
    } catch (error) {
      next(error);
    }
  }

  static async webhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const signature = (req.headers['x-razorpay-signature'] as string) || '';
      const rawBody = (req as any).rawBody || JSON.stringify(req.body);

      const result = await PaymentService.processWebhook(signature, req.body, rawBody);

      res.status(200).json({
        status: 'ok',
        result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payments = await PaymentService.getMyPayments(req.user!._id.toString());

      res.status(200).json({
        success: true,
        count: payments.length,
        data: payments,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPaymentByEnrollment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const enrollmentId = Array.isArray(req.params.enrollmentId)
        ? req.params.enrollmentId[0]
        : req.params.enrollmentId;

      const payment = await PaymentService.getPaymentByEnrollment(enrollmentId);

      res.status(200).json({
        success: true,
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  static async validateCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { couponCode, basePrice } = req.body;
      const result = PaymentService.validateCoupon(couponCode, Number(basePrice) || 1999);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
