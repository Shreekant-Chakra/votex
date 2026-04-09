import { Router } from 'express';
import { 
  createElection, 
  getElections, 
  getElectionById, 
  updateElection, 
  deleteElection,
  getElectionResults
} from '../controllers/election.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate, getElections);
router.get('/:id', authenticate, getElectionById);
router.get('/:id/results', authenticate, getElectionResults);

// Admin only
router.post('/', authenticate, authorize(['admin']), createElection);
router.put('/:id', authenticate, authorize(['admin']), updateElection);
router.delete('/:id', authenticate, authorize(['admin']), deleteElection);

export default router;
