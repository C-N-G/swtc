import { ReactNode } from 'react';
import { DragAndDropProvider } from './DragAndDropContext';
import { ThemeContextProvider } from './ThemeContext';
import { UserContextProvider } from './UserContext';

interface RootStoreProvider {
    children: ReactNode | ReactNode[];
}
const RootStoreProvider = ({ children }: RootStoreProvider) => {
    return (
        <ThemeContextProvider>
            <DragAndDropProvider>
                <UserContextProvider>{children}</UserContextProvider>
            </DragAndDropProvider>
        </ThemeContextProvider>
    );
};

export default RootStoreProvider;
