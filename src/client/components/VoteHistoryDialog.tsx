import { useState } from 'react';
import { OpenCharacterDialog as OpenDialog } from '../helpers/enumTypes.ts';
import useStore from '../hooks/useStore.ts';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Tab, Tabs } from '@mui/material';
import VoteHistoryDay from './VoteHistoryDay.tsx';

type StateArray = boolean[];

interface VoteHistoryDialogProps {
  openDialog: OpenDialog;
  setOpenDialog: React.Dispatch<React.SetStateAction<OpenDialog>>;
}

function VoteHistoryDialog({openDialog, setOpenDialog}: VoteHistoryDialogProps) {

  const [openState, setOpenState] = useState<StateArray>(Array(32).fill(false));
  const voteHistory = useStore(state => state.voteHistory)
  const round = useStore(state => state.phase.round);
  const [openTab, setOpenTab] = useState(0);

  const tabStyle = {
    borderBottom: 1, 
    borderColor: "divider", 
    mb:2, 
    position: "sticky",
    top: 0,
    zIndex: 1,
    background: "white"
  }

  function handleChange(_: React.SyntheticEvent<Element, Event>, newValue: number) {
    setOpenTab(newValue);
  }

  function handleOpenClick(index: number) {
    setOpenState(state => {
      const newState = !state[index];
      state = state.fill(false);
      state[index] = newState;
      return [...state];
    })
  }

  const todaysVoteHistory = voteHistory.filter(item => item.day === round);
  const yesterdaysVoteHistory = voteHistory.filter(item => item.day === round-1);

  return (
    <Dialog open={openDialog === OpenDialog.VoteHistory} onClose={() => setOpenDialog(OpenDialog.None)} fullWidth >
      <DialogTitle>Voting History</DialogTitle>
      <DialogContent>
        <Box sx={tabStyle}>
          <Tabs value={openTab} onChange={handleChange} variant="fullWidth" >
            <Tab label="Today" />
            <Tab label="Yesterday" />
          </Tabs>
        </Box>
        <Box hidden={openTab !== 0}>
          <VoteHistoryDay 
            historyArray={todaysVoteHistory}
            handleOpenClick={handleOpenClick}
            openState={openState}
          />
        </Box>
        <Box hidden={openTab !== 1}>
          <VoteHistoryDay 
            historyArray={yesterdaysVoteHistory}
            handleOpenClick={handleOpenClick}
            openState={openState}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={() => setOpenDialog(OpenDialog.None)}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

export default VoteHistoryDialog;