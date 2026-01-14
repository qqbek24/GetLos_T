import React, { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { ICONS } from '@/config/icons'
import './FileUpload.css'

export interface UploadedFile {
  file: File
  id: number
  name: string
  size: number
  type: string
  preview: string | null
}

export interface FileUploadLabels {
  dragDrop?: string
  dropHere?: string
  supported?: string
  uploadedFiles?: string
  fileTooLarge?: string
  invalidFileType?: string
  uploadError?: string
  maxFilesExceeded?: string
}

interface FileUploadProps {
  onFilesChange: (files: UploadedFile[]) => void
  maxFiles?: number
  maxSize?: number
  clearFiles?: boolean
  labels?: FileUploadLabels
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFilesChange, 
  maxFiles = 10, 
  maxSize = 10 * 1024 * 1024, 
  clearFiles = false, 
  labels = {} 
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [uploadError, setUploadError] = useState<string>('')

  // Clear files when parent component requests it
  useEffect(() => {
    if (clearFiles) {
      setFiles([])
      setUploadError('')
      onFilesChange([])
    }
  }, [clearFiles, onFilesChange])

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setUploadError('')
    
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0]
      if (error.code === 'file-too-large') {
        setUploadError(
          labels.fileTooLarge 
            ? labels.fileTooLarge.replace('{{maxSize}}', String(maxSize / 1024 / 1024))
            : `Plik jest za duży. Maksymalny rozmiar to ${maxSize / 1024 / 1024}MB`
        )
      } else if (error.code === 'file-invalid-type') {
        setUploadError(labels.invalidFileType || 'Nieprawidłowy typ pliku. Wgraj tylko CSV pliki.')
      } else {
        setUploadError(labels.uploadError || 'Błąd podczas przesyłania pliku. Spróbuj ponownie.')
      }
      return
    }

    // Handle accepted files
    if (files.length + acceptedFiles.length > maxFiles) {
      setUploadError(
        labels.maxFilesExceeded 
          ? labels.maxFilesExceeded.replace('{{maxFiles}}', String(maxFiles))
          : `Maksymalnie ${maxFiles} plików dozwolone`
      )
      return
    }

    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file,
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }))

    const updatedFiles = [...files, ...newFiles]
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }, [files, maxFiles, maxSize, onFilesChange, labels])

  const removeFile = (fileId: number) => {
    const updatedFiles = files.filter(f => f.id !== fileId)
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)
    
    // Clean up preview URLs
    const fileToRemove = files.find(f => f.id === fileId)
    if (fileToRemove && fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize,
    multiple: false // Dla CSV/JSON potrzebujemy tylko jednego pliku
  })

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="file-upload">
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''} ${uploadError ? 'error' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="dropzone-content">
          <div className="upload-icon">
            <ICONS.UploadFileIcon 
              sx={{ 
                fontSize: 48,
                transition: 'all 0.3s ease'
              }} 
            />
          </div>
          {isDragActive ? (
            <p>{labels.dropHere || 'Upuść pliki tutaj...'}</p>
          ) : (
            <div>
              <p>{labels.dragDrop || 'Przeciągnij i upuść pliki tutaj, lub kliknij aby wybrać pliki'}</p>
              <p className="file-info">
                {labels.supported 
                  ? labels.supported
                      .replace('{{maxSize}}', String(maxSize / 1024 / 1024))
                      .replace('{{maxFiles}}', String(maxFiles))
                  : `Obsługiwane: CSV, PDF, JPG, PNG (max ${maxSize / 1024 / 1024}MB każdy, ${maxFiles} plików)`
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {uploadError && (
        <div className="upload-error">
          {uploadError}
        </div>
      )}

      {files.length > 0 && (
        <div className="uploaded-files">
          <h4>
            {labels.uploadedFiles
              ? labels.uploadedFiles
                  .replace('{{count}}', String(files.length))
                  .replace('{{maxFiles}}', String(maxFiles))
              : `Wgrane pliki (${files.length}/${maxFiles})`
            }
          </h4>
          <div className="file-list">
            {files.map((fileItem) => (
              <div key={fileItem.id} className="file-item">
                <div className="file-info">
                  {fileItem.preview ? (
                    <img 
                      src={fileItem.preview} 
                      alt={fileItem.name}
                      className="file-preview"
                    />
                  ) : (
                    <div className="file-icon">
                      {fileItem.type === 'text/csv' ? (
                        <ICONS.DescriptionIcon sx={{ fontSize: 32, color: '#4caf50' }} />
                      ) : fileItem.type === 'application/json' ? (
                        <ICONS.AttachFileOutlinedIcon sx={{ fontSize: 32, color: '#ff6f00' }} />
                      ) : fileItem.type === 'application/pdf' ? (
                        <ICONS.DescriptionIcon sx={{ fontSize: 32, color: '#d32f2f' }} />
                      ) : (
                        <ICONS.AttachFileOutlinedIcon sx={{ fontSize: 32, color: '#b0bec5' }} />
                      )}
                    </div>
                  )}
                  <div className="file-details">
                    <div className="file-name">{fileItem.name}</div>
                    <div className="file-size">{formatFileSize(fileItem.size)}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(fileItem.id)}
                  className="remove-file"
                  aria-label="Remove file"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FileUpload
