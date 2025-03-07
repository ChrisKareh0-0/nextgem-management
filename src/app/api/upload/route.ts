import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { mkdir } from 'fs/promises';

// POST handler for file upload
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'quotations');
    await mkdir(uploadDir, { recursive: true });

    // Create a unique filename
    const timestamp = new Date().getTime();
    const fileName = `${timestamp}-${file.name.replace(/\s+/g, '-')}`;
    const filePath = path.join(uploadDir, fileName);
    
    // Convert the file to an ArrayBuffer and then to a Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Write the file to the server
    await writeFile(filePath, buffer);
    
    // Return the path to the file, relative to the public directory
    const publicPath = `/uploads/quotations/${fileName}`;
    
    return NextResponse.json({ 
      success: true, 
      data: { path: publicPath } 
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { success: false, error: 'Error uploading file' },
      { status: 500 }
    );
  }
} 