'use client';
import React, { useState, useRef } from 'react';
import { colors } from '@/config/colors';
import { Upload, X } from 'lucide-react';
import { validators } from '@/utils/validators';

interface ProductImageUploadProps {
  onImagesChange: (files: File[]) => void;
  existingImages?: string[];
  onRemoveExisting?: (index: number) => void;
  maxImages?: number;
}

export default function ProductImageUpload({
  onImagesChange,
  existingImages = [],
  onRemoveExisting,
  maxImages = 10,
}: ProductImageUploadProps) {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalImages = existingImages.length + images.length;

  const handleFileSelect = (files: FileList | null): void => {
    if (!files) return;
    
    const newErrors: string[] = [];
    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    Array.from(files).forEach((file: File) => {
      const error = validators.imageFile(file);
      if (error) {
        newErrors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
        newPreviews.push(URL.createObjectURL(file));
      }
    });

    if (totalImages + validFiles.length > maxImages) {
      newErrors.push(`Maximum ${maxImages} images allowed`);
    } else {
      const updatedImages = [...images, ...validFiles];
      const updatedPreviews = [...previews, ...newPreviews];
      setImages(updatedImages);
      setPreviews(updatedPreviews);
      onImagesChange(updatedImages);
    }

    setErrors(newErrors);
  };

  const handleRemoveImage = (index: number): void => {
    const updatedImages = images.filter((_: File, i: number) => i !== index);
    const updatedPreviews = previews.filter((_: string, i: number) => i !== index);
    setImages(updatedImages);
    setPreviews(updatedPreviews);
    onImagesChange(updatedImages);
    URL.revokeObjectURL(previews[index]);
  };

  const handleRemoveExisting = (index: number): void => {
    if (onRemoveExisting) {
      onRemoveExisting(index);
    }
  };

  const styles = {
    container: {
      border: `2px dashed ${colors.border}`,
      borderRadius: colors.radius.lg,
      padding: '1.5rem',
      backgroundColor: colors.surface,
      transition: 'all 0.2s',
    },
    uploadArea: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      cursor: 'pointer',
      border: `2px dashed ${colors.border}`,
      borderRadius: colors.radius.md,
      backgroundColor: colors.background,
      transition: 'all 0.2s',
    },
    uploadIcon: {
      color: colors.text.muted,
      marginBottom: '0.5rem',
    },
    uploadText: {
      color: colors.text.secondary,
      fontSize: '0.875rem',
      textAlign: 'center' as const,
    },
    uploadSubtext: {
      color: colors.text.muted,
      fontSize: '0.75rem',
      marginTop: '0.25rem',
    },
    imageGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
      gap: '1rem',
      marginTop: '1rem',
    },
    imageContainer: {
      position: 'relative' as const,
      borderRadius: colors.radius.md,
      overflow: 'hidden',
      aspectRatio: '1',
      backgroundColor: colors.surface,
      border: `1px solid ${colors.border}`,
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover' as const,
    },
    removeButton: {
      position: 'absolute' as const,
      top: '0.25rem',
      right: '0.25rem',
      padding: '0.25rem',
      backgroundColor: colors.error[500],
      color: 'white',
      border: 'none',
      borderRadius: colors.radius.sm,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s',
    },
    error: {
      color: colors.error[500],
      fontSize: '0.875rem',
      marginTop: '0.5rem',
    },
    imageCount: {
      color: colors.text.muted,
      fontSize: '0.75rem',
      marginTop: '0.5rem',
      textAlign: 'right' as const,
    },
  };

  return (
    <div style={styles.container}>
      <div
        style={styles.uploadArea}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e: React.DragEvent) => {
          e.preventDefault();
          (e.currentTarget as HTMLDivElement).style.borderColor = colors.primary[500];
        }}
        onDragLeave={(e: React.DragEvent) => {
          e.preventDefault();
          (e.currentTarget as HTMLDivElement).style.borderColor = colors.border;
        }}
        onDrop={(e: React.DragEvent) => {
          e.preventDefault();
          (e.currentTarget as HTMLDivElement).style.borderColor = colors.border;
          handleFileSelect(e.dataTransfer.files);
        }}
      >
        <Upload size={40} style={styles.uploadIcon} />
        <p style={styles.uploadText}>
          Drag & drop images here or click to browse
        </p>
        <p style={styles.uploadSubtext}>
          Supports JPEG, PNG, WEBP, SVG (Max 5MB each)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileSelect(e.target.files)}
          style={{ display: 'none' }}
        />
      </div>

      {errors.length > 0 && (
        <div style={styles.error}>
          {errors.map((error: string, index: number) => (
            <div key={index}>{error}</div>
          ))}
        </div>
      )}

      {(existingImages.length > 0 || previews.length > 0) && (
        <div style={styles.imageGrid}>
          {existingImages.map((url: string, index: number) => (
            <div key={`existing-${index}`} style={styles.imageContainer}>
              <img src={url} alt={`Product ${index + 1}`} style={styles.image} />
              <button
                onClick={() => handleRemoveExisting(index)}
                style={styles.removeButton}
              >
                <X size={14} />
              </button>
            </div>
          ))}
          {previews.map((preview: string, index: number) => (
            <div key={`preview-${index}`} style={styles.imageContainer}>
              <img src={preview} alt={`Upload ${index + 1}`} style={styles.image} />
              <button
                onClick={() => handleRemoveImage(index)}
                style={styles.removeButton}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={styles.imageCount}>
        {totalImages} / {maxImages} images
      </div>
    </div>
  );
}