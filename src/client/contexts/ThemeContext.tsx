import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ReactNode } from 'react';

const themeValue = createTheme({
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

interface ThemeContextProviderProps {
    children: ReactNode | ReactNode[];
}

const ThemeContextProvider = ({ children }: ThemeContextProviderProps) => {
    return <ThemeProvider theme={themeValue}>{children}</ThemeProvider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export { ThemeContextProvider };
