import { Box } from "@mui/material";

function Reminder({content, colour, description}) {

  return (
    <Box sx={{
      background: colour,
      p: 0.1,
      borderRadius: 1,
      fontFamily: "monospace",
      fontWeight: 800,
      fontSize: "1rem",
      width: "1rem",
      userSelect: "none",
      textAlign: "center"
    }}>
      {content}
    </Box>
  );
}

export default Reminder
