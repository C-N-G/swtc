import { Container, Grid } from '@mui/material';
import Board from './components/Board.tsx';
import Phase from './components/Phase.tsx';
import Options from './components/Options.tsx';
import Character from './components/Character.tsx';
import Chat from './components/Chat.tsx';

import './App.css';
import useSocket from './hooks/useSocket.ts';
import RootStoreProvider from './contexts/RootContext.tsx';

function App() {
    useSocket();

    return (
        <RootStoreProvider>
            <Container sx={{ maxWidth: '1440px' }}>
                <Grid container spacing={2}>
                    <Grid item xs={8}>
                        <Phase />
                    </Grid>
                    <Grid item xs={4}>
                        <Options />
                    </Grid>
                    <Grid item xs={8}>
                        <Board />
                    </Grid>
                    <Grid item xs={4}>
                        <Character />
                        <Chat />
                    </Grid>
                </Grid>
            </Container>
        </RootStoreProvider>
    );
}

export default App;
