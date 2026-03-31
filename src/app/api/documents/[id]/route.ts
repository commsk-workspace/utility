import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/encryption';
import { isExpired } from '@/lib/utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Get a document by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    const document = await prisma.document.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        title: true,
        content: true,
        language: true,
        isPublic: true,
        viewPassword: true,
        editPassword: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
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

    // If document requires view password, don't return content
    if (document.viewPassword && !document.isPublic) {
      return NextResponse.json({
        success: true,
        data: {
          id: document.id,
          type: document.type,
          title: document.title,
          isPublic: document.isPublic,
          requiresViewPassword: true,
          requiresEditPassword: !!document.editPassword,
          expiresAt: document.expiresAt,
          createdAt: document.createdAt,
          updatedAt: document.updatedAt,
        },
      });
    }

    // Return document without password hashes
    return NextResponse.json({
      success: true,
      data: {
        id: document.id,
        type: document.type,
        title: document.title,
        content: document.content,
        language: document.language,
        isPublic: document.isPublic,
        requiresViewPassword: false,
        requiresEditPassword: !!document.editPassword,
        expiresAt: document.expiresAt,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch document' },
      { status: 500 }
    );
  }
}

// Update a document
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { content, title, editPassword } = body;

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

    // Verify edit password if required
    if (document.editPassword) {
      if (!editPassword) {
        return NextResponse.json(
          { success: false, error: 'Edit password required' },
          { status: 401 }
        );
      }

      const isValid = await verifyPassword(editPassword, document.editPassword);
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: 'Invalid edit password' },
          { status: 401 }
        );
      }
    }

    // Update document
    const updatedDocument = await prisma.document.update({
      where: { id },
      data: {
        content: content ?? document.content,
        title: title !== undefined ? title : document.title,
        updatedAt: new Date(),
      },
    });

    // Create new version
    if (content && content !== document.content) {
      await prisma.version.create({
        data: {
          documentId: id,
          content,
          createdBy: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedDocument.id,
        type: updatedDocument.type,
        title: updatedDocument.title,
        updatedAt: updatedDocument.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update document' },
      { status: 500 }
    );
  }
}

// Delete a document
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { editPassword } = body;

    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      );
    }

    // Verify edit password if required
    if (document.editPassword) {
      if (!editPassword) {
        return NextResponse.json(
          { success: false, error: 'Edit password required' },
          { status: 401 }
        );
      }

      const isValid = await verifyPassword(editPassword, document.editPassword);
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: 'Invalid edit password' },
          { status: 401 }
        );
      }
    }

    // Delete document (versions will be cascade deleted)
    await prisma.document.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
