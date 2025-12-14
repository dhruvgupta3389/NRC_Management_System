import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            return NextResponse.json(
                { error: 'Supabase configuration missing' },
                { status: 500 }
            );
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        // Parse the multipart form data
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const patientId = formData.get('patientId') as string || 'temp';
        const uploadType = formData.get('type') as string || 'photos'; // 'docs' or 'photos'
        const documentType = formData.get('documentType') as string || ''; // e.g., 'aadhaar', 'birth_certificate'

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        const allowedDocTypes = ['application/pdf', ...allowedImageTypes];
        const allowedTypes = uploadType === 'docs' ? allowedDocTypes : allowedImageTypes;

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}` },
                { status: 400 }
            );
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File size exceeds 5MB limit' },
                { status: 400 }
            );
        }

        // Generate unique filename
        const timestamp = Date.now();
        const fileExt = file.name.split('.').pop() || 'jpg';
        const sanitizedDocType = documentType ? `${documentType}_` : '';
        const fileName = `${sanitizedDocType}${timestamp}.${fileExt}`;

        // Create the storage path: patients/{patientId}/{type}/{filename}
        const storagePath = `patients/${patientId}/${uploadType}/${fileName}`;

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('patient-images')
            .upload(storagePath, buffer, {
                contentType: file.type,
                upsert: false
            });

        if (uploadError) {
            console.error('❌ Upload error:', uploadError);
            return NextResponse.json(
                { error: `Upload failed: ${uploadError.message}` },
                { status: 500 }
            );
        }

        // Get the public URL
        const { data: urlData } = supabase.storage
            .from('patient-images')
            .getPublicUrl(storagePath);

        const publicUrl = urlData.publicUrl;

        console.log(`✅ File uploaded successfully: ${storagePath}`);

        return NextResponse.json({
            success: true,
            url: publicUrl,
            path: storagePath,
            fileName: fileName,
            type: uploadType,
            documentType: documentType || undefined,
            uploadedAt: new Date().toISOString()
        }, { status: 200 });

    } catch (err) {
        console.error('❌ Unexpected upload error:', err);
        return NextResponse.json(
            { error: 'Internal server error during upload' },
            { status: 500 }
        );
    }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
    return NextResponse.json({}, { status: 200 });
}
