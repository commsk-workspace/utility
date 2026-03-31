import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { hashPassword } from '@/lib/encryption';
import { calculateExpiryDate } from '@/lib/utils';

// Create a new document
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      title,
      content,
      language,
      viewPassword,
      editPassword,
      isPublic = true,
      expiresIn,
    } = body;

    if (!type || !content) {
      return NextResponse.json(
        { success: false, error: 'Type and content are required' },
        { status: 400 }
      );
    }

    // Hash passwords if provided
    const hashedViewPassword = viewPassword ? await hashPassword(viewPassword) : null;
    const hashedEditPassword = editPassword ? await hashPassword(editPassword) : null;

    // Calculate expiry date
    const expiresAt = expiresIn ? calculateExpiryDate(expiresIn) : null;

    const document = await prisma.document.create({
      data: {
        type,
        title: title || null,
        content,
        language: language || null,
        viewPassword: hashedViewPassword,
        editPassword: hashedEditPassword,
        isPublic,
        expiresAt,
      },
    });

    // Create initial version
    await prisma.version.create({
      data: {
        documentId: document.id,
        content,
        createdBy: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: document.id,
        type: document.type,
        title: document.title,
        isPublic: document.isPublic,
        hasViewPassword: !!document.viewPassword,
        hasEditPassword: !!document.editPassword,
        expiresAt: document.expiresAt,
        createdAt: document.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create document' },
      { status: 500 }
    );
  }
}

// List recent documents (for admin purposes, not exposed to UI)
export async function GET() {
  try {
    const documents = await prisma.document.findMany({
      where: {
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      select: {
        id: true,
        type: true,
        title: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ success: true, data: documents });
  } catch (error) {
    console.error('Error listing documents:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list documents' },
      { status: 500 }
    );
  }
}
