import {useDraggable} from '@dnd-kit/core';

interface DraggableProps {
  draggableId: string;
  children: React.ReactNode;
}

function Draggable(props: DraggableProps) {
  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: props.draggableId,
  });
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {props.children}
    </div>
  );
}

export default Draggable