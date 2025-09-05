import { createFileRoute, useNavigate } from '@tanstack/react-router';
import React, { useEffect, useState } from 'react';
import Breadcrumb from '@/components/ui/breadcrum';
import { AnnouncementForm } from '@/components/features/announcements/AnnouncementForm';
import { useAnnouncement, useUpdateAnnouncement } from '@/hooks/useAnnouncements';
import { toast } from 'react-toastify';

const EditAnnouncementComponent: React.FC = () => {
  const navigate = useNavigate();
  const params = (Route as any).useParams?.() ?? {};
  const announcementId = String(params['edit-id'] ?? '');

  // Fetch announcement details
  const { data: announcementResp, isLoading, isError } = useAnnouncement(announcementId, !!announcementId);
  const announcement = announcementResp?.result;
  console.log('Fetched announcement:', announcement);

  // For form initial state
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    if (announcement) {
      setInitialData({
        title: announcement.title ?? '',
        message: announcement.message ?? '',
        status: announcement.status ?? 'draft',
        scheduledAt: announcement.scheduledAt ?? null,
        allowedRoles: Array.isArray(announcement.allowedRoles)
          ? announcement.allowedRoles.map((r: any) => r.id)
          : [],
        viewDetailsLink: announcement.viewDetailsLink ?? '',
      });
    }
  }, [announcement]);

  const updateAnnouncement = useUpdateAnnouncement();

  // Show loading or error states
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary/40"></div>
      </div>
    );
  }
  if (isError || !announcement) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Announcement not found</h2>
        <button
          onClick={() => navigate({ to: '/dashboard/announcements' })}
          className="px-4 py-2 bg-primary/30 text-white rounded-md hover:bg-primary-dark/30 transition-colors"
        >
          Back to Announcements
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Breadcrumb
        items={['Dashboard', 'Announcements', 'Edit Announcement']}
        title="Edit Announcement"
        className='absolute top-0 px-6 left-0 w-full'
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        {initialData && (
          <AnnouncementForm
            // Prefill form fields
            {...initialData}
            onSubmit={(data) => {
              updateAnnouncement.mutate(
                { id: announcementId, payload: data as any },
                {
                  onSuccess: () => {
                    navigate({ to: '/dashboard/announcements' });
                  },
                }
              );
            }}
            onCancel={() => navigate({ to: '/dashboard/announcements' })}
            isSubmitting={updateAnnouncement.isPending}
          />
        )}
      </div>
    </div>
  );
};

export const Route = createFileRoute('/dashboard/announcements/$edit-id')({
  component: EditAnnouncementComponent,
});
