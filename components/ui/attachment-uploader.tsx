'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Paperclip, X, FileText, Image, File, Download, Trash2 } from 'lucide-react';
import { createAttachment, deleteAttachment } from '@/lib/db/actions/attachments';
import { uploadFile, deleteFile } from '@/lib/supabase';
import { Attachment } from '@/lib/db/schema';
import { useToast } from '@/components/ui/use-toast';

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper function to get icon based on file type
function getFileIcon(fileType: string | null | undefined) {
  if (!fileType) return <File className="h-6 w-6" />;
  
  if (fileType.startsWith('image/')) {
    return <Image className="h-6 w-6" />;
  } else if (fileType.includes('pdf')) {
    return <FileText className="h-6 w-6" />;
  } else {
    return <File className="h-6 w-6" />;
  }
}

interface AttachmentUploaderProps {
  resourceType: string; // 'asset', 'contact', etc.
  resourceId: number;
  attachments: Attachment[];
  onAttachmentsChange?: (attachments: Attachment[]) => void;
}

export function AttachmentUploader({
  resourceType,
  resourceId,
  attachments = [],
  onAttachmentsChange,
}: AttachmentUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      const file = files[0];
      
      // Validate file size (10MB limit)
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File size exceeds 10MB limit. Please choose a smaller file.`);
      }
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 5;
          return newProgress < 90 ? newProgress : prev;
        });
      }, 100);
      
      // Upload file to Supabase Storage
      const { url, error } = await uploadFile(file, 'resources', resourceType, resourceId.toString());
      
      if (error) {
        throw error;
      }
      
      if (!url) {
        throw new Error('Failed to get upload URL');
      }
      
      // Create attachment record
      const result = await createAttachment({
        name: file.name,
        fileUrl: url,
        resourceType,
        resourceId,
        fileType: file.type,
        fileSize: file.size,
      });
      
      // Clear progress interval and set to 100%
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Update local state
      const newAttachments = [...attachments, result.data];
      onAttachmentsChange?.(newAttachments);
      
      toast({
        title: 'File uploaded',
        description: `${file.name} has been uploaded successfully.`,
      });
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload file');
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload file',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (attachment: Attachment) => {
    try {
      // Delete from database first
      const result = await deleteAttachment(attachment.id);
      
      if ('error' in result) {
        throw new Error(result.error);
      }
      
      // Then delete from storage if we have the path
      if (attachment.metadata && typeof attachment.metadata === 'object') {
        const metadata = attachment.metadata as { storagePath?: string };
        if (metadata.storagePath) {
          await deleteFile(metadata.storagePath);
        }
      }
      
      // Update local state
      const newAttachments = attachments.filter(a => a.id !== attachment.id);
      onAttachmentsChange?.(newAttachments);
      
      toast({
        title: 'File deleted',
        description: `${attachment.name} has been deleted.`,
      });
    } catch (error) {
      console.error('Delete failed:', error);
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Failed to delete file',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Attachments</h3>
        <Button 
          size="sm" 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Paperclip className="mr-2 h-4 w-4" />
          Add File
        </Button>
        <Input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>
      
      {isUploading && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-center">Uploading... {uploadProgress}%</p>
        </div>
      )}
      
      {uploadError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{uploadError}</p>
        </div>
      )}
      
      {attachments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No attachments yet. Add files using the button above.</p>
      ) : (
        <div className="grid gap-2">
          {attachments.map((attachment) => (
            <Card key={attachment.id} className="overflow-hidden">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(attachment.fileType)}
                    <div>
                      <p className="font-medium text-sm">{attachment.name}</p>
                      {attachment.fileSize && (
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(attachment.fileSize)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => window.open(attachment.fileUrl, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Download</span>
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => handleDelete(attachment)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 