import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { surveysApi, type SurveysListParams, type SurveysListResponse, type SurveyResponse, type SurveyCreateRequest, type SurveyUpdateRequest, type SubmitAnswersRequest } from '../api/surveys';
import { toast } from 'react-toastify';

// Query keys for surveys
export const surveysKeys = {
  all: ['surveys'] as const,
  // include status and surveyType in the key so queries are differentiated
  list: (params?: SurveysListParams) => [
    ...surveysKeys.all,
    'list',
    params?.page ?? 1,
    params?.limit ?? 10,
    params?.status ?? null,
    params?.surveyType ?? null,
    params?.responded ?? null,
  ] as const,
  detail: (id: string) => [...surveysKeys.all, 'detail', id] as const,
  // New key for user answers
  userAnswers: () => [...surveysKeys.all, 'user_answers'] as const,
};

// List surveys
export function useSurveysList(params: SurveysListParams = { page: 1, limit: 10, surveyType: undefined }) {
  return useQuery<SurveysListResponse>({
    queryKey: surveysKeys.list(params),
    queryFn: () => surveysApi.list(params),
    placeholderData: keepPreviousData,
  });
}

// Get single survey by id
export function useSurvey(surveyId: string, enabled: boolean = true) {
  return useQuery<SurveyResponse>({
    queryKey: surveysKeys.detail(surveyId),
    queryFn: () => surveysApi.getById(surveyId),
    enabled: !!surveyId && enabled,
  });
}

// New: fetch surveys the current user has answered
export function useUserSurveyAnswers(enabled: boolean = true) {
  return useQuery<SurveysListResponse>({
    queryKey: surveysKeys.userAnswers(),
    queryFn: () => surveysApi.userAnswers(),
    enabled,
  });
}

// Create survey
export function useCreateSurvey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SurveyCreateRequest) => surveysApi.create(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: surveysKeys.all });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to create survey';
      toast.error(msg);
    },
  });
}

// Update survey
export function useUpdateSurvey(surveyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SurveyUpdateRequest) => surveysApi.update(surveyId, payload),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: surveysKeys.detail(surveyId) }),
        qc.invalidateQueries({ queryKey: surveysKeys.all }),
      ]);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to update survey';
      toast.error(msg);
    },
  });
}

// Update only status for any survey id
export function useUpdateSurveyStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ surveyId, status }: { surveyId: string; status: 'active' | 'paused' | 'archived' }) =>
      surveysApi.update(surveyId, { status } as any),
    onSuccess: async () => {
      toast.success('Survey status updated');
      await qc.invalidateQueries({ queryKey: surveysKeys.all });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to update status';
      toast.error(msg);
    },
  });
}

// Delete survey
export function useDeleteSurvey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (surveyId: string) => surveysApi.remove(surveyId),
    onSuccess: async (_data, surveyId) => {
      toast.success('Survey deleted successfully');
      await Promise.all([
        qc.invalidateQueries({ queryKey: surveysKeys.all }),
        qc.invalidateQueries({ queryKey: surveysKeys.detail(surveyId) }),
      ]);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to delete survey';
      toast.error(msg);
    },
  });
}

// Submit answers for a survey
export function useSubmitSurveyAnswers(surveyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubmitAnswersRequest) => surveysApi.submitAnswers(surveyId, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: surveysKeys.detail(surveyId) });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to submit answers';
      toast.error(msg);
    },
  });
}
