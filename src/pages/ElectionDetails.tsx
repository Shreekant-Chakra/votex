import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { toast } from 'sonner';
import { CheckCircle2, Info, Trophy, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import io from 'socket.io-client';

interface Candidate {
  _id: string;
  name: string;
  image: string;
  voteCount: number;
  bio?: string;
}

interface Election {
  _id: string;
  title: string;
  description: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  startDate: string;
  endDate: string;
}

export default function ElectionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [election, setElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingFor, setVotingFor] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [electionRes, candidatesRes] = await Promise.all([
          axios.get(`/api/elections/${id}`),
          axios.get(`/api/candidates/election/${id}`)
        ]);
        setElection(electionRes.data);
        setCandidates(candidatesRes.data);
      } catch (err) {
        toast.error('Failed to load election details');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Socket.io for real-time updates
    const socket = io();
    socket.emit('join-election', id);

    socket.on('vote-updated', ({ candidateId, newVoteCount }) => {
      setCandidates(prev => prev.map(c => 
        c._id === candidateId ? { ...c, voteCount: newVoteCount } : c
      ));
    });

    return () => {
      socket.emit('leave-election', id);
      socket.disconnect();
    };
  }, [id, navigate]);

  const handleVote = async (candidateId: string) => {
    if (!election || election.status !== 'ongoing') {
      toast.error('Voting is not open for this election');
      return;
    }

    setVotingFor(candidateId);
    try {
      await axios.post('/api/votes', { electionId: id, candidateId });
      toast.success('Vote cast successfully!');
      
      // Update local user state in Redux
      if (user) {
        const updatedUser = { ...user, hasVoted: [...user.hasVoted, election._id] };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        dispatch({ 
          type: 'auth/login/fulfilled', 
          payload: { user: updatedUser, accessToken: localStorage.getItem('token') } 
        });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cast vote');
    } finally {
      setVotingFor(null);
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!election) return null;

  const hasVoted = user?.hasVoted.includes(election._id);
  const isOngoing = election.status === 'ongoing';
  const isCompleted = election.status === 'completed';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <h1 className="text-4xl font-bold tracking-tight">{election.title}</h1>
          <Badge variant={isOngoing ? 'default' : 'secondary'} className={isOngoing ? 'bg-green-500' : ''}>
            {election.status.toUpperCase()}
          </Badge>
        </div>
        <p className="text-xl text-muted-foreground">{election.description}</p>
        
        {hasVoted && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5" />
            <p className="font-medium">You have already cast your vote in this election.</p>
          </div>
        )}

        {!isOngoing && !isCompleted && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg flex items-center gap-3">
            <Info className="w-5 h-5" />
            <p className="font-medium">This election has not started yet. Stay tuned!</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {candidates.map((candidate) => (
          <motion.div
            key={candidate._id}
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Card className={`h-full flex flex-col ${hasVoted ? 'opacity-90' : ''}`}>
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="w-16 h-16 border-2 border-primary/10">
                  <AvatarImage src={candidate.image} />
                  <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{candidate.name}</CardTitle>
                  {(isOngoing || isCompleted) && (
                    <div className="flex items-center gap-1 text-primary font-semibold mt-1">
                      <Trophy className="w-4 h-4" />
                      <span>{candidate.voteCount} Votes</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {candidate.bio || 'No biography provided for this candidate.'}
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full gap-2" 
                  disabled={!isOngoing || hasVoted || !!votingFor}
                  onClick={() => handleVote(candidate._id)}
                >
                  {hasVoted ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Voted
                    </>
                  ) : votingFor === candidate._id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Casting Vote...
                    </>
                  ) : (
                    'Vote for Candidate'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
