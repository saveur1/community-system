import { useMemo, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import Breadcrumb from '@/components/ui/breadcrum';
import { ImmunizationReport, ReportAction } from '@/utility/types';
import { ReportTable } from '@/components/features/immunization/report/report-table';
import { ReportGrid } from '@/components/features/immunization/report/report-grid-view';
import { ReportToolbar } from '@/components/features/immunization/report/report-toolbar';
import { ReportPagination } from '@/components/features/immunization/report/report-pagination';
import Drawer from '@/components/ui/drawer';
import { ReportImmunizationDrawer } from '@/components/features/immunization/report/report-immunization-drawer';

const ImmunizationReportsPage = () => {
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [reports, setReports] = useState<ImmunizationReport[]>([
        { id: 1, vaccine: 'BCG', completionDate: '2024-09-15', administeredBy: 'Dr. Smith', reportedAt: '2024-09-16 10:00', tag: 'Health Center A' },
        { id: 2, vaccine: 'Polio', completionDate: '2024-09-20', administeredBy: 'Dr. Smith', reportedAt: '2024-09-21 14:30', tag: 'Cell Leaders' },
        { id: 3, vaccine: 'Measles', completionDate: '2024-10-01', administeredBy: 'Dr. Jones', reportedAt: '2024-10-02 09:15', tag: 'District Hospital' },
        { id: 4, vaccine: 'Hepatitis B', completionDate: '2024-10-05', administeredBy: 'Dr. Jones', reportedAt: '2024-10-06 11:45', tag: 'Health Center B' },
    ]);

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isReportOpen, setIsReportOpen] = useState(false);

    const [selectedReport, setSelectedReport] = useState<ImmunizationReport | undefined>(undefined);

    const handleAction = (action: ReportAction, id: number) => {
        const report = reports.find(r => r.id === id);
        if (!report) return;

        switch (action) {
            case 'view':
                setSelectedReport(report);
                setIsViewOpen(true);
                break;
            case 'download':
                // Placeholder for download functionality
                alert(`Downloading report for ${report.administeredBy}`);
                break;
            default:
                break;
        }
    };

    const filteredReports = useMemo(() => {
        return reports.filter(r =>
            r.vaccine.toLowerCase().includes(search.toLowerCase())
        );
    }, [reports, search]);

    const paginatedReports = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredReports.slice(start, start + pageSize);
    }, [filteredReports, page, pageSize]);

    return (
        <>
            <Breadcrumb
                title="Immunization Reports"
                items={["Dashboard", "Immunization", "Reports"]}
                className="absolute top-0 left-0 w-full"
            />
            <div className="pb-4 pt-12">
                <ReportToolbar
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    search={search}
                    onSearchChange={setSearch}
                    filteredCount={filteredReports.length}
                    onReport={() => setIsReportOpen(true)}
                />

                {viewMode === 'list' ? (
                    <ReportTable reports={paginatedReports} onAction={handleAction} />
                ) : (
                    <ReportGrid reports={paginatedReports} onAction={handleAction} />
                )}

                <ReportPagination
                    page={page}
                    pageSize={pageSize}
                    total={filteredReports.length}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                />

                <Drawer open={isViewOpen} onClose={() => setIsViewOpen(false)} title={`Details for ${selectedReport?.vaccine}`}>
                    {selectedReport && (
                        <div className="p-4">
                            <p><strong>Vaccine:</strong> {selectedReport.vaccine}</p>
                            <p><strong>Reported At:</strong> {selectedReport.reportedAt}</p>
                            <p><strong>Tag:</strong> {selectedReport.tag}</p>
                        </div>
                    )}
                </Drawer>
                <ReportImmunizationDrawer open={isReportOpen} onClose={() => setIsReportOpen(false)} />
            </div>
        </>
    );
};

export const Route = createFileRoute('/dashboard/immunization/report')({
    component: ImmunizationReportsPage,
});