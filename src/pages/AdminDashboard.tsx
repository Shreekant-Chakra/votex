import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, Users, Vote, ListChecks, BarChart3, Camera, Loader2 } from 'lucide-react';

interface Election {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'ongoing' | 'completed';
}

interface Candidate {
  _id: string;
  name: string;
  image: string;
  electionId: string;
  voteCount: number;
}

export default function AdminDashboard() {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [isElectionDialogOpen, setIsElectionDialogOpen] = useState(false);
  const [isCandidateDialogOpen, setIsCandidateDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [electionToDelete, setElectionToDelete] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Form states
  const [electionForm, setElectionForm] = useState({ title: '', description: '', startDate: '', endDate: '' });
  const [candidateForm, setCandidateForm] = useState({ name: '', image: '', electionId: '', bio: '' });

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const res = await axios.get('/api/elections');
      setElections(res.data);
    } catch (err) {
      toast.error('Failed to fetch elections');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateElection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/elections', electionForm);
      toast.success('Election created successfully');
      setIsElectionDialogOpen(false);
      fetchElections();
      setElectionForm({ title: '', description: '', startDate: '', endDate: '' });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to create election';
      toast.error(message);
    }
  };

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/candidates', candidateForm);
      toast.success('Candidate added successfully');
      setIsCandidateDialogOpen(false);
      setCandidateForm({ name: '', image: '', electionId: '', bio: '' });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to add candidate';
      toast.error(message);
    }
  };

  const handleDeleteElection = async () => {
    if (!electionToDelete) return;
    try {
      await axios.delete(`/api/elections/${electionToDelete}`);
      toast.success('Election deleted');
      fetchElections();
      setIsConfirmDialogOpen(false);
      setElectionToDelete(null);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to delete election';
      toast.error(message);
    }
  };

  const confirmDelete = (id: string) => {
    setElectionToDelete(id);
    setIsConfirmDialogOpen(true);
  };

  const updateElectionStatus = async (id: string, status: string) => {
    try {
      await axios.put(`/api/elections/${id}`, { status });
      toast.success(`Election status updated to ${status}`);
      fetchElections();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to update status';
      toast.error(message);
    }
  };

  const handleCandidateImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const res = await axios.post('/api/auth/upload-image', formData);
      setCandidateForm({ ...candidateForm, image: res.data.url });
      toast.success('Image uploaded');
    } catch (err) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage elections, candidates, and view results.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isElectionDialogOpen} onOpenChange={setIsElectionDialogOpen}>
            <DialogTrigger render={
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Election
              </Button>
            } />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Election</DialogTitle>
                <DialogDescription>Fill in the details to start a new voting process.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateElection} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={electionForm.title} onChange={(e) => setElectionForm({...electionForm, title: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">Description</Label>
                  <Input id="desc" value={electionForm.description} onChange={(e) => setElectionForm({...electionForm, description: e.target.value})} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start">Start Date</Label>
                    <Input id="start" type="datetime-local" value={electionForm.startDate} onChange={(e) => setElectionForm({...electionForm, startDate: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end">End Date</Label>
                    <Input id="end" type="datetime-local" value={electionForm.endDate} onChange={(e) => setElectionForm({...electionForm, endDate: e.target.value})} required />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Create Election</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isCandidateDialogOpen} onOpenChange={setIsCandidateDialogOpen}>
            <DialogTrigger render={
              <Button variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Candidate
              </Button>
            } />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Candidate</DialogTitle>
                <DialogDescription>Add a candidate to an existing election.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddCandidate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cname">Candidate Name</Label>
                  <Input id="cname" value={candidateForm.name} onChange={(e) => setCandidateForm({...candidateForm, name: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="election">Select Election</Label>
                  <select 
                    id="election" 
                    className="w-full border rounded-md p-2 bg-background"
                    value={candidateForm.electionId}
                    onChange={(e) => setCandidateForm({...candidateForm, electionId: e.target.value})}
                    required
                  >
                    <option value="">Select an election</option>
                    {elections.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Candidate Image</Label>
                  <div className="flex items-center gap-4">
                    {candidateForm.image && (
                      <img src={candidateForm.image} alt="Preview" className="w-16 h-16 rounded-full object-cover border" referrerPolicy="no-referrer" />
                    )}
                    <label className="flex-1">
                      <div className="flex items-center justify-center w-full h-10 px-4 border-2 border-dashed rounded-md cursor-pointer hover:border-primary transition-colors">
                        {uploading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Camera className="w-4 h-4" />
                            {candidateForm.image ? 'Change Image' : 'Upload Image'}
                          </div>
                        )}
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleCandidateImageUpload} disabled={uploading} />
                    </label>
                  </div>
                  <Input id="image" placeholder="Or paste URL here..." value={candidateForm.image} onChange={(e) => setCandidateForm({...candidateForm, image: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Biography</Label>
                  <Input id="bio" value={candidateForm.bio} onChange={(e) => setCandidateForm({...candidateForm, bio: e.target.value})} />
                </div>
                <DialogFooter>
                  <Button type="submit">Add Candidate</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Elections</CardTitle>
            <ListChecks className="h-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{elections.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <Vote className="h-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{elections.filter(e => e.status === 'ongoing').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <BarChart3 className="h-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{elections.filter(e => e.status === 'upcoming').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Users className="h-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{elections.filter(e => e.status === 'completed').length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Elections</CardTitle>
          <CardDescription>View and control all elections in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {elections.map((election) => (
                <TableRow key={election._id}>
                  <TableCell className="font-medium">{election.title}</TableCell>
                  <TableCell>
                    <Badge variant={election.status === 'ongoing' ? 'default' : 'secondary'}>
                      {election.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(election.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(election.endDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right space-x-2">
                    {election.status === 'upcoming' && (
                      <Button size="sm" variant="outline" onClick={() => updateElectionStatus(election._id, 'ongoing')}>Start</Button>
                    )}
                    {election.status === 'ongoing' && (
                      <Button size="sm" variant="outline" onClick={() => updateElectionStatus(election._id, 'completed')}>Stop</Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={() => confirmDelete(election._id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the election
              and remove all associated candidates and votes from our servers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteElection}>Delete Election</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
