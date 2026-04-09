import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface Election {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'ongoing' | 'completed';
}

interface ElectionState {
  elections: Election[];
  currentElection: Election | null;
  loading: boolean;
  error: string | null;
}

const initialState: ElectionState = {
  elections: [],
  currentElection: null,
  loading: false,
  error: null,
};

export const fetchElections = createAsyncThunk('election/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get('/api/elections');
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch elections');
  }
});

const electionSlice = createSlice({
  name: 'election',
  initialState,
  reducers: {
    setCurrentElection: (state, action: PayloadAction<Election>) => {
      state.currentElection = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchElections.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchElections.fulfilled, (state, action: PayloadAction<Election[]>) => {
        state.loading = false;
        state.elections = action.payload;
      })
      .addCase(fetchElections.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setCurrentElection } = electionSlice.actions;
export default electionSlice.reducer;
