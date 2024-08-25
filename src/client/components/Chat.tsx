import {Card} from '@mui/material';

interface ChatProps {
  children: React.ReactNode;
}

function Chat({children}: ChatProps) {

  return (
    <Card sx={{
      background: "var(--sl-color-gray-5)", 
      borderLeft: "2px solid var(--sl-color-accent)",
      boxSizing: "border-box",
      width: "100%",
      height: "28%",
      flexGrow: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.3rem',
      flexDirection: "column",
      gap: "10px",
      mt: 2
    }}>
      {children}
    </Card>
  );
}

export default Chat
