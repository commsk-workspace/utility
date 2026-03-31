'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Copy, Check, QrCode, Loader2, Link2, Lock, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getShareUrl, getExpiryOptions, copyToClipboard } from '@/lib/utils';
import QRCode from 'qrcode';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
  type: string;
  title?: string;
  language?: string;
}

export function ShareDialog({
  open,
  onOpenChange,
  content,
  type,
  title,
  language,
}: ShareDialogProps) {
  const { toast } = useToast();
  const [isPublic, setIsPublic] = useState(true);
  const [viewPassword, setViewPassword] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [expiresIn, setExpiresIn] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [showViewPassword, setShowViewPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  const expiryOptions = getExpiryOptions();

  const handleShare = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title,
          content,
          language,
          viewPassword: isPublic ? '' : viewPassword,
          editPassword,
          isPublic,
          expiresIn,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create share link');
      }

      const url = getShareUrl(result.data.id);
      setShareUrl(url);

      // Generate QR code
      const qr = await QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: {
          dark: '#ffffff',
          light: '#00000000',
        },
      });
      setQrCode(qr);

      toast({
        title: 'Share link created!',
        description: 'You can now share this link with others.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create share link',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    await copyToClipboard(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Copied!',
      description: 'Share link copied to clipboard.',
    });
  };

  const handleClose = () => {
    setShareUrl('');
    setQrCode('');
    setViewPassword('');
    setEditPassword('');
    setExpiresIn('');
    setIsPublic(true);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Share Document
          </DialogTitle>
          <DialogDescription>
            Create a shareable link with optional password protection.
          </DialogDescription>
        </DialogHeader>

        {!shareUrl ? (
          <div className="space-y-4">
            {/* Public/Private Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Public Access</Label>
                <p className="text-xs text-muted-foreground">
                  Anyone with the link can view
                </p>
              </div>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>

            {/* View Password (only if not public) */}
            {!isPublic && (
              <div className="space-y-2">
                <Label htmlFor="viewPassword">View Password</Label>
                <div className="relative">
                  <Input
                    id="viewPassword"
                    type={showViewPassword ? 'text' : 'password'}
                    placeholder="Required to view"
                    value={viewPassword}
                    onChange={(e) => setViewPassword(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowViewPassword(!showViewPassword)}
                  >
                    {showViewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Edit Password */}
            <div className="space-y-2">
              <Label htmlFor="editPassword">
                Edit Password
                <span className="text-xs text-muted-foreground ml-2">(optional)</span>
              </Label>
              <div className="relative">
                <Input
                  id="editPassword"
                  type={showEditPassword ? 'text' : 'password'}
                  placeholder="Required to make changes"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowEditPassword(!showEditPassword)}
                >
                  {showEditPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Expiry */}
            <div className="space-y-2">
              <Label>Expires After</Label>
              <Select value={expiresIn} onValueChange={setExpiresIn}>
                <SelectTrigger>
                  <SelectValue placeholder="Select expiry time" />
                </SelectTrigger>
                <SelectContent>
                  {expiryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Share URL */}
            <div className="space-y-2">
              <Label>Share Link</Label>
              <div className="flex gap-2">
                <Input value={shareUrl} readOnly className="font-mono text-sm" />
                <Button onClick={handleCopy} variant="outline" size="icon">
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* QR Code */}
            {qrCode && (
              <div className="flex flex-col items-center gap-2 p-4 bg-muted rounded-lg">
                <img src={qrCode} alt="QR Code" className="w-32 h-32" />
                <p className="text-xs text-muted-foreground">Scan to open</p>
              </div>
            )}

            {/* Info */}
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="flex items-center gap-2">
                {isPublic ? (
                  <>
                    <Eye className="h-4 w-4" />
                    Public - Anyone can view
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Private - Password required to view
                  </>
                )}
              </p>
              {editPassword && (
                <p className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Edit password protected
                </p>
              )}
              {expiresIn && (
                <p className="flex items-center gap-2">
                  Expires: {expiryOptions.find(o => o.value === expiresIn)?.label}
                </p>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          {!shareUrl ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleShare} disabled={isLoading || (!isPublic && !viewPassword)}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Link2 className="h-4 w-4 mr-2" />
                    Create Link
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
