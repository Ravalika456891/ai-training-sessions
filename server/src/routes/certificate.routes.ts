import { Router } from 'express';
import { CertificateController } from '../controllers/certificate.controller.js';

const router = Router();

// Public certificate verification
router.get('/verify/:serialNumber', CertificateController.verifyCertificate);

export default router;

