import {Box} from "@mui/material";
import {default as ReminderClass} from "../classes/reminder.ts";

interface ReminderProps {
  reminder: ReminderClass
}

function Reminder({reminder}: ReminderProps) {

  return (
    <Box 
      sx={{
        background: reminder.colour,
        p: 0.1,
        borderRadius: 1,
        fontFamily: "monospace",
        fontWeight: 800,
        fontSize: "1rem",
        height: "1.4rem",
        aspectRatio: "1/1",
        userSelect: "none",
        textAlign: "center",
      }}
    >
      {reminder.content}
    </Box>
  );
}

export default Reminder
