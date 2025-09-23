import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import Breadcrumb from '@/components/ui/breadcrum';
import FilePreview from '@/components/common/file-preview';
import { FaDownload, FaEllipsisV, FaShare, FaUserCircle, FaArrowLeft } from 'react-icons/fa';
import {
  useAddComment,
  useCommunitySession,
  useCommunitySessionComments,
} from '@/hooks/useCommunitySession';
import { spacer } from '@/utility/logicFunctions';
import useAuth from '@/hooks/useAuth';

const MediaBox = ({ src, filename, type }: { src?: string; filename?: string; type: any }) => {
  return (
    <div className="w-full bg-black rounded-xl overflow-hidden shadow-lg aspect-video">
      <FilePreview
        src={src}
        filename={filename}
        type={type}
        className="w-full h-full"
        controls={type === 'video'}
        hoverAutoplay={false}
      />
    </div>
  );
};

// simple time-ago formatter
function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}mo ago`;
  const yr = Math.floor(mo / 12);
  return `${yr}y ago`;
}

const Comments = ({ sessionId }: { sessionId: string }) => {
  const [content, setContent] = useState('');
  const { data: listResp, isLoading } = useCommunitySessionComments(sessionId, { page: 1, limit: 50 });
  const addComment = useAddComment(sessionId);
  const comments = listResp?.result ?? [];
  const { user } = useAuth();

  const handleAdd = async () => {
    const text = content.trim();
    if (!text) return;
    await addComment.mutateAsync({ 
      data: { content: text }, 
      userId: user?.id || '' // TODO: Get from auth context
    });
    setContent('');
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3">Comments ({listResp?.meta?.total ?? comments.length})</h3>

      <div className="flex gap-3 mb-6">
        <div className="mt-1">
          <FaUserCircle className="text-gray-400" size={36} />
        </div>
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a comment..."
            className="w-full border border-gray-400 rounded-lg px-3 py-2 min-h-20 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              className="px-4 py-2 rounded-md border border-gray-400 cursor-pointer"
              onClick={() => setContent('')}
              disabled={!content.trim()}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded-md bg-primary cursor-pointer disabled:cursor-not-allowed text-white hover:bg-primary-dark disabled:opacity-50"
              onClick={handleAdd}
              disabled={!content.trim() || addComment.isPending}
            >
              Comment
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-gray-500">Loading comments...</div>
      ) : (
        <>
          {comments.length === 0 ? (
            <ul className="space-y-4">
              {[1,2].map((i) => (
                <li key={i} className="flex gap-3">
                  <div className="mt-1">
                    <FaUserCircle className="text-gray-300" size={36} />
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-lg p-3 pt-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-500">Sample User</div>
                      <div className="text-xs text-gray-400">just now</div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">This is a sample comment. Be the first to comment!</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="space-y-4">
              {comments.map((c) => (
                <li key={c.id} className="flex gap-3">
                  <div className="mt-1">
                    <FaUserCircle className="text-gray-400" size={36} />
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-800">{c.user?.name ?? 'User'}</div>
                      <div className="text-xs text-gray-500">{timeAgo(c.createdAt)}</div>
                    </div>
                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{c.content}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

function CommunitySessionDetail() {
  const { sessionId } = Route.useParams();
  const nav = useNavigate();
  const { data, isLoading } = useCommunitySession(sessionId);
  const session = data?.result;

  const src = session?.document?.documentUrl || undefined;
  const filename = session?.document?.documentName || undefined;

  const meta = useMemo(() => {
    if (!session) return null;
    return {
      date: new Date(session.createdAt).toLocaleDateString(),
      active: session.isActive,
      roles: session.roles || [],
    };
  }, [session]);

  return (
    <div>
      <Breadcrumb title="Session Details" items={["Dashboard", "Community Sessions", session?.title || 'Details']} className="absolute top-0 left-0 w-full" />
      <div className="pt-16 max-w-6xl mx-auto">
        <button onClick={() => nav({ to: '/dashboard/community-sessions' })} className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800">
          <FaArrowLeft /> Back to sessions
        </button>

        {isLoading || !session ? (
          <div className="text-center text-gray-500 py-16">Loading session...</div>
        ) : (
          <div className="grid grid-cols-12 gap-6">
            {/* Left/Main column */}
            <div className="col-span-12 lg:col-span-8">
              <MediaBox src={src} filename={filename} type={session.type} />

              <div className="mt-4 bg-white rounded-xl shadow p-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{session.title}</h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <span title={session.createdAt}>Created {timeAgo(session.createdAt)}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${meta?.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{meta?.active ? 'Active' : 'Inactive'}</span>
                  {meta?.roles && meta.roles.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">Roles:</span>
                      <div className="flex flex-wrap gap-2">
                        {meta.roles.map((role) => (
                          <span key={role.id} className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs uppercase border border-gray-400">
                            {spacer(role.name)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="ml-auto flex items-center gap-2">
                    <button
                      className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center gap-2"
                      onClick={() => {
                        if (!src) return;
                        navigator.clipboard.writeText(src).then(() => alert('Link copied'));
                      }}
                    >
                      <FaShare /> Share
                    </button>
                    <a
                      className="px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary-dark flex items-center gap-2"
                      href={src}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FaDownload /> Download
                    </a>
                    <button className="p-2 rounded-full hover:bg-gray-100"><FaEllipsisV /></button>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-800 whitespace-pre-wrap">{session.shortDescription}</p>
                  </div>
                </div>

                <Comments sessionId={session.id} />
              </div>
            </div>

            {/* Right/Side column: suggestions or info */}
            <div className="col-span-12 lg:col-span-4">
              <div className="bg-white rounded-xl shadow p-4">
                <h3 className="font-semibold mb-3">About</h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li><span className="font-medium">Type:</span> {session.type}</li>
                  <li><span className="font-medium">Created:</span> <span title={session.createdAt}>{timeAgo(session.createdAt)}</span></li>
                  <li><span className="font-medium">Updated:</span> <span title={session.updatedAt}>{timeAgo(session.updatedAt)}</span></li>
                  {session.document?.size != null && (
                    <li><span className="font-medium">Size:</span> {session.document.size} bytes</li>
                  )}
                  {session.document?.type && (
                    <li><span className="font-medium">MIME:</span> {session.document.type}</li>
                  )}
                  {session.creator?.name && (
                    <li><span className="font-medium">Creator:</span> {session.creator.name}</li>
                  )}
                </ul>
                <div className="mt-4">
                  <Link to="/dashboard/community-sessions">
                    <span className="text-primary hover:underline">← Back to list</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const Route = createFileRoute('/dashboard/community-sessions/$sessionId')({
  component: CommunitySessionDetail,
});
