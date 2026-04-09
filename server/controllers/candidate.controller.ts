import { Request, Response } from 'express';
import Candidate from '../models/Candidate.js';

export const addCandidate = async (req: Request, res: Response) => {
  try {
    const { name, image, electionId, bio } = req.body;
    const candidate = new Candidate({ name, image, electionId, bio });
    await candidate.save();
    res.status(201).json(candidate);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const getCandidatesByElection = async (req: Request, res: Response) => {
  try {
    const candidates = await Candidate.find({ electionId: req.params.electionId });
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const updateCandidate = async (req: Request, res: Response) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const deleteCandidate = async (req: Request, res: Response) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    res.json({ message: 'Candidate deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};
