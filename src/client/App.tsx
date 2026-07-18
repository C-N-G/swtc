import { createContext } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Container, Grid } from '@mui/material';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import Board from './components/Board.tsx';
import Phase from './components/Phase.tsx';
import Options from './components/Options.tsx';
import Character from './components/Character.tsx';
import Chat from './components/Chat.tsx';
import Player from './classes/player.ts';

import useStore from './hooks/useStore.ts';
import './App.css';
import useSocket from './hooks/useSocket.ts';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            light: '#fa5757',
            main: '#a61c1c',
            dark: '#5e0808',
            contrastText: '#fff',
        },
    },
    components: {
        // Name of the component
        MuiButton: {
            styleOverrides: {
                // Name of the slot
                root: {
                    // Some CSS
                    // fontSize: '1rem',
                },
            },
        },
    },
});

export const UserContext = createContext<Player | null>(null);

function App() {
    const addPlayerReminders = useStore((state) => state.addPlayerReminders);
    const handleDragEnd = (event: DragEndEvent) => addPlayerReminders(event);

    const user = useStore((state) => state.getUser()); // the users player object
    useSocket({ user: user });

    return (
        <ThemeProvider theme={darkTheme}>
            <DndContext onDragEnd={handleDragEnd}>
                <UserContext.Provider value={user}>
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
                </UserContext.Provider>
            </DndContext>
        </ThemeProvider>
    );
}

export default App;
