import { Response } from 'express';
import Vote from '../models/Vote.js';
import Candidate from '../models/Candidate.js';
import User from '../models/User.js';
import Election from '../models/Election.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { getIO } from '../socket.js';

export const castVote = async (req: AuthRequest, res: Response) => {
  try {
    const { electionId, candidateId } = req.body;
    const userId = req.user?._id;

    if (!userId) return res.status(401).json({ message: 'User not authenticated' });

    // Check if election exists and is ongoing
    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ message: 'Election not found' });
    if (election.status !== 'ongoing') {
      return res.status(400).json({ message: 'Voting is not currently open for this election' });
    }

    // Check if user has already voted in this election
    const existingVote = await Vote.findOne({ userId, electionId });
    if (existingVote) {
      return res.status(400).json({ message: 'You have already voted in this election' });
    }

    // Create vote
    const vote = new Vote({ userId, electionId, candidateId });
    await vote.save();

    // Increment candidate vote count
    const updatedCandidate = await Candidate.findByIdAndUpdate(
      candidateId, 
      { $inc: { voteCount: 1 } },
      { new: true }
    );

    // Update user hasVoted array
    await User.findByIdAndUpdate(userId, { $addToSet: { hasVoted: electionId } });

    // Emit real-time update
    try {
      const io = getIO();
      io.to(electionId).emit('vote-updated', {
        candidateId,
        newVoteCount: updatedCandidate?.voteCount
      });
    } catch (socketErr) {
      console.error('Socket emission failed:', socketErr);
    }

    res.status(201).json({ message: 'Vote cast successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const getUserVotes = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const votes = await Vote.find({ userId }).populate('electionId candidateId');
    res.json(votes);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};
