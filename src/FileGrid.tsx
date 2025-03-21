import { useEffect, useRef, useState } from "react";

export interface FileItem {
  file: File;
  filename: string;
  errorMessage?: string;
  previewUrl?: string;
  id: string
}

export const FileGrid: React.FC<{
  files: FileItem[];
  handleDelete: (id: string) => void;
}> = ({ files, handleDelete }) => {
  const [items, setItems] = useState<FileItem[]>(files);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Update items when files prop changes
  useEffect(() => {
    setItems(files);
  }, [files]);

  // Handle drag start
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    // Save initial position
    dragItem.current = index;
    setDraggedId(items[index].id);

    // Set ghost image (optional)
    if (e.dataTransfer.setDragImage && e.currentTarget.querySelector('.file-preview')) {
      const preview = e.currentTarget.querySelector('.file-preview') as HTMLElement;
      e.dataTransfer.setDragImage(preview, 0, 0);
    }

    // Add dragging class after a short delay for animation
    setTimeout(() => {
      if (e.currentTarget.classList.contains('file-card')) {
        e.currentTarget.classList.add('dragging');
      }
    }, 0);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    dragOverItem.current = index;

    // Add visual feedback while dragging over
    const fileCards = gridRef.current?.querySelectorAll('.file-card');
    fileCards?.forEach(card => card.classList.remove('drag-over'));

    const currentCard = fileCards?.[index];
    if (currentCard && dragItem.current !== index) {
      currentCard.classList.add('drag-over');
    }

    // Animate the reordering during drag
    if (dragItem.current !== null && dragItem.current !== index) {
      // Create new array with reordered items
      const newItems = [...items];
      const draggedItem = newItems[dragItem.current];

      // Remove item from old position and add to new position
      newItems.splice(dragItem.current, 1);
      newItems.splice(index, 0, draggedItem);

      // Update the state with new order
      setItems(newItems);

      // Update the current position
      dragItem.current = index;
    }
  };

  // Handle drag end
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('dragging');
    setDraggedId(null);

    // Clean up visual feedback
    const fileCards = gridRef.current?.querySelectorAll('.file-card');
    fileCards?.forEach(card => card.classList.remove('drag-over'));

    // Reset refs
    dragItem.current = null;
    dragOverItem.current = null;
  };

  return (
    <div
      className="file-grid"
      ref={gridRef}
    >
      {items.map((file, index) => (
        <div
          key={file.id}
          className={`file-card ${draggedId === file.id ? 'dragging' : ''}`}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
        >
          <div className="file-preview">
            {file.file?.type?.startsWith('image/') ? (
              <img
                src={file.previewUrl}
                alt={file.filename}
                className="preview-image"
              />
            ) : (
              <div className="file-icon">
                <svg viewBox="0 0 24 24" width="48" height="48">
                  <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="#E0E0E0" />
                  <path d="M14 8V2L20 8H14Z" fill="#BDBDBD" />
                </svg>
              </div>
            )}
          </div>

          <div className="file-info">
            <div className="file-filename">{file.filename}</div>
            <div className="file-actions">
              <button
                type="button"
                className="delete-button"
                onClick={() => handleDelete(file.id)}
                aria-label={`Delete ${file.filename}`}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
