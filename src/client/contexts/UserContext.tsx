import { createContext, ReactNode, useContext, useMemo } from 'react';
import Player from '../classes/player';
import useStore from '../hooks/useStore';

const UserContext = createContext<{ user: Player | null }>({ user: null });

interface UserContextProviderProps {
    children: ReactNode | ReactNode[];
}

const UserContextProvider = ({ children }: UserContextProviderProps) => {
    const user = useStore((state) => state.getUser());

    const value = useMemo(() => ({ user }), [user]);

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

const useUserContext = () => {
    const user = useContext(UserContext);
    return user;
};

// eslint-disable-next-line react-refresh/only-export-components
export { UserContextProvider, useUserContext };
