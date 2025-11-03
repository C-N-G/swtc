import { OpenPhaseDialog as OpenDialog } from "../helpers/enumTypes.ts";
import Char from "../classes/char.ts";
import Role from "../classes/role.ts";
import { Fragment, useMemo, useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, List, ListItem, ListItemText, Tab, Tabs, Typography } from "@mui/material";
import NightOrders, { OrderItem } from "../helpers/nightOrders.ts";
import GameData from "../strings/_gameData.ts";

interface ScenarioDialogProps {
  openDialog: OpenDialog;
  handleClose: () => void;
  chars: Char[];
  roles: Role[];
}

function ScenarioDialog({openDialog, handleClose, chars, roles}: ScenarioDialogProps) {

  const fullOrdering = useMemo(() => NightOrders.calculateFullOrder(chars, roles), [chars, roles]);
  const [openTab, setOpenTab] = useState(0);

  function handleChange(_: unknown, newValue: number) {
    setOpenTab(newValue);
  }

  const listMaker = (ele: Char | Role, index: number) => {
    const attributes = ele.attributes.length > 0 ? <Typography variant="caption">{`[${ele.attributes.join(", ")}]`}</Typography> : "";
    const name = <Typography component="span" fontWeight="bold">{ele.name}</Typography>
    const roleIsDetrimental = ele instanceof Role && ele.type === "Detrimental";
    const team = roleIsDetrimental ? <Typography variant="caption">{ele.team}</Typography> : "";
    const spacer = !!attributes && !!team ? "-" : "";
    const primary = <Typography>{name} {spacer} {attributes} {team}</Typography>
    return (
      <ListItem disablePadding key={index}>
        <ListItemText 
          primary={primary} 
          secondary={
            <>
              {ele.ability}
              <br />
              {ele.setup.length > 0 && `- Setup: ${ele.setup.map((setup, i) => (i+1) + ": " + setup[0]).join(" ")}`}
            </>
          }
        />
      </ListItem>
    )
  }

  const nightOrderList = useMemo(() => {
    const returnList: React.ReactNode[] = [];

    let tempList: React.ReactNode[] = []; 
    let lastEle: OrderItem;
    fullOrdering.forEach((ele, index) => {

      function print(text: string, keyIndex: number) {
        returnList.push(
          <Fragment key={keyIndex + "heading"}>
            <Grid item xs={6}><Typography fontWeight="bold">{text}</Typography></Grid>
            <Grid item xs={6}>{tempList}</Grid>
          </Fragment>
        )
      }

      const different = index === 0 ? false : lastEle.order !== ele.order;

      if (different) {
        print(GameData.nightOrder[lastEle.order].description, index);
        tempList = [];
      }

      tempList.push(<Typography key={index}>{index+1} - {ele.name}</Typography>);

      if (index === fullOrdering.length-1) {
        print(GameData.nightOrder[ele.order].description, index+1);
      }

      lastEle = ele;

    })

    return (
      <Grid container spacing={4}>
        <Grid item xs={6} sx={{textAlign: "center"}}>
          <Typography variant="h5" fontWeight="bold">Ability Type</Typography>
        </Grid>
        <Grid item xs={6} sx={{textAlign: "center"}}>
        <Typography variant="h5" fontWeight="bold">Char/Role</Typography>
        </Grid>
        {returnList}
      </Grid>
    )

  }, [fullOrdering])

  const filter = (ele: Char | Role) => ele.name !== "Unknown";
  const agentFilter = (ele: Role) => ele.type === "Agent";
  const detriFilter = (ele: Role) => ele.type === "Detrimental";
  const antagFilter = (ele: Role) => ele.type === "Antagonist";

  const tabStyle = {
    borderBottom: 1, 
    borderColor: "divider", 
    mb:2, 
    position: "sticky",
    top: 0,
    zIndex: 1,
    background: "var(--sl-color-gray-5)"
  }

  const charList = chars ? chars.filter(filter).map(listMaker) : [];
  const usableRoles = roles.filter(filter);
  const agentRoleList = usableRoles ? usableRoles.filter(agentFilter).map(listMaker) : [];
  const detriRoleList = usableRoles ? usableRoles.filter(detriFilter).map(listMaker) : [];
  const antagRoleList = usableRoles ? usableRoles.filter(antagFilter).map(listMaker) : [];

  return (
    <Dialog open={openDialog === OpenDialog.Scenario} onClose={handleClose} fullWidth>
      <DialogTitle>Current Scenario</DialogTitle>
      <DialogContent>
        <Box sx={tabStyle}>
          <Tabs value={openTab} onChange={handleChange} variant="fullWidth" >
            <Tab label="Active Elements" />
            <Tab label="Night Order" />
          </Tabs>
        </Box>
        <Box hidden={openTab !== 0}>
          <Typography variant="h4">Roles: {usableRoles.length}</Typography>
          <Typography variant="h5">Agents: {agentRoleList.length}</Typography>
          <List>{agentRoleList}</List>
          <Typography variant="h5">Detrimentals: {detriRoleList.length}</Typography>
          <List>{detriRoleList}</List>
          <Typography variant="h5">Antagonists: {antagRoleList.length}</Typography>
          <List>{antagRoleList}</List>
          <Divider sx={{my: 4}} />
          <Typography variant="h4">Characteristics: {charList.length}</Typography>
          <List>{charList}</List>
        </Box>
        <Box hidden={openTab !== 1}>
          {nightOrderList}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )

}

export default ScenarioDialog;