// src/components/admin/products/ProductDeleteModal.tsx

'use client';

import React from 'react';
import { colors } from '@/config/colors';
import { AlertTriangle, X, Trash2, Loader2 } from 'lucide-react';

interface ProductDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  productName: string;
  loading?: boolean;
}

export default function ProductDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  productName,
  loading = false,
}: ProductDeleteModalProps) {
  if (!isOpen) return null;

  const styles = {
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
    },
    modal: {
      backgroundColor: colors.background,
      borderRadius: colors.radius.xl,
      width: '100%',
      maxWidth: '450px',
      boxShadow: colors.shadow.xl,
      overflow: 'hidden',
    },
    header: {
      padding: '1.5rem 2rem',
      borderBottom: `1px solid ${colors.border}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.surface,
    },
    title: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: colors.text.primary,
    },
    closeButton: {
      padding: '0.5rem',
      borderRadius: colors.radius.md,
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      color: colors.text.secondary,
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: {
      padding: '2rem',
    },
    iconContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '1.5rem',
    },
    icon: {
      padding: '1rem',
      backgroundColor: colors.error[50],
      borderRadius: '50%',
      color: colors.error[500],
    },
    message: {
      textAlign: 'center' as const,
      marginBottom: '0.5rem',
    },
    messageText: {
      color: colors.text.primary,
      fontSize: '1rem',
      fontWeight: 500,
    },
    messageSubtext: {
      color: colors.text.secondary,
      fontSize: '0.875rem',
      marginTop: '0.5rem',
    },
    productName: {
      fontWeight: 600,
      color: colors.error[700],
    },
    footer: {
      padding: '1.5rem 2rem',
      borderTop: `1px solid ${colors.border}`,
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '0.75rem',
      backgroundColor: colors.surface,
    },
    button: {
      padding: '0.625rem 1.5rem',
      borderRadius: colors.radius.md,
      border: 'none',
      cursor: 'pointer',
      fontWeight: 500,
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    buttonSecondary: {
      backgroundColor: colors.surface,
      color: colors.text.secondary,
      border: `1px solid ${colors.border}`,
    },
    buttonDanger: {
      backgroundColor: colors.error[500],
      color: 'white',
    },
    buttonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>Delete Product</h3>
          <button style={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.body}>
          <div style={styles.iconContainer}>
            <div style={styles.icon}>
              <AlertTriangle size={32} />
            </div>
          </div>

          <div style={styles.message}>
            <p style={styles.messageText}>
              Are you sure you want to delete <span style={styles.productName}>"{productName}"</span>?
            </p>
            <p style={styles.messageSubtext}>
              This action cannot be undone. All product data will be permanently removed.
            </p>
          </div>
        </div>

        <div style={styles.footer}>
          <button
            onClick={onClose}
            style={{
              ...styles.button,
              ...styles.buttonSecondary,
            }}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              ...styles.button,
              ...styles.buttonDanger,
              ...(loading ? styles.buttonDisabled : {}),
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={18} />
                Delete Product
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}