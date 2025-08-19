import Breadcrumb from '@/components/ui/breadcrum';
import { createFileRoute, useParams, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaFolderOpen, FaListOl, FaUsers, FaSort, FaSortUp, FaSortDown, FaEye, FaTag, FaUpload, FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa';

// Programme details derived from add-new.tsx fields
type Programme = {
  id: number;
  title: string;
  slug: string;
  description: string;
  status: 'Active' | 'Draft' | 'Planned' | 'Archived';
  targetGroup: string;
  documents: number;
  surveys: number;
  feedbacks: number;
};

type DocItem = { id: number; name: string; type: string; size: string; added: string };

type ProgrammeSurvey = { id: number; name: string; status: 'Active' | 'Draft' | 'Completed' | 'Pending'; email: string; responses: number };

type ProgrammeFeedback = { id: number; respondent: string; type: 'Positive' | 'Negative' | 'Suggestion' | 'Concern'; message: string; followUp: boolean; status: 'Open' | 'Closed' | 'Pending' };

function getStatusColor(status: string) {
  switch (status) {
    case 'Active': return 'bg-green-100 text-green-800';
    case 'Draft': return 'bg-blue-100 text-blue-800';
    case 'Planned': return 'bg-purple-100 text-purple-800';
    case 'Archived': return 'bg-gray-200 text-gray-800';
    case 'Completed': return 'bg-red-100 text-red-800';
    case 'Pending': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

// Simulated fetchers (replace with real API or selectors)
async function fetchProgramme(id: number): Promise<Programme> {
  await new Promise(r => setTimeout(r, 120));
  return {
    id,
    title: 'Immunization',
    slug: 'immunization',
    description: 'Routine childhood and adult immunization programmes',
    status: 'Active',
    targetGroup: 'Children 0-5',
    documents: 12,
    surveys: 3,
    feedbacks: 980,
  };
}

async function fetchDocs(programmeId: number): Promise<DocItem[]> {
  await new Promise(r => setTimeout(r, 120));
  return [
    { id: 1, name: 'Programme Outline.pdf', type: 'PDF', size: '1.2 MB', added: '2025-08-01' },
    { id: 2, name: 'Budget.xlsx', type: 'XLSX', size: '380 KB', added: '2025-08-02' },
    { id: 3, name: 'Campaign Banner.png', type: 'PNG', size: '820 KB', added: '2025-08-05' },
    { id: 4, name: 'Field Report.docx', type: 'DOCX', size: '220 KB', added: '2025-08-06' },
    { id: 5, name: 'Schedule.csv', type: 'CSV', size: '12 KB', added: '2025-08-08' },
  ];
}

async function fetchProgrammeSurveys(programmeId: number): Promise<ProgrammeSurvey[]> {
  await new Promise(r => setTimeout(r, 120));
  return [
    { id: 11, name: 'Parent Satisfaction', status: 'Active', email: 'immunization@community.org', responses: 210 },
    { id: 12, name: 'Clinic Experience', status: 'Draft', email: 'immunization@community.org', responses: 145 },
    { id: 13, name: 'Outreach Outcomes', status: 'Completed', email: 'immunization@community.org', responses: 320 },
  ];
}

async function fetchProgrammeFeedbacks(programmeId: number): Promise<ProgrammeFeedback[]> {
  await new Promise(r => setTimeout(r, 120));
  return [
    { id: 9001, respondent: 'Jane Smith', type: 'Positive', message: 'Staff were kind and the service was quick.', followUp: false, status: 'Closed' },
    { id: 9002, respondent: 'John Doe', type: 'Suggestion', message: 'Extend clinic hours for working parents.', followUp: true, status: 'Open' },
    { id: 9003, respondent: 'Alex Lee', type: 'Negative', message: 'Wait times were long.', followUp: true, status: 'Pending' },
    { id: 9004, respondent: 'Sam W.', type: 'Positive', message: 'Great outreach event!', followUp: false, status: 'Closed' },
  ];
}

const ProgramDetail = () => {
  const { 'view-id': viewId } = useParams({ strict: false }) as { 'view-id': string };

  const [programme, setProgramme] = useState<Programme | null>(null);

  const [activeTab, setActiveTab] = useState<'details' | 'resources' | 'surveys' | 'feedbacks'>('details');
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [surveys, setSurveys] = useState<ProgrammeSurvey[]>([]);
  const [feedbacks, setFeedbacks] = useState<ProgrammeFeedback[]>([]);

  useEffect(() => {
    const id = Number(viewId) || 0;
    let mounted = true;
    Promise.all([
      fetchProgramme(id),
      fetchDocs(id),
      fetchProgrammeSurveys(id),
      fetchProgrammeFeedbacks(id),
    ]).then(([p, d, s, f]) => {
      if (!mounted) return;
      setProgramme(p);
      setDocs(d);
      setSurveys(s);
      setFeedbacks(f);
    });
    return () => { mounted = false; };
  }, [viewId]);

  // Shared table controls
  const [search, setSearch] = useState('');
  const [docSearch, setDocSearch] = useState('');
  const [fbPage, setFbPage] = useState(1);
  const [fbPageSize, setFbPageSize] = useState(10);
  const [sortKey, setSortKey] = useState<string>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Resources pagination
  const [docPage, setDocPage] = useState(1);
  const [docPageSize, setDocPageSize] = useState(5);
  const docsFiltered = useMemo(() => docs.filter(d => d.name.toLowerCase().includes(docSearch.toLowerCase())), [docs, docSearch]);
  const docTotalPages = Math.max(1, Math.ceil(docsFiltered.length / docPageSize));
  const docPageData = useMemo(() => {
    const start = (docPage - 1) * docPageSize; return docsFiltered.slice(start, start + docPageSize);
  }, [docsFiltered, docPage, docPageSize]);

  const sortIcon = (key: string) => {
    if (sortKey !== key) return <FaSort className="inline ml-1" />;
    return sortDir === 'asc' ? <FaSortUp className="inline ml-1" /> : <FaSortDown className="inline ml-1" />;
  };

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const surveysFiltered = useMemo(() => {
    const q = search.toLowerCase();
    return surveys.filter(s => [s.name, s.status, s.email, String(s.id)].some(v => String(v).toLowerCase().includes(q)));
  }, [surveys, search]);

  const surveysSorted = useMemo(() => {
    const arr = [...surveysFiltered];
    arr.sort((a: any, b: any) => {
      const va = a[sortKey]; const vb = b[sortKey];
      if (va == null && vb == null) return 0; if (va == null) return -1; if (vb == null) return 1;
      if (va < vb) return sortDir === 'asc' ? -1 : 1; if (va > vb) return sortDir === 'asc' ? 1 : -1; return 0;
    });
    return arr;
  }, [surveysFiltered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(surveysSorted.length / pageSize));
  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize; return surveysSorted.slice(start, start + pageSize);
  }, [surveysSorted, page, pageSize]);

  return (
    <div className="pb-10">
      <Breadcrumb items={["Community", "Programmes", programme?.title || '']} title="Programme Details" className="absolute top-0 left-0 w-full px-6" />

      <div className="pt-14 space-y-6">
        {/* Overview Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 bg-title/5 w-full overflow-hidden pb-0">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-semibold text-gray-800">{programme?.title}</h1>
                <div className="mt-2 flex items-center gap-6 text-sm text-gray-600">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(programme?.status || '')}`}>{programme?.status}</span>
                  <span className="inline-flex items-center gap-2"><FaTag /> Slug: {programme?.slug}</span>
                  <span className="inline-flex items-center gap-2"><FaUsers /> Target: {programme?.targetGroup}</span>
                  <span className="inline-flex items-center gap-2"><FaFolderOpen /> Docs: {programme?.documents}</span>
                  <span className="inline-flex items-center gap-2"><FaListOl /> Surveys: {programme?.surveys}</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-10 border-b border-gray-200">
              <nav className="-mb-px flex gap-6" aria-label="Tabs">
                <button className={`pb-2 border-b-4 text-sm font-medium transition-colors ${activeTab === 'details' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('details')}>Details</button>
                <button className={`pb-2 border-b-4 text-sm font-medium transition-colors ${activeTab === 'resources' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('resources')}>Resources ({programme?.documents || 0})</button>
                <button className={`pb-2 border-b-4 text-sm font-medium transition-colors ${activeTab === 'surveys' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('surveys')}>Surveys ({programme?.surveys || 0})</button>
                <button className={`pb-2 border-b-4 text-sm font-medium transition-colors ${activeTab === 'feedbacks' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('feedbacks')}>Feedbacks ({programme?.feedbacks || 0})</button>
              </nav>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        {activeTab === 'details' && programme && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{programme.description}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Attributes</h3>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li><span className="text-gray-500">Title:</span> {programme.title}</li>
                    <li><span className="text-gray-500">Slug:</span> {programme.slug}</li>
                    <li><span className="text-gray-500">Status:</span> {programme.status}</li>
                    <li><span className="text-gray-500">Target Group:</span> {programme.targetGroup}</li>
                    <li><span className="text-gray-500">Documents:</span> {programme.documents}</li>
                    <li><span className="text-gray-500">Surveys:</span> {programme.surveys}</li>
                    <li><span className="text-gray-500">Feedbacks:</span> {programme.feedbacks}</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'resources' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 flex items-center gap-3 border-b border-gray-200">
                <input value={docSearch} onChange={(e) => { setDocSearch(e.target.value); setDocPage(1); }} placeholder="Search documents..." className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                <label className="inline-flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer text-sm">
                  <FaUpload />
                  <span>Upload</span>
                  <input type="file" multiple className="hidden" onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (!files.length) return;
                    const now = new Date().toISOString().slice(0,10);
                    const newDocs: DocItem[] = files.map((f, i) => ({ id: Date.now()+i, name: f.name, type: f.name.split('.').pop()?.toUpperCase() || 'FILE', size: `${Math.ceil(f.size/1024)} KB`, added: now }));
                    setDocs(prev => [...newDocs, ...prev]);
                    e.currentTarget.value = '';
                  }} />
                </label>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Type</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Size</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Added</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {docPageData.map(d => (
                      <tr key={d.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {d.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{d.type}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{d.size}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{d.added}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3 text-sm">
                            <button className="text-title hover:underline">Download</button>
                            <button className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700" onClick={() => {
                              const newName = prompt('Rename document', d.name);
                              if (!newName) return;
                              setDocs(prev => prev.map(x => x.id === d.id ? { ...x, name: newName } : x));
                            }}>
                              <FaEdit /> Rename
                            </button>
                            <button className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700" onClick={() => setDocs(prev => prev.filter(x => x.id !== d.id))}>
                              <FaTrash /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between p-4 border-t border-gray-200 text-sm text-gray-600">
                <div>Page {docPage} of {docTotalPages} • {docsFiltered.length} documents</div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 border rounded-md hover:bg-gray-50 disabled:opacity-50" onClick={() => setDocPage(p => Math.max(1, p - 1))} disabled={docPage === 1}><FaChevronLeft /></button>
                  <button className="px-3 py-1.5 border rounded-md hover:bg-gray-50 disabled:opacity-50" onClick={() => setDocPage(p => Math.min(docTotalPages, p + 1))} disabled={docPage === docTotalPages}><FaChevronRight /></button>
                  <select className="ml-2 border rounded px-2 py-1 text-sm" value={docPageSize} onChange={(e) => { setDocPageSize(Number(e.target.value)); setDocPage(1); }}>
                    {[5,10,20].map(n => <option key={n} value={n}>{n} / page</option>)}
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'surveys' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 flex items-center gap-3 border-b border-gray-200">
                <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search surveys..." className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Rows:</label>
                  <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="border border-gray-300 rounded-md px-2 py-1 text-sm">
                    {[5,10,20].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 cursor-pointer" onClick={() => toggleSort('name')}>Name {sortIcon('name')}</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 cursor-pointer" onClick={() => toggleSort('status')}>Status {sortIcon('status')}</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 cursor-pointer" onClick={() => toggleSort('email')}>Contact {sortIcon('email')}</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 cursor-pointer" onClick={() => toggleSort('responses')}>Responses {sortIcon('responses')}</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pageData.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-700">{s.name}</td>
                        <td className="px-6 py-4"><span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(s.status)}`}>{s.status}</span></td>
                        <td className="px-6 py-4 text-sm text-gray-700">{s.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{s.responses}</td>
                        <td className="px-6 py-4">
                          <Link to="/dashboard/surveys/$view-id" params={{ 'view-id': String(s.id) }} className="text-title inline-flex items-center gap-2">
                            <FaEye className="w-4 h-4" /> View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between p-4 border-t border-gray-200 text-sm text-gray-600">
                <div>Page {page} of {totalPages} • {surveysSorted.length} total</div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 border rounded-md hover:bg-gray-50 disabled:opacity-50" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><FaChevronLeft /></button>
                  <button className="px-3 py-1.5 border rounded-md hover:bg-gray-50 disabled:opacity-50" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><FaChevronRight /></button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'feedbacks' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 flex items-center gap-3 border-b border-gray-200">
                <input value={search} onChange={(e) => { setSearch(e.target.value); setFbPage(1); }} placeholder="Search feedbacks..." className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Rows:</label>
                  <select value={fbPageSize} onChange={(e) => { setFbPageSize(Number(e.target.value)); setFbPage(1); }} className="border border-gray-300 rounded-md px-2 py-1 text-sm">
                    {[5,10,20].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Respondent</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Type</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Message</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Follow-up</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {feedbacks
                      .filter(f => [f.respondent, f.type, f.message, f.status].some(v => String(v).toLowerCase().includes(search.toLowerCase())))
                      .slice((fbPage-1)*fbPageSize, (fbPage-1)*fbPageSize + fbPageSize)
                      .map(f => (
                      <tr key={f.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-700">{f.respondent}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{f.type}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 max-w-xl truncate" title={f.message}>{f.message}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{f.followUp ? 'Yes' : 'No'}</td>
                        <td className="px-6 py-4"><span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(f.status)}`}>{f.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between p-4 border-t border-gray-200 text-sm text-gray-600">
                <div>
                  Page {fbPage} • Showing {Math.min(fbPageSize, Math.max(0, feedbacks.filter(f => [f.respondent, f.type, f.message, f.status].some(v => String(v).toLowerCase().includes(search.toLowerCase()))).length - (fbPage-1)*fbPageSize))} rows
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 border rounded-md hover:bg-gray-50 disabled:opacity-50" onClick={() => setFbPage(p => Math.max(1, p - 1))} disabled={fbPage === 1}><FaChevronLeft /></button>
                  <button className="px-3 py-1.5 border rounded-md hover:bg-gray-50 disabled:opacity-50" onClick={() => setFbPage(p => p + 1)} disabled={(fbPage-1)*fbPageSize >= feedbacks.filter(f => [f.respondent, f.type, f.message, f.status].some(v => String(v).toLowerCase().includes(search.toLowerCase()))).length - fbPageSize}><FaChevronRight /></button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export const Route = createFileRoute('/dashboard/programmes/$view-id')({
  component: ProgramDetail,
});
