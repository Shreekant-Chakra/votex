import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchElections } from '../store/slices/electionSlice';
import { AppDispatch, RootState } from '../store';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { elections, loading } = useSelector((state: RootState) => state.election);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchElections());
  }, [dispatch]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ongoing':
        return <Badge className="bg-green-500">Ongoing</Badge>;
      case 'upcoming':
        return <Badge variant="secondary">Upcoming</Badge>;
      case 'completed':
        return <Badge variant="outline">Completed</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20">Loading elections...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Elections</h1>
        <p className="text-muted-foreground">
          Browse and participate in active elections.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {elections.map((election, index) => (
          <motion.div
            key={election._id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  {getStatusBadge(election.status)}
                  {user?.hasVoted.includes(election._id) && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                      Voted
                    </Badge>
                  )}
                </div>
                <CardTitle>{election.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {election.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Starts: {new Date(election.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Ends: {new Date(election.endDate).toLocaleDateString()}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button render={<Link to={`/election/${election._id}`} />} nativeButton={false} className="w-full gap-2">
                  View Details
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      {elections.length === 0 && (
        <div className="text-center py-20 bg-muted/50 rounded-lg border-2 border-dashed">
          <p className="text-muted-foreground">No elections found.</p>
        </div>
      )}
    </div>
  );
}
