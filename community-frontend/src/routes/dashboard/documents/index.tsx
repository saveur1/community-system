import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import Breadcrumb from '@/components/ui/breadcrum'
import { CustomDropdown, DropdownItem } from '@/components/ui/dropdown'
import { FaList, FaTh, FaEye, FaEdit, FaTrash, FaDownload, FaShare, FaEllipsisV } from 'react-icons/fa'
import { uploadToCloudinary } from '@/utility/logicFunctions'
import { useCreateDocument, useDeleteDocument, useUserDocuments } from '@/hooks/useDocuments'
import { toast } from 'react-toastify'
import useAuth from '@/hooks/useAuth'
import { deleteCloudinaryAsset } from '@/utility/logicFunctions'

type DocumentItem = {
  id: string
  name: string
  size: number // bytes
  type: string // mime or extension
  addedAt: string
  file?: File // only for uploaded in-session files
  publicId?: string
  deleteToken?: string | null
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  const mb = kb / 1024
  if (mb < 1024) return `${mb.toFixed(1)} MB`
  const gb = mb / 1024
  return `${gb.toFixed(1)} GB`
}

const DocumentsPage = () => {
  const { user } = useAuth()
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [documents, setDocuments] = useState<DocumentItem[]>([])

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [toDelete, setToDelete] = useState<{ id: string; name: string; publicId?: string } | null>(null)

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const createDoc = useCreateDocument()
  const deleteDoc = useDeleteDocument()

  // Fetch documents for the logged-in user from backend
  const { data: docsData } = useUserDocuments(user?.id, { page, limit: pageSize })

  // Sync fetched data to local UI state (mapped shape)
  useEffect(() => {
    if (!docsData?.result) return
    const mapped: DocumentItem[] = docsData.result.map((d) => ({
      id: d.id,
      name: d.documentName,
      size: d.size ?? 0,
      type: d.type ?? 'unknown',
      addedAt: (d.addedAt || d.createdAt || new Date().toISOString()).toString().slice(0, 10),
      publicId: d.publicId ?? undefined,
      deleteToken: d.deleteToken ?? null,
    }))
    setDocuments(mapped)
  }, [docsData])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return documents
    return documents.filter((d) => [d.name, d.type].some((v) => String(v).toLowerCase().includes(q)))
  }, [documents, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * pageSize
  const paginated = filtered.slice(start, start + pageSize)

  const handleAddDocuments = async (files: FileList | null) => {
    if (!files || !files.length) return
    if (!user?.id) {
      toast.error('You must be logged in to upload documents')
      return
    }
    try {
      for (const f of Array.from(files)) {
        // Upload toast
        const uploadToastId = toast.loading(`Uploading your document...`)
        try {
          // 1) Upload to Cloudinary to get URL
          const uploaded = await uploadToCloudinary(f, {
            onProgress: (percent: number) => {
              try {
                toast.update(uploadToastId, {
                  render: `Uploading your document... ${percent}%`,
                  isLoading: true,
                })
              } catch {}
            },
          })
          const documentUrl = uploaded.secureUrl || uploaded.url
          const publicId = uploaded.publicId
          const deleteToken = uploaded.deleteToken
          toast.update(uploadToastId, { render: `Uploaded your document`, type: 'success', isLoading: false, autoClose: 1200 })

          // 2) Build payload (no projectId sent)
          const payload = {
            documentName: f.name,
            size: f.size,
            // Save extension only (e.g., pdf, docx, mp4)
            type: (f.name.includes('.') ? (f.name.split('.').pop() || '') : '').toLowerCase() || 'unknown',
            addedAt: new Date(),
            documentUrl,
            publicId,
            deleteToken,
            userId: user.id,
          }

          // Saving toast
          const saveToastId = toast.loading(`Saving your document to database...`)
          try {
            // 3) Create in backend and use returned doc to update local list
            await createDoc.mutateAsync(payload as any)
            toast.update(saveToastId, { render: `Saved your document`, type: 'success', isLoading: false, autoClose: 1200 })
          
          } catch (err: any) {
            console.error(err)
            const msg = err?.response?.data?.message || 'Failed to save document'
            toast.update(saveToastId, { render: msg, type: 'error', isLoading: false, autoClose: 2000 })
          }
        } catch (err: any) {
          console.error(err)
          const msg = err?.response?.data?.message || 'Failed to upload document'
          toast.update(uploadToastId, { render: msg, type: 'error', isLoading: false, autoClose: 2000 })
        }
      }
    } catch (e) {
      console.error(e)
      toast.error('Unexpected error while adding documents')
    }
  }

  const handleAction = (action: string, doc: DocumentItem) => {
    if (action === 'view') {
      // Placeholder
    } else if (action === 'edit') {
      // Placeholder
    } else if (action === 'delete') {
      setToDelete({ id: doc.id, name: doc.name, publicId: doc.publicId })
      setDeleteModalOpen(true)
    }
  }

  const confirmDelete = async (id: string) => {
    const doc = documents.find((d) => d.id === id)
    let cloudToast: any
    try {
      if (doc?.deleteToken) {
        cloudToast = toast.loading('Deleting file from cloud...')
        try {
          await deleteCloudinaryAsset({ deleteToken: doc.deleteToken })
          toast.update(cloudToast, { render: 'Deleted file from cloud', type: 'success', isLoading: false, autoClose: 1200 })
        } catch (e: any) {
          toast.update(cloudToast, { render: e?.message || 'Failed to delete cloud file', type: 'error', isLoading: false, autoClose: 2000 })
        }
      } else {
        toast.info('No delete token found. Skipping cloud deletion.')
      }

      // Delete DB record
      await deleteDoc.mutateAsync(id)
      setDocuments((prev) => prev.filter((d) => d.id !== id))
    } finally {
      setDeleteModalOpen(false)
      setToDelete(null)
    }
  }

  const renderTable = () => (
    <div className="bg-white w-full rounded-lg shadow-sm border border-gray-200 overflow-visible">
      <table className="min-w-full">
        <thead className="border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Document</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Type</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Size</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Added</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {paginated.map((d) => (
            <tr key={d.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm text-gray-700 font-medium">{d.name}</td>
              <td className="px-6 py-4 text-sm text-gray-700">{d.type || '—'}</td>
              <td className="px-6 py-4 text-sm text-gray-700">{formatSize(d.size)}</td>
              <td className="px-6 py-4 text-sm text-gray-700">{d.addedAt}</td>
              <td className="px-6 py-4">
                <div className="flex items-center space-x-3">
                  <button title="Preview" className="text-primary hover:text-blue-700" onClick={() => handleAction('preview', d)}>
                    <FaEye className="w-4 h-4" />
                  </button>
                  <button title="Rename" className="text-title hover:text-shadow-title" onClick={() => handleAction('rename', d)}>
                    <FaEdit className="w-4 h-4" />
                  </button>
                  <button title="Download" className="text-gray-600 hover:text-gray-800" onClick={() => handleAction('download', d)}>
                    <FaDownload className="w-4 h-4" />
                  </button>
                  <CustomDropdown
                    trigger={<button className="text-gray-400 hover:text-gray-600 p-1"><FaEllipsisV className="w-4 h-4" /></button>}
                    position="bottom-right"
                    dropdownClassName="bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-48"
                  >
                    <DropdownItem icon={<FaShare className="w-4 h-4" />} onClick={() => alert('Share → ' + d.name)}>Share</DropdownItem>
                    <DropdownItem icon={<FaTrash className="w-4 h-4" />} destructive onClick={() => handleAction('delete', d)}>Delete</DropdownItem>
                  </CustomDropdown>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderGrid = () => (
    <div className="grid grid-cols-1 w-full md:grid-cols-2 lg:grid-cols-3 gap-6">
      {paginated.map((d) => (
        <div key={d.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="mb-2 text-sm text-gray-500">{d.addedAt}</div>
          <h3 className="text-lg font-medium text-gray-700 mb-1 break-words">{d.name}</h3>
          <div className="flex justify-between text-sm text-gray-500 mb-3">
            <span>{d.type || '—'}</span>
            <span>{formatSize(d.size)}</span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <button title="Preview" className="text-primary hover:text-blue-700" onClick={() => handleAction('preview', d)}>
                <FaEye className="w-4 h-4" />
              </button>
              <button title="Rename" className="text-title hover:text-shadow-title" onClick={() => handleAction('rename', d)}>
                <FaEdit className="w-4 h-4" />
              </button>
              <button title="Download" className="text-gray-600 hover:text-gray-800" onClick={() => handleAction('download', d)}>
                <FaDownload className="w-4 h-4" />
              </button>
            </div>
            <CustomDropdown
              trigger={<button className="text-gray-400 hover:text-gray-600 p-1"><FaEllipsisV className="w-4 h-4" /></button>}
              position="bottom-right"
              dropdownClassName="bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-48"
            >
              <DropdownItem icon={<FaShare className="w-4 h-4" />} onClick={() => alert('Share → ' + d.name)}>Share</DropdownItem>
              <DropdownItem icon={<FaTrash className="w-4 h-4" />} destructive onClick={() => handleAction('delete', d)}>Delete</DropdownItem>
            </CustomDropdown>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="pb-10">
      <Breadcrumb items={["Community", "Documents"]} title="Documents" className='absolute top-0 left-0 w-full px-6' />

      <div className="pt-14">
        <div className="flex w-full bg-white px-4 py-2 my-6 border border-gray-300 rounded-md items-center mb-6">
          <div className="flex items-center">
            <h2 className="text-xl font-bold text-gray-600 mr-2">Document List</h2>
            <span className="text-gray-500 text-lg">({filtered.length})</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search documents..."
                className="w-64 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center bg-white rounded-lg p-1">
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}>
                <FaList className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}>
                <FaTh className="w-4 h-4" />
              </button>
            </div>

            <div>
              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => handleAddDocuments(e.target.files)} />
              <label className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-sm cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                + Add Document
              </label>
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'list' ? renderTable() : renderGrid()}

      {/* Pagination */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-sm text-gray-600">Showing {paginated.length} of {filtered.length} documents</div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 rounded border disabled:opacity-50" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>Prev</button>
          <span className="text-sm text-gray-700">Page {currentPage} of {totalPages}</span>
          <button className="px-3 py-1 rounded border disabled:opacity-50" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</button>
          <select className="ml-2 border rounded px-2 py-1 text-sm" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
            {[6, 9, 12, 24].map((sz) => (
              <option key={sz} value={sz}>{sz} / page</option>
            ))}
          </select>
        </div>
      </div>

      {/* Delete confirm */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Delete Document</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Are you sure you want to delete <span className="font-medium">{toDelete?.name}</span>? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button className="px-4 py-2 rounded-md border" onClick={() => { setDeleteModalOpen(false); setToDelete(null); }}>Cancel</button>
              <button className="px-4 py-2 rounded-md bg-red-600 text-white" onClick={() => toDelete && confirmDelete(toDelete.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export const Route = createFileRoute('/dashboard/documents/')({
  component: DocumentsPage,
})
