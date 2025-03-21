import React, { useEffect, useRef, useState, ChangeEvent } from 'react';
import { FileGrid } from './FileGrid';

// Define the FileItem interface
interface FileItem {
  id: string;
  file: File;
  filename: string;
  previewUrl: string;
}

// Main DragDropZone component
export const DragDropZone: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const MAX_FILES = 10;
  const LOCAL_STORAGE_KEY = 'uploadedFiles';

  // Load files from local storage on initial render
  useEffect(() => {
    const storedFilesJson = localStorage.getItem(LOCAL_STORAGE_KEY);
    console.log(storedFilesJson)
    if (storedFilesJson) {
      try {
        const storedMetadata = JSON.parse(storedFilesJson);
        // We can't restore actual File objects, but we can show the info
        if (storedMetadata.length > 0) {
          console.log('Metadata from previous session loaded');
          // We'll just show empty files for demonstration
          setFiles(storedMetadata);
        }
      } catch (e) {
        console.error('Error parsing stored files', e);
      }
    }
  }, []);

  // Save files metadata to local storage whenever they change
  useEffect(() => {
    if (files.length > 0) {
      const filesForStorage = files.map(({ file, ...rest }) => ({
        ...rest,
        fileType: file.type,
        fileSize: file.size,
      }));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filesForStorage));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [files]);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });
    };
  }, []);

  // Handle drag events
  const handleDrag = (e: React.DragEvent<HTMLDivElement | HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle dropping files
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      addFiles(e.dataTransfer.files);
    }
  };

  // Handle file input change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length) {
      addFiles(e.target.files);
    }
  };

  // Process files and add them to state
  const addFiles = (fileList: FileList) => {
    const errorList: string[] = [];
    setErrors([]);

    // Check for exceeding max files
    if (files.length >= MAX_FILES) {
      const errorMsg = `You've already uploaded the maximum of ${MAX_FILES} files`;
      setErrors([errorMsg]);
      return;
    }

    if (files.length + fileList.length > MAX_FILES) {
      const remainingFilesAvailable = MAX_FILES - files.length;
      const errorMsg = `You've selected too many files: you can add up to ${remainingFilesAvailable} more files`;
      setErrors([errorMsg]);
      return;
    }

    // Process each file
    const newFiles = Array.from(fileList).reduce<FileItem[]>((results, fileToCheck) => {
      // Check for duplicate files
      const isDuplicate = files.some(
        (existingFile) => existingFile.filename === fileToCheck.name
      );

      if (isDuplicate) {
        errorList.push(`A file called ${fileToCheck.name} already exists in your list`);
      } else {
        results.push({
          id: crypto.randomUUID(), // Generate unique ID for each file
          file: fileToCheck,
          filename: fileToCheck.name,
          previewUrl: createPreviewUrl(fileToCheck)
        });
      }

      return results;
    }, []);

    // Update state with new files and any errors
    setFiles([...files, ...newFiles]);
    setErrors(errorList);
  };

  // Create preview URL for files
  const createPreviewUrl = (file: File): string => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return '/api/placeholder/64/64'; // Placeholder for non-image files
  };

  // Delete a file
  const handleDelete = (id: string) => {
    const fileToDelete = files.find(file => file.id === id);

    // Revoke object URL to prevent memory leaks
    if (fileToDelete && fileToDelete.previewUrl) {
      URL.revokeObjectURL(fileToDelete.previewUrl);
    }

    setFiles(files.filter(file => file.id !== id));
  };

  // Button to open file chooser
  const onChooseFilesButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="file-uploader">
      <h1 className="heading-xl">Upload files</h1>

      {errors.length > 0 && (
        <div role="alert" className="error-container">
          <ul>
            {errors.map((error) => (
              <li key={error}>
                <span className="visually-hidden">Error:</span> {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      <form
        onDragEnter={handleDrag}
        onSubmit={(e) => e.preventDefault()}
      >
        <fieldset>
          <div className="upload-container">
            <input
              ref={inputRef}
              type="file"
              id="multiFileUploadInput"
              data-testid="multiFileUploadInput"
              multiple
              onChange={handleChange}
              style={{ display: 'none' }}
            />
            <label
              className={dragActive ? 'file-upload-dropzone drag-active' : 'file-upload-dropzone'}
              htmlFor="multiFileUploadInput"
            >
              <div>
                <p>Drag and drop files here or</p>
                <button
                  type="button"
                  className="choose-files-button"
                  onClick={onChooseFilesButtonClick}
                >
                  Choose files
                </button>
              </div>
            </label>
            {dragActive && (
              <div
                className="drag-overlay"
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              />
            )}
          </div>
        </fieldset>
      </form>

      {files.length > 0 && (
        <div>
          <h2 className="heading-m">Files added</h2>
          <FileGrid files={files} handleDelete={handleDelete} />
        </div>
      )}
    </div>
  );
};
