'use client';

import React, { useState } from 'react';
import { FileText, ChevronDown } from 'lucide-react';
import FileDropzone, { UploadedFile } from './FileDropzone';

export interface DocumentItem {
    type: string;
    label: string;
    url: string;
    uploadedAt: string;
}

interface DocumentUploadProps {
    documents: DocumentItem[];
    onDocumentsChange: (documents: DocumentItem[]) => void;
    patientId?: string;
}

const DOCUMENT_TYPES = [
    { value: 'aadhaar', label: 'Aadhaar Card' },
    { value: 'birth_certificate', label: 'Birth Certificate' },
    { value: 'ration_card', label: 'Ration Card' },
    { value: 'prescription', label: "Doctor's Prescription" },
    { value: 'medical_report', label: 'Medical Report' },
    { value: 'other', label: 'Other Document' }
];

const DocumentUpload: React.FC<DocumentUploadProps> = ({
    documents,
    onDocumentsChange,
    patientId = 'temp'
}) => {
    const [selectedType, setSelectedType] = useState(DOCUMENT_TYPES[0].value);

    const handleUpload = (file: UploadedFile) => {
        const typeInfo = DOCUMENT_TYPES.find(t => t.value === selectedType);
        const newDoc: DocumentItem = {
            type: selectedType,
            label: typeInfo?.label || selectedType,
            url: file.url,
            uploadedAt: file.uploadedAt
        };
        onDocumentsChange([...documents, newDoc]);
    };

    const handleRemove = (index: number) => {
        const updated = documents.filter((_, i) => i !== index);
        onDocumentsChange(updated);
    };

    // Convert documents to UploadedFile format for FileDropzone
    const uploadedFiles: UploadedFile[] = documents.map(doc => ({
        url: doc.url,
        fileName: doc.url.split('/').pop() || '',
        type: 'docs',
        documentType: doc.label,
        uploadedAt: doc.uploadedAt
    }));

    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h4 className="text-md font-medium text-gray-900">Identity Documents</h4>
            </div>

            {/* Document Type Selector */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Type
                </label>
                <div className="relative">
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none bg-white"
                    >
                        {DOCUMENT_TYPES.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
            </div>

            {/* Drag and Drop Zone */}
            <FileDropzone
                onUpload={handleUpload}
                onRemove={handleRemove}
                uploadedFiles={uploadedFiles}
                patientId={patientId}
                uploadType="docs"
                documentType={selectedType}
                accept="image/*,.pdf"
                maxFiles={10}
                label={`Drop ${DOCUMENT_TYPES.find(t => t.value === selectedType)?.label || 'document'} here`}
                description="Supports images and PDFs (max 5MB)"
            />

            {/* Document List */}
            {documents.length > 0 && (
                <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">
                        {documents.length} document{documents.length > 1 ? 's' : ''} uploaded
                    </p>
                    <div className="space-y-2">
                        {documents.map((doc, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-2 bg-blue-50 rounded-md border border-blue-100"
                            >
                                <div className="flex items-center space-x-2">
                                    <FileText className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-800">{doc.label}</span>
                                </div>
                                <a
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                                >
                                    View
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentUpload;
