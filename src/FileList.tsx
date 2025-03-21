import {
  FileStatusError,
  FileStatusInProgress,
  FileStatusPending,
  FileStatusSuccess,
} from './FileStatus';

export interface FileItem {
  file: File;
  filename: string;
  status: 'Pending' | 'In progress' | 'Success' | 'Error';
  errorMessage?: string;
}

const FileList: React.FC<{
  files: FileItem[];
  handleDelete: (fileName: string) => void;
}> = ({ files, handleDelete }) => (
  <>
    {files.map((file) => (
      <div key={file.filename} className="multi-file-upload--filelist">
        <div>
          {file.status === 'In progress' && <FileStatusInProgress fileName={file.filename} />}
          {file.status === 'Pending' && <FileStatusPending fileName={file.filename} />}
          {file.status === 'Success' && <FileStatusSuccess fileName={file.filename} />}
          {file.status === 'Error' && <FileStatusError fileName={file.filename} errorMessage={file.errorMessage || ''} />}
        </div>
        <div>
          <button
            type="button"
            onClick={() => handleDelete(file.filename)}
          >
            Delete
          </button>
        </div>
      </div>
    ))}
  </>
);

export default FileList;
