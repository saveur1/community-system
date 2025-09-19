import { createFileRoute } from '@tanstack/react-router';
import Breadcrumb from '@/components/ui/breadcrum';
import { FaClipboardList, FaCommentDots, FaVideo, FaUsers } from 'react-icons/fa';
import React from 'react';

function UsageCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="text-sm text-gray-600 space-y-2">{children}</div>
    </div>
  );
}

function AboutSystemPage() {
  return (
    <div className="pb-10">
      <Breadcrumb items={['Dashboard', 'About']} title="About this System" className="absolute top-0 left-0 w-full px-6" />

      <div className="pt-20 max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Community Tool — Overview</h1>
          <p className="text-gray-600">
            This platform helps program teams collect feedback, run surveys, manage community sessions and coordinate stakeholders.
            Below are example usage scenarios that show how different features of the system fit into typical workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <UsageCard icon={<FaClipboardList size={18} />} title="Surveys — gather structured feedback">
            <ol className="list-decimal pl-5">
              <li>Create a survey: define title, questions and availability window.</li>
              <li>Restrict access using Allowed Roles so only target users can respond.</li>
              <li>Distribute the survey link or ask users to take it from the dashboard.</li>
              <li>View aggregated responses and export/report on results.</li>
            </ol>
            <div className="mt-2 text-xs text-gray-500">Tip: Use the report-form type for official reporting workflows.</div>
          </UsageCard>

          <UsageCard icon={<FaCommentDots size={18} />} title="Feedback — collect unstructured input">
            <ol className="list-decimal pl-5">
              <li>Users submit feedback with optional attachments (documents/images).</li>
              <li>Staff triage feedback, change status (Acknowledged / Resolved) and assign follow-up.</li>
              <li>Track feedback statistics on the Feedback dashboard and export summaries.</li>
            </ol>
            <div className="mt-2 text-xs text-gray-500">Tip: Attach project or location metadata to filter feedback by program.</div>
          </UsageCard>

          <UsageCard icon={<FaVideo size={18} />} title="Community Sessions — host resources & discussions">
            <ol className="list-decimal pl-5">
              <li>Create a session and upload the session resource (video, document, audio).</li>
              <li>Choose which roles can view the session (access control).</li>
              <li>Users can comment on sessions; moderators can manage comments.</li>
            </ol>
            <div className="mt-2 text-xs text-gray-500">Tip: Use sessions to share training videos and collect community questions.</div>
          </UsageCard>

          <UsageCard icon={<FaUsers size={18} />} title="Stakeholders & Roles — manage access and responsibilities">
            <ol className="list-decimal pl-5">
              <li>Create stakeholders which auto-provision a role tied to that stakeholder.</li>
              <li>Assign permissions to the role to control access (e.g., create reports, read surveys).</li>
              <li>Attach users to stakeholders so they inherit permissions for related projects.</li>
            </ol>
            <div className="mt-2 text-xs text-gray-500">Tip: Keep stakeholder roles scoped to necessary permissions for least privilege.</div>
          </UsageCard>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Example end-to-end scenario</h2>
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Objective:</strong> Measure satisfaction after a community immunization campaign.</p>
            <ol className="list-decimal pl-5">
              <li>Program manager creates a Survey with questions about experience, wait times and suggestions.</li>
              <li>Survey is restricted to community roles and scheduled to run for one week.</li>
              <li>Health workers encourage participants to complete the survey; collected answers are reviewed daily.</li>
              <li>Feedback items flagged for follow-up are converted into tasks or routed to the local clinic staff.</li>
              <li>After campaign, the manager generates a report from aggregated survey answers and shares it with stakeholders.</li>
            </ol>
            <p className="text-xs text-gray-500">This workflow uses Surveys, Feedback, Stakeholders and Reporting features together.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/dashboard/docs/')({
  component: AboutSystemPage,
});
