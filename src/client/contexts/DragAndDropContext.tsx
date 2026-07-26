import { ReactNode } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import useStore from '../hooks/useStore';

interface DragAndDropProviderProps {
    children: ReactNode | ReactNode[];
}

const DragAndDropProvider = ({ children }: DragAndDropProviderProps) => {
    const addPlayerReminders = useStore((state) => state.addPlayerReminders);
    const handleDragEnd = (event: DragEndEvent) => addPlayerReminders(event);
    return <DndContext onDragEnd={handleDragEnd}>{children}</DndContext>;
};

export { DragAndDropProvider };
