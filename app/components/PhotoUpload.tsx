'use client';

import React from 'react';
import { Camera } from 'lucide-react';
import FileDropzone, { UploadedFile } from './FileDropzone';

export interface PhotoItem {
    url: string;
    uploadedAt: string;
}

interface PhotoUploadProps {
    photos: PhotoItem[];
    onPhotosChange: (photos: PhotoItem[]) => void;
    patientId?: string;
    maxPhotos?: number;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({
    photos,
    onPhotosChange,
    patientId = 'temp',
    maxPhotos = 5
}) => {
    const handleUpload = (file: UploadedFile) => {
        const newPhoto: PhotoItem = {
            url: file.url,
            uploadedAt: file.uploadedAt
        };
        onPhotosChange([...photos, newPhoto]);
    };

    const handleRemove = (index: number) => {
        const updated = photos.filter((_, i) => i !== index);
        onPhotosChange(updated);
    };

    // Convert photos to UploadedFile format for FileDropzone
    const uploadedFiles: UploadedFile[] = photos.map(photo => ({
        url: photo.url,
        fileName: photo.url.split('/').pop() || '',
        type: 'photos',
        uploadedAt: photo.uploadedAt
    }));

    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-2">
                <Camera className="w-5 h-5 text-purple-600" />
                <h4 className="text-md font-medium text-gray-900">Patient Photos</h4>
            </div>

            <p className="text-sm text-gray-600">
                Upload photos of the patient for identification and medical records.
            </p>

            {/* Drag and Drop Zone */}
            <FileDropzone
                onUpload={handleUpload}
                onRemove={handleRemove}
                uploadedFiles={uploadedFiles}
                patientId={patientId}
                uploadType="photos"
                accept="image/*"
                maxFiles={maxPhotos}
                label="Drop patient photos here"
                description={`Supports JPG, PNG, WebP (max ${maxPhotos} photos)`}
            />

            {/* Photo count */}
            {photos.length > 0 && (
                <p className="text-sm text-gray-600">
                    {photos.length} of {maxPhotos} photos uploaded
                </p>
            )}
        </div>
    );
};

export default PhotoUpload;
