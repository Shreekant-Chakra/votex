import { Router } from 'express';
import { castVote, getUserVotes } from '../controllers/vote.controller.ts';
import { authenticate } from '../middleware/auth.middleware.ts';

const router = Router();

router.post('/', authenticate, castVote);
router.get('/my-votes', authenticate, getUserVotes);

export default router;
