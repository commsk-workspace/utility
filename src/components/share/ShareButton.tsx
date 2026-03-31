'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Share2,
  Link,
  Twitter,
  Facebook,
  Linkedin,
  Copy,
  MessageCircle,
  Mail,
  QrCode,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { copyToClipboard } from '@/lib/utils';

interface ShareButtonProps {
  title: string;
  description?: string;
  url?: string;
  content?: string;
  hashtags?: string[];
  className?: string;
}

export function ShareButton({
  title,
  description = '',
  url = typeof window !== 'undefined' ? window.location.href : '',
  content = '',
  hashtags = ['DevTools'],
  className = '',
}: ShareButtonProps) {
  const { toast } = useToast();
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [showContentDialog, setShowContentDialog] = useState(false);

  const shareUrl = encodeURIComponent(url);
  const shareTitle = encodeURIComponent(title);
  const shareDesc = encodeURIComponent(description);
  const hashtagStr = hashtags.map(h => h.replace('#', '')).join(',');

  const handleCopyLink = async () => {
    await copyToClipboard(url);
    toast({ title: 'Link Copied!', description: 'Link copied to clipboard.' });
  };

  const handleCopyContent = async () => {
    await copyToClipboard(content);
    toast({ title: 'Copied!', description: 'Content copied to clipboard.' });
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
      } catch (err) {
        // User cancelled or error
      }
    }
  };

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}&hashtags=${hashtagStr}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
    line: `https://social-plugins.line.me/lineit/share?url=${shareUrl}&text=${shareTitle}`,
    email: `mailto:?subject=${shareTitle}&body=${shareDesc}%0A%0A${shareUrl}`,
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={className}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <>
              <DropdownMenuItem onClick={handleNativeShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share...
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          
          <DropdownMenuItem onClick={handleCopyLink}>
            <Link className="h-4 w-4 mr-2" />
            Copy Link
          </DropdownMenuItem>
          
          {content && (
            <DropdownMenuItem onClick={() => setShowContentDialog(true)}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Content
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem asChild>
            <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer">
              <Twitter className="h-4 w-4 mr-2" />
              Twitter
            </a>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer">
              <Facebook className="h-4 w-4 mr-2" />
              Facebook
            </a>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer">
              <Linkedin className="h-4 w-4 mr-2" />
              LinkedIn
            </a>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <a href={shareLinks.line} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4 mr-2" />
              LINE
            </a>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <a href={shareLinks.email}>
              <Mail className="h-4 w-4 mr-2" />
              Email
            </a>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setShowQRDialog(true)}>
            <QrCode className="h-4 w-4 mr-2" />
            QR Code
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code</DialogTitle>
            <DialogDescription>
              Scan this QR code to open this page
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center p-4">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${shareUrl}`}
              alt="QR Code"
              className="rounded-lg"
              width={200}
              height={200}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQRDialog(false)}>
              Close
            </Button>
            <Button asChild>
              <a
                href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${shareUrl}&format=png`}
                download="qrcode.png"
              >
                Download
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Content Copy Dialog */}
      <Dialog open={showContentDialog} onOpenChange={setShowContentDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Copy Content</DialogTitle>
            <DialogDescription>
              Copy the content below to share
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={content}
              readOnly
              className="min-h-[200px] font-mono text-sm"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContentDialog(false)}>
              Close
            </Button>
            <Button onClick={handleCopyContent}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
