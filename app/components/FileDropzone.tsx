'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';

export interface UploadedFile {
    url: string;
    fileName: string;
    type: string;
    documentType?: string;
    uploadedAt: string;
}

interface FileDropzoneProps {
    onUpload: (file: UploadedFile) => void;
    onRemove?: (index: number) => void;
    uploadedFiles?: UploadedFile[];
    patientId?: string;
    uploadType: 'docs' | 'photos';
    documentType?: string;
    accept?: string;
    maxFiles?: number;
    label?: string;
    description?: string;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({
    onUpload,
    onRemove,
    uploadedFiles = [],
    patientId = 'temp',
    uploadType,
    documentType,
    accept = 'image/*',
    maxFiles = 5,
    label = 'Drop files here',
    description = 'or click to browse'
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const uploadFile = async (file: File) => {
        setIsUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('patientId', patientId);
            formData.append('type', uploadType);
            if (documentType) {
                formData.append('documentType', documentType);
            }

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Upload failed');
            }

            onUpload({
                url: result.url,
                fileName: result.fileName,
                type: result.type,
                documentType: result.documentType,
                uploadedAt: result.uploadedAt
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Upload failed';
            setError(message);
            console.error('Upload error:', err);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (uploadedFiles.length >= maxFiles) {
            setError(`Maximum ${maxFiles} files allowed`);
            return;
        }

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            await uploadFile(files[0]);
        }
    }, [uploadedFiles.length, maxFiles, patientId, uploadType, documentType]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            if (uploadedFiles.length >= maxFiles) {
                setError(`Maximum ${maxFiles} files allowed`);
                return;
            }
            await uploadFile(files[0]);
        }
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const isImage = (url: string) => {
        return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
    };

    return (
        <div className="space-y-3">
            {/* Dropzone */}
            <div
                onClick={handleClick}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-all duration-200 ease-in-out
          ${isDragging
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
                    }
          ${isUploading ? 'pointer-events-none opacity-60' : ''}
        `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    onChange={handleFileSelect}
                    className="hidden"
                />

                <div className="flex flex-col items-center space-y-2">
                    {isUploading ? (
                        <>
                            <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
                            <p className="text-sm text-gray-600">Uploading...</p>
                        </>
                    ) : (
                        <>
                            <Upload className={`w-10 h-10 ${isDragging ? 'text-green-500' : 'text-gray-400'}`} />
                            <p className="text-sm font-medium text-gray-700">{label}</p>
                            <p className="text-xs text-gray-500">{description}</p>
                        </>
                    )}
                </div>
            </div>

            {/* Error message */}
            {error && (
                <p className="text-sm text-red-600 flex items-center">
                    <X className="w-4 h-4 mr-1" />
                    {error}
                </p>
            )}

            {/* Uploaded files preview */}
            {uploadedFiles.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {uploadedFiles.map((file, index) => (
                        <div
                            key={index}
                            className="relative group bg-gray-100 rounded-lg overflow-hidden border border-gray-200"
                        >
                            {isImage(file.url) ? (
                                <img
                                    src={file.url}
                                    alt={file.fileName}
                                    className="w-full h-24 object-cover"
                                />
                            ) : (
                                <div className="w-full h-24 flex items-center justify-center bg-gray-100">
                                    <FileText className="w-10 h-10 text-gray-400" />
                                </div>
                            )}

                            {/* File info overlay */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                                {onRemove && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemove(index);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-all duration-200"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Document type label */}
                            {file.documentType && (
                                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs px-2 py-1 truncate">
                                    {file.documentType.replace('_', ' ')}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FileDropzone;
