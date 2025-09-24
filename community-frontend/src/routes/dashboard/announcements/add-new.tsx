import { createFileRoute, useNavigate } from '@tanstack/react-router';
import React from 'react';
import Breadcrumb from '@/components/ui/breadcrum';
import { AnnouncementForm } from '@/components/features/announcements/AnnouncementForm';
import { useCreateAnnouncement } from '@/hooks/useAnnouncements';
import { toast } from 'react-toastify';

const CreateStakeholderComponent: React.FC = () => {
    const navigate = useNavigate();
    const createAnnouncement = useCreateAnnouncement();
    // Render UI as a two-step wizard
    return (
        <div className="w-full">
            <Breadcrumb
                items={[
                    { title: 'Dashboard',   link: '/dashboard' },
                    { title: 'Announcements', link: '/dashboard/announcements' },
                    'Add New',
                ]}
                title="Add New Announcement"
                className='absolute top-0 px-6 left-0 w-full'
            />

            <div className="max-w-4xl mx-auto px-2 sm:px-4 lg:px-8 pt-20 pb-12">
                <AnnouncementForm
                    onSubmit={(data) => {
                        createAnnouncement.mutate(data as any, {
                            onSuccess: () => {
                                toast.success('Announcement created successfully');
                                navigate({ to: '/dashboard/announcements' });
                            },
                        });
                    }}
                    onCancel={() => navigate({ to: '/dashboard/announcements' })}
                    isSubmitting={createAnnouncement.isPending}
                />
            </div>
        </div>
    );
};

export const Route = createFileRoute('/dashboard/announcements/add-new')({
    component: CreateStakeholderComponent,
});