import { OpenPhaseDialog as OpenDialog } from "../helpers/enumTypes.ts";
import Char from "../classes/char.ts";
import Role from "../classes/role.ts";
import useStore from "../hooks/useStore.ts";
import { Fragment, useMemo, useState } from "react";
import NightOrders from "../helpers/nightOrders.ts";
import { Button, Checkbox, Collapse, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, ListItemButton, ListItemText, Typography } from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

interface NightOrderDialogProps {
  openDialog: OpenDialog;
  handleClose: () => void;
  chars: Char[];
  roles: Role[];
}

function NightOrderDialog({openDialog, handleClose, chars, roles}: NightOrderDialogProps) {

  const players = useStore(state => state.players);
  const ordering = useMemo(() => NightOrders.calculateOrder(players, chars, roles), [players, chars, roles]);
  const [openState, setOpenState] = useState(new Set());
  const addPurgedOrder = useStore(state => state.addPurgedOrder);
  const removePurgedOrders = useStore(state => state.removePurgedOrders);
  const purgedOrders = useStore(state => state.purgedOrders);
  const completedOrders = useStore(state => state.completedOrders);
  const addCompletedOrder = useStore(state => state.addCompletedOrder);
  const removeCompletedOrder = useStore(state => state.removeCompletedOrder);
  const removeAllCompletedOrders = useStore(state => state.removeAllCompletedOrders);

  

  function handleOpenClick(id: string) {

    setOpenState(state => {
      if (state.has(id)) {
        state.delete(id);
      } else {
        state.clear();
        state.add(id);
      }
      return new Set(state);
    })

  }

  function handleCheckClick(id: string) {
    if (completedOrders.has(id)) {
      removeCompletedOrder(id);
    } else {
      addCompletedOrder(id);
    }
  }

  function handlePurgeClick(index: number, event: React.MouseEvent<HTMLSpanElement, MouseEvent>, id: string) {

    addPurgedOrder(event, index, ordering, chars, roles);

    if (openState.has(id)) {
      setOpenState(new Set());
    }
    
  }

  function handleResetClick() {
    removePurgedOrders(chars, roles, ordering);
    removeAllCompletedOrders();
  }


  let placedIndex = 0;
  const playerList = ordering.map((nightOrder, index) => {

    let attrLong, attribute;
    if (nightOrder.type === "char") {
      attrLong = "Characteristic";
      attribute = chars[players[nightOrder.playerIndex].rChar];
    } else if(nightOrder.type === "role") {
      attrLong = "Role";
      attribute = roles[players[nightOrder.playerIndex].rRole];
    } else throw Error("error rendering night orders, night order type not found");

    const removed = purgedOrders.includes(JSON.stringify(ordering[index])) ? true : false;

    if (!removed) placedIndex++;

    const displayIndex = removed ? "?" : placedIndex;

    const name = `#${displayIndex} - ${players[nightOrder.playerIndex].name} - ${attribute.name}`;

    const button = (
      <Button
        component={"span"} 
        variant="text" 
        size="small" 
        sx={{mr: 1}}
        onClick={(event) => handlePurgeClick(index, event, nightOrder.id)}
      >
        {removed ? "undo" : "remove"}
      </Button>
    )

    return (
      <Fragment key={"orderListKey" + index + nightOrder.name}>
        <ListItem secondaryAction={button} disablePadding >
          <Checkbox 
            checked={completedOrders.has(nightOrder.id) || removed}
            onChange={() => handleCheckClick(nightOrder.id)}
            disabled={removed}/>
          <ListItemButton disabled={removed} onClick={() => handleOpenClick(nightOrder.id)}>
            {openState.has(nightOrder.id) ? <ExpandLess /> : <ExpandMore />}
            <ListItemText primary={name} sx={removed ? {textDecoration: "line-through", color: "rgb(255, 0, 0)"} : {}}/>
          </ListItemButton>
        </ListItem>
        <Collapse in={openState.has(nightOrder.id)} timeout="auto" unmountOnExit>
          <Typography component={"span"}>{attrLong} Ability: {attribute.ability}</Typography>
        </Collapse>
      </Fragment>
    )
  })

  return (
    <Dialog open={openDialog === OpenDialog.NightOrder} onClose={handleClose} fullWidth>
      <DialogTitle>Night Order List</DialogTitle>
      <DialogContent>
        <List>
          {playerList}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleResetClick}>Reset</Button>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

export default NightOrderDialog;