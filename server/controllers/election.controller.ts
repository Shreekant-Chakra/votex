import { Request, Response } from 'express';
import Election from '../models/Election.js';
import Candidate from '../models/Candidate.js';
import Vote from '../models/Vote.js';

export const createElection = async (req: Request, res: Response) => {
  try {
    const { title, description, startDate, endDate } = req.body;
    const election = new Election({ title, description, startDate, endDate });
    await election.save();
    res.status(201).json(election);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const getElections = async (req: Request, res: Response) => {
  try {
    const elections = await Election.find().sort({ createdAt: -1 });
    res.json(elections);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const getElectionById = async (req: Request, res: Response) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found' });
    res.json(election);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const updateElection = async (req: Request, res: Response) => {
  try {
    const election = await Election.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!election) return res.status(404).json({ message: 'Election not found' });
    res.json(election);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const deleteElection = async (req: Request, res: Response) => {
  try {
    const election = await Election.findByIdAndDelete(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found' });
    
    // Cleanup related candidates and votes
    await Candidate.deleteMany({ electionId: req.params.id });
    await Vote.deleteMany({ electionId: req.params.id });
    
    res.json({ message: 'Election and related data deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const getElectionResults = async (req: Request, res: Response) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found' });

    // In a real app, you might only show results after election ends
    // if (election.status !== 'completed') {
    //   return res.status(403).json({ message: 'Results are only available after election ends' });
    // }

    const candidates = await Candidate.find({ electionId: req.params.id }).sort({ voteCount: -1 });
    res.json({ election, candidates });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};
