import React from 'react';
import { useDrop } from 'react-dnd';
import { ItemTypes } from './dndTypes';

export const UnifiedDropZone = ({ 
  index, 
  moveSection, 
  movePage, 
  sectionSlug = null,
  className = "",
  children,
  combinedList = [],
  sections = []
}) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: [ItemTypes.SECTION, ItemTypes.PAGE],
    drop: (item) => {
      if (item.type === ItemTypes.SECTION) {
        // Use the drop zone index as the root insertion index
        // This represents the position in combinedList where the section should be inserted
        const rootInsertIndex = index;
        
        // Handle section drop
        moveSection(item.sectionSlug, rootInsertIndex);
      } else if (item.type === ItemTypes.PAGE) {
        // Handle page drop - move to top/bottom or specific section
        if (movePage) {
          movePage(item, index, sectionSlug, 'after', true);
        }
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });

  const getDropZoneStyle = () => {
    let backgroundColor = 'transparent';
    let border = '1px dashed transparent';
    let height = '10px';

    if (isOver && canDrop) {
      backgroundColor = '#e3f2fd';
      border = '2px dashed #2196f3';
      height = '20px';
    } else if (canDrop) {
      border = '1px dashed #ddd';
    }

    return {
      height,
      backgroundColor,
      border,
      transition: 'all 0.2s ease',
      margin: '2px 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      color: '#666',
      borderRadius: '4px'
    };
  };

  return (
    <div
      ref={drop}
      className={className}
      style={getDropZoneStyle()}
    >
      {isOver && canDrop && (
        <span style={{ opacity: 0.7 }}>
          Drop here
        </span>
      )}
      {children}
    </div>
  );
};
