import { Router } from 'express';
import { register, login, logout, getMe, updateProfileImage } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import upload from '../config/cloudinary.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.post('/upload-image', authenticate, upload.single('image'), (req: any, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({ url: req.file.path });
});
router.put('/profile-image', authenticate, updateProfileImage);

export default router;
