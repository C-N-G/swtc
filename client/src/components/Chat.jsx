// import { useState } from 'react'
import {Card} from '@mui/material';

function Chat({children}) {

  return (
    <Card sx={{
      background: "lightcyan", 
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
