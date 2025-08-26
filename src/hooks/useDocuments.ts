import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { documentsApi, type DocumentsListParams, type DocumentsListResponse, type DocumentResponse, type DocumentCreateRequest, type DocumentUpdateRequest } from '../api/documents';
import { toast } from 'react-toastify';

// Query keys for documents
export const documentsKeys = {
  all: ['documents'] as const,
  list: (params?: DocumentsListParams) => [
    ...documentsKeys.all,
    'list',
    params?.page ?? 1,
    params?.limit ?? 10,
    params?.projectId ?? 'all',
    params?.userId ?? 'all-users',
  ] as const,
  detail: (id: string) => [...documentsKeys.all, 'detail', id] as const,
};

// List documents
export function useDocumentsList(params: DocumentsListParams = { page: 1, limit: 10 }) {
  return useQuery<DocumentsListResponse>({
    queryKey: documentsKeys.list(params),
    queryFn: () => documentsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

// List documents for a specific user (fetches only when userId is available)
export function useUserDocuments(userId?: string | null, params: Omit<DocumentsListParams, 'userId'> = { page: 1, limit: 10 }) {
  const finalParams: DocumentsListParams | undefined = userId
    ? { ...params, userId }
    : undefined;

  return useQuery<DocumentsListResponse>({
    queryKey: documentsKeys.list(finalParams ?? { ...params, userId: 'pending' }),
    queryFn: () => documentsApi.list(finalParams as DocumentsListParams),
    enabled: !!userId,
    placeholderData: keepPreviousData,
  });
}

// Get single document by id
export function useDocument(documentId: string, enabled: boolean = true) {
  return useQuery<DocumentResponse>({
    queryKey: documentsKeys.detail(documentId),
    queryFn: () => documentsApi.getById(documentId),
    enabled: !!documentId && enabled,
  });
}

// Create document
export function useCreateDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: DocumentCreateRequest) => documentsApi.create(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: documentsKeys.all });
    },
  });
}

// Update document
export function useUpdateDocument(documentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: DocumentUpdateRequest) => documentsApi.update(documentId, payload),
    onSuccess: async () => {
      toast.success('Document updated successfully');
      await Promise.all([
        qc.invalidateQueries({ queryKey: documentsKeys.detail(documentId) }),
        qc.invalidateQueries({ queryKey: documentsKeys.all }),
      ]);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to update document';
      toast.error(msg);
    },
  });
}

// Delete document
export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => documentsApi.remove(documentId),
    onSuccess: async (_data, documentId) => {
      toast.success('Document deleted successfully');
      await Promise.all([
        qc.invalidateQueries({ queryKey: documentsKeys.all }),
        qc.invalidateQueries({ queryKey: documentsKeys.detail(documentId) }),
      ]);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to delete document';
      toast.error(msg);
    },
  });
}
