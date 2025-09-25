import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { surveysApi, type SurveysListParams, type SurveysListResponse, type SurveyResponse, type SurveyCreateRequest, type SurveyUpdateRequest, type SubmitAnswersRequest, type SurveyResponsesList, type SurveyAnalytics, type ResponseDetailResponse } from '../api/surveys';
import { toast } from 'react-toastify';
import { offlineSurveyApi } from '@/api-offline/surveys';

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
    params?.search ?? null,
  ] as const,
  detail: (id: string) => [...surveysKeys.all, 'detail', id] as const,
  responses: (id?: string, responderId?: string, page?: number, limit?: number, surveyType?: 'report-form' | 'general' | 'rapid-enquiry', search?: string) => [...surveysKeys.all, 'responses', id, responderId, page, limit, surveyType, search] as const,
  responseDetail: (id: string) => [...surveysKeys.all, 'responseDetail', id] as const,
  analytics: (id: string) => [...surveysKeys.all, 'analytics', id] as const,
  latestRapidEnquiry: () => [...surveysKeys.all, 'latestRapidEnquiry'] as const,
};

// List surveys
export function useSurveysList(params: SurveysListParams = { page: 1, limit: 10, surveyType: undefined }) {
  return useQuery<SurveysListResponse>({
    queryKey: surveysKeys.list(params),
    queryFn: () => offlineSurveyApi.getSurveys(params),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Get single survey by id
export function useSurvey(surveyId: string, enabled: boolean = true) {
  return useQuery<SurveyResponse>({
    queryKey: surveysKeys.detail(surveyId),
    queryFn: () => offlineSurveyApi.getSurvey(surveyId),
    enabled: !!surveyId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Get single response by id with populated fields
export function useResponseById(responseId: string, enabled: boolean = true) {
  return useQuery<ResponseDetailResponse>({
    queryKey: surveysKeys.responseDetail(responseId),
    queryFn: () => offlineSurveyApi.getResponseById(responseId),
    enabled: !!responseId && enabled,
  });
}

// List responses for a given survey id or responder id
export function useSurveyResponses(surveyId?: string, responderId?: string, page: number = 1, limit: number = 10, surveyType?: 'report-form' | 'general' | 'rapid-enquiry',  enabled: boolean = true, search?: string) {
  return useQuery<SurveyResponsesList>({
    queryKey: surveysKeys.responses(surveyId, responderId, page, limit, surveyType, search),
    queryFn: () => offlineSurveyApi.getSurveyResponses(surveyId, responderId, page, limit, surveyType, search),
    enabled: (!!surveyId || !!responderId) && enabled,
    placeholderData: keepPreviousData,
  });
}

// Analytics for a given survey id
export function useSurveyAnalytics(surveyId: string, enabled: boolean = true) {
  return useQuery<SurveyAnalytics>({
    queryKey: surveysKeys.analytics(surveyId),
    queryFn: () => offlineSurveyApi.getSurveyAnalytics(surveyId),
    enabled: !!surveyId && enabled,
  });
}

// Get latest rapid enquiry
export function useLatestRapidEnquiry() {
  return useQuery<SurveyResponse>({
    queryKey: surveysKeys.latestRapidEnquiry(),
    queryFn: () => offlineSurveyApi.getLatestRapidEnquiry(),
    placeholderData: keepPreviousData,
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
    mutationFn: (payload: SurveyUpdateRequest) => offlineSurveyApi.updateSurvey(surveyId, payload as any),
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
      offlineSurveyApi.updateSurvey(surveyId, { status } as any),
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
    mutationFn: (surveyId: string) => offlineSurveyApi.deleteSurvey(surveyId),
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
    mutationFn: (payload: SubmitAnswersRequest) => offlineSurveyApi.submitSurveyAnswers(surveyId, payload),
    onSuccess: async (data) => {
      // Show success message
      if (data.message.includes('offline')) {
        toast.info('Survey response saved offline and will be synced when online');
      } else {
        toast.success('Survey response submitted successfully');
      }
      
      await qc.invalidateQueries({ queryKey: surveysKeys.detail(surveyId) });
      await qc.invalidateQueries({ queryKey: surveysKeys.all });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to submit answers';
      toast.error(msg);
    },
  });
}
