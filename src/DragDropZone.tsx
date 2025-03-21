import { ChangeEvent, useRef, useState } from 'react';

const DragDropZone: React.FC<{
  maxFilesError?: string;
  storeFilesForUpload: (files: FileList) => void;
}> = ({ maxFilesError, storeFilesForUpload }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent<HTMLDivElement | HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      storeFilesForUpload(e.dataTransfer.files);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length) {
      storeFilesForUpload(e.target.files);
    }
  };

  const onChooseFilesButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div>
      <div>
        <form
          id="multiFileUpload"
          onDragEnter={handleDrag}
          onSubmit={(e) => e.preventDefault()}
        >
          <fieldset>
            <div>
              {maxFilesError && (
                <p id="multiFileUploadForm-error">
                  <span className="visually-hidden">Error:</span> {maxFilesError}
                </p>
              )}
              <input
                ref={inputRef}
                type="file"
                id="multiFileUploadInput"
                data-testid="multiFileUploadInput"
                multiple
                onChange={handleChange}
              />
              <label
                className={dragActive ? 'file-upload-dropzone drag-active' : 'file-upload-dropzone'}
                htmlFor="multiFileUploadInput"
              >
                <div>
                  <p>Drag and drop files here or</p>
                  <button
                    type="button"
                    onClick={onChooseFilesButtonClick}
                  >
                    Choose files
                  </button>
                </div>
              </label>
              {dragActive && (
                <div
                  id="dragFileElement"
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                />
              )}
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
};

export default DragDropZone;
