import { Request, Response, NextFunction } from 'express';
import { Certificate } from '../models/Certificate.js';
import { ApiError } from '../utils/apiError.js';

export class CertificateController {
  // Public verification endpoint
  static async verifyCertificate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const serialNumber = (req.params.serialNumber as string).trim().toUpperCase();

      const certificate = await Certificate.findOne({
        serialNumber,
      }).populate('workshopId', 'title batchCode instructor');

      if (!certificate) {
        throw ApiError.notFound(`No certificate found matching serial number '${serialNumber}'.`);
      }

      res.status(200).json({
        success: true,
        data: {
          isValid: !certificate.isRevoked,
          serialNumber: certificate.serialNumber,
          recipientName: certificate.recipientName,
          workshopTitle: certificate.workshopTitle,
          completionDate: certificate.completionDate,
          issuedAt: certificate.issuedAt,
          isRevoked: certificate.isRevoked,
          revokedReason: certificate.revokedReason,
          verificationHash: certificate.verificationHash,
          issuingAuthority: 'AI Launchpad Accreditation Council',
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

