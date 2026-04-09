import { Router } from 'express';
import { 
  addCandidate, 
  getCandidatesByElection, 
  updateCandidate, 
  deleteCandidate 
} from '../controllers/candidate.controller.ts';
import { authenticate, authorize } from '../middleware/auth.middleware.ts';

const router = Router();

router.get('/election/:electionId', authenticate, getCandidatesByElection);

// Admin only
router.post('/', authenticate, authorize(['admin']), addCandidate);
router.put('/:id', authenticate, authorize(['admin']), updateCandidate);
router.delete('/:id', authenticate, authorize(['admin']), deleteCandidate);

export default router;
