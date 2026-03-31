import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Get version history for a document
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if document exists
    const document = await prisma.document.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!document) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      );
    }

    // Get versions
    const versions = await prisma.version.findMany({
      where: { documentId: id },
      select: {
        id: true,
        content: true,
        createdAt: true,
        createdBy: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to last 50 versions
    });

    return NextResponse.json({
      success: true,
      data: versions.map((v, index) => ({
        ...v,
        versionNumber: versions.length - index,
        contentPreview: v.content.substring(0, 200) + (v.content.length > 200 ? '...' : ''),
      })),
    });
  } catch (error) {
    console.error('Error fetching versions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch versions' },
      { status: 500 }
    );
  }
}
