import React, { type ReactNode } from 'react';
import { Draggable } from '@hello-pangea/dnd';

interface DraggableWidgetProps {
    id: string;
    index: number;
    children: ReactNode;
    className?: string;
}

const DraggableWidget: React.FC<DraggableWidgetProps> = ({ id, index, children, className = '' }) => {
    return (
        <Draggable draggableId={id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`${className} ${snapshot.isDragging ? 'opacity-75 shadow-lg scale-[1.02] z-50' : ''} transition-all duration-200`}
                    style={{
                         ...provided.draggableProps.style,
                    }}
                >
                    {children}
                </div>
            )}
        </Draggable>
    );
};

export default DraggableWidget;
