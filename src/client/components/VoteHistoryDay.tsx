import { Collapse, List, ListItem, ListItemButton, ListItemText, Typography } from "@mui/material";
import { VoteHistoryItem } from "../helpers/storeTypes";
import { Fragment } from "react/jsx-runtime";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

interface VoteHistoryDayProps {
  historyArray: VoteHistoryItem[];
  handleOpenClick: (index: number) => void;
  openState: Set<number>;
}

function VoteHistoryDay({historyArray, handleOpenClick, openState}: VoteHistoryDayProps) {

  const todaysPlayersThatVoted = new Set();
  const todaysMostVotedPlayer: {votes: number, name: string | null} = {votes: 0, name: null};

  const todaysVoteHistory = historyArray.map((item, index) => {

    if (item.voterTotal > todaysMostVotedPlayer.votes) {
      todaysMostVotedPlayer.votes = item.voterTotal;
      todaysMostVotedPlayer.name = item.nominated;
    } else if (item.voterTotal === todaysMostVotedPlayer.votes) {
      todaysMostVotedPlayer.name = null;
    }
  
    const voterList = item.votes.map((aVote, index) => {
      const voted = aVote.vote === 1;
      if (voted) todaysPlayersThatVoted.add(aVote.name);
      const showPower = aVote.power !== 1
      return (
        <Typography key={index} component={"span"} sx={{
          backgroundColor: voted ? "springgreen" : "indianred",
          p: 0.5,
          borderRadius: 1,
          mr: "0.5rem"
        }}>
          {`${aVote.name} ${showPower ? "x" + String(aVote.power) : ""}`}
        </Typography>
      )
    })

    return (
      <Fragment key={index}>
        <ListItem disablePadding >
          <ListItemButton onClick={() => handleOpenClick(index)}>
            {openState.has(index) ? <ExpandLess /> : <ExpandMore />}
            <ListItemText primary={`#${index+1}. (${item.accuser}) nominated (${item.nominated}) - ${item.voterTotal} vs ${item.abstainerTotal}`} />
          </ListItemButton>
        </ListItem>
        <Collapse in={openState.has(index)} timeout="auto" unmountOnExit>
          <Typography>{voterList}</Typography>
        </Collapse>
      </Fragment>
    )
  })

  const hasMostVotedPlayer = todaysMostVotedPlayer.name !== null;

  const totalPotentialVoters = historyArray[0]?.votes.length;
  const passedThreshold = todaysMostVotedPlayer !== null ? todaysMostVotedPlayer.votes >= Math.ceil(totalPotentialVoters/2) : false;
  const threshold = `${todaysMostVotedPlayer.votes}/${Math.ceil(totalPotentialVoters/2)}`;

  if (!hasMostVotedPlayer) todaysMostVotedPlayer.name = "Inconclusive";
  else todaysMostVotedPlayer.name = "(" + todaysMostVotedPlayer.name + ")";


  return (<>
    <Typography >Most Voted Player: {todaysMostVotedPlayer.name}</Typography>
    {hasMostVotedPlayer ? <Typography >Has enough votes for dismissal? {passedThreshold ? `Yes ${threshold}` : "no"}</Typography> : ""}
    <Typography >Players that have Voted: {Array.from(todaysPlayersThatVoted).join(", ")}</Typography>
    <List>
      {todaysVoteHistory}
    </List>
  </>)
}

export default VoteHistoryDay