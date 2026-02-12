'use client'

import * as React from 'react'
import { Globe, FileText, Type, Upload } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useStore } from '@/store'
import { uploadKnowledgeContentAPI } from '@/api/knowledge'

type ContentTypeOption = 'file' | 'web' | 'text'

interface AddContentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dbId: string
  onUploadComplete: () => void
}

const inputClassName =
  'w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring'

const CONTENT_TYPES: { id: ContentTypeOption; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'file', label: 'File', icon: FileText, description: 'Upload a document or file' },
  { id: 'web', label: 'Web', icon: Globe, description: 'Add content from a URL' },
  { id: 'text', label: 'Text', icon: Type, description: 'Add text content directly' }
]

export function AddContentDialog({
  open,
  onOpenChange,
  dbId,
  onUploadComplete
}: AddContentDialogProps) {
  const [step, setStep] = React.useState<'select' | 'form'>('select')
  const [contentType, setContentType] = React.useState<ContentTypeOption>('file')
  const [isUploading, setIsUploading] = React.useState(false)

  // Form fields
  const [name, setName] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [url, setUrl] = React.useState('')
  const [textContent, setTextContent] = React.useState('')
  const [file, setFile] = React.useState<File | null>(null)

  const selectedEndpoint = useStore((state) => state.selectedEndpoint)
  const authToken = useStore((state) => state.authToken)

  const resetForm = () => {
    setStep('select')
    setName('')
    setDescription('')
    setUrl('')
    setTextContent('')
    setFile(null)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) resetForm()
    onOpenChange(open)
  }

  const handleTypeSelect = (type: ContentTypeOption) => {
    setContentType(type)
    setStep('form')
  }

  const handleSubmit = async () => {
    const formData = new FormData()
    formData.append('content_type', contentType)
    if (name) formData.append('name', name)
    if (description) formData.append('description', description)

    if (contentType === 'file') {
      if (!file) {
        toast.error('Please select a file')
        return
      }
      formData.append('file', file)
      if (!name) formData.append('name', file.name)
    } else if (contentType === 'web') {
      if (!url) {
        toast.error('Please enter a URL')
        return
      }
      formData.append('url', url)
      if (!name) formData.append('name', url)
    } else if (contentType === 'text') {
      if (!textContent) {
        toast.error('Please enter some text content')
        return
      }
      formData.append('text', textContent)
      if (!name) formData.append('name', 'Text content')
    }

    setIsUploading(true)
    try {
      const result = await uploadKnowledgeContentAPI(
        selectedEndpoint,
        dbId,
        formData,
        authToken
      )

      if (result) {
        toast.success('Content added successfully')
        handleOpenChange(false)
        onUploadComplete()
      }
    } catch {
      toast.error('Failed to add content')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {step === 'select' ? 'Add Content' : `Add ${contentType.charAt(0).toUpperCase() + contentType.slice(1)} Content`}
          </DialogTitle>
        </DialogHeader>

        {step === 'select' ? (
          <div className="grid grid-cols-3 gap-3 py-4">
            {CONTENT_TYPES.map((type) => {
              const Icon = type.icon
              return (
                <button
                  key={type.id}
                  onClick={() => handleTypeSelect(type.id)}
                  className="flex flex-col items-center gap-2 rounded-lg border border-border p-4 transition-colors hover:bg-accent/50"
                >
                  <Icon className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm font-medium">{type.label}</span>
                  <span className="text-center text-xs text-muted-foreground">
                    {type.description}
                  </span>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {contentType === 'file' && (
              <div className="space-y-1.5">
                <label className="font-dmmono text-xs uppercase text-muted">
                  File
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className={inputClassName}
                  />
                </div>
              </div>
            )}

            {contentType === 'web' && (
              <div className="space-y-1.5">
                <label className="font-dmmono text-xs uppercase text-muted">
                  URL
                </label>
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/page"
                  type="url"
                  className={inputClassName}
                />
              </div>
            )}

            {contentType === 'text' && (
              <div className="space-y-1.5">
                <label className="font-dmmono text-xs uppercase text-muted">
                  Content
                </label>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Enter your text content..."
                  rows={6}
                  className={inputClassName}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="font-dmmono text-xs uppercase text-muted">
                Name (optional)
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Content name"
                className={inputClassName}
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-dmmono text-xs uppercase text-muted">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description"
                rows={2}
                className={inputClassName}
              />
            </div>

            <div className="flex justify-between pt-2">
              <Button
                variant="ghost"
                onClick={() => setStep('select')}
              >
                Back
              </Button>
              <Button
                variant="outline"
                onClick={handleSubmit}
                disabled={isUploading}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                {isUploading ? 'Uploading...' : 'Add Content'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
