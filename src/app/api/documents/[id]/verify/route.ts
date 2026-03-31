import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyPassword } from '@/lib/encryption';
import { isExpired } from '@/lib/utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Verify password for a document
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { password, type } = body; // type: 'view' | 'edit'

    if (!password || !type) {
      return NextResponse.json(
        { success: false, error: 'Password and type are required' },
        { status: 400 }
      );
    }

    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      );
    }

    // Check if expired
    if (isExpired(document.expiresAt)) {
      return NextResponse.json(
        { success: false, error: 'Document has expired' },
        { status: 410 }
      );
    }

    // Get the appropriate password hash
    const passwordHash = type === 'view' ? document.viewPassword : document.editPassword;

    if (!passwordHash) {
      // No password required for this type
      return NextResponse.json({
        success: true,
        data: {
          verified: true,
          content: document.content,
          canEdit: type === 'edit',
        },
      });
    }

    const isValid = await verifyPassword(password, passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Password verified, return content
    return NextResponse.json({
      success: true,
      data: {
        verified: true,
        content: document.content,
        title: document.title,
        language: document.language,
        canEdit: type === 'edit',
      },
    });
  } catch (error) {
    console.error('Error verifying password:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify password' },
      { status: 500 }
    );
  }
}
