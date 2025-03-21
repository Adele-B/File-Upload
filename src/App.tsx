import { FormEvent, useEffect, useState } from 'react'
import './App.css'
import DragDropZone from './DragDropZone';
import FileList, { FileItem } from './FileList';

const MAX_FILES = 10;
const LOCAL_STORAGE_KEY = 'uploadedFiles';

const App: React.FC = () => {
  const [filesAddedForUpload, setFilesAddedForUpload] = useState<FileItem[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [maxFilesError, setMaxFilesError] = useState<string>();

  // Load files from local storage on initial render
  useEffect(() => {
    const storedFiles = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedFiles) {
      setFilesAddedForUpload(JSON.parse(storedFiles));
    }
  }, []);

  // Save files to local storage whenever they change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filesAddedForUpload));
  }, [filesAddedForUpload]);

  const storeFilesForUpload = (fileList: FileList) => {
    const fileCurrentlyInState = [...filesAddedForUpload];
    const filesUserAdded = Array.from(fileList);
    const errorList: string[] = [];
    setMaxFilesError(undefined);
    setErrors([]);

    // Check we do not exceed max file count
    const remainingFilesAvailable = MAX_FILES - fileCurrentlyInState.length;

    if (fileCurrentlyInState.length === MAX_FILES) {
      const errorMsg = `You've selected too many files: you can add up to ${remainingFilesAvailable} more files`;
      setMaxFilesError(errorMsg);
      setErrors([errorMsg]);
    } else if (fileList.length > MAX_FILES) {
      const errorMsg = `You've selected too many files: you can only add ${MAX_FILES}`;
      setMaxFilesError(errorMsg);
      setErrors([errorMsg]);
    } else {
      const newFilesForUpload = filesUserAdded.reduce<FileItem[]>((results, fileToCheck) => {
        // Check for duplicate files
        const isDuplicate = fileCurrentlyInState.some(
          (existingFile) => existingFile.filename === fileToCheck.name
        );

        if (isDuplicate) {
          errorList.push(`A file called ${fileToCheck.name} already exists in your list`);
        } else {
          results.push({
            file: fileToCheck,
            filename: fileToCheck.name,
            status: 'Pending'
          });
        }

        return results;
      }, []);

      // Update state with new files and any errors
      setFilesAddedForUpload([...fileCurrentlyInState, ...newFilesForUpload]);
      setErrors(errorList);
    }
  };

  const handleDelete = (fileName: string) => {
    const filtered = filesAddedForUpload.filter((file) => file.filename !== fileName);
    setFilesAddedForUpload(filtered);
  };

  const onUploadFiles = (e: FormEvent) => {
    e.preventDefault();

    // Simulate upload process with type-safe mapping
    const updatedFiles: FileItem[] = filesAddedForUpload.map(file => {
      if (file.status === 'Pending') {
        // Simulate file upload with random success/failure
        const shouldSucceed = Math.random() > 0.2; // 80% success rate
        return {
          ...file,
          status: shouldSucceed ? 'Success' : 'Error',
          errorMessage: shouldSucceed ? undefined : 'Upload failed'
        };
      }
      return file;
    });

    setFilesAddedForUpload(updatedFiles);
  };

  const onContinue = (e: FormEvent) => {
    e.preventDefault();
    // Add any continue logic here
    console.log('Continuing with files:', filesAddedForUpload);
  };

  return (
    <>
      <div>
        {errors.length > 0 && (
          <div role="alert">
            <ul>
              {errors.map((error) => (
                <li key={error}>
                  <span className="visually-hidden">Error:</span> {error}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div>
        <h1 className="heading-xl">Upload files</h1>
      </div>

      <DragDropZone
        maxFilesError={maxFilesError}
        storeFilesForUpload={storeFilesForUpload}
      />

      <div>
        {(filesAddedForUpload.length > 0) && <h2 className="heading-m">Files added</h2>}
        <FileList
          files={filesAddedForUpload}
          handleDelete={handleDelete}
        />

        <div>
          <button
            type="button"
            onClick={onUploadFiles}
            disabled={filesAddedForUpload.length === 0}
          >
            Upload files
          </button>

          <button
            type="button"
            onClick={onContinue}
          >
            Save and continue
          </button>
        </div>
      </div>
    </>
  );
};

export default App
