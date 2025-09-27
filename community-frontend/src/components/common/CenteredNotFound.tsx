import { type JSX } from 'react';

export default function CenteredNotFound(): JSX.Element {
  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.assign('/dashboard');
    }
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-6 py-10">
      <img
        src="/images/404.svg"
        alt="Page not found"
        className="w-[420px] max-w-full"
        aria-hidden={false}
      />
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Page not found</h2>
      <button
        type="button"
        onClick={handleBack}
        className="mt-2 inline-flex items-center justify-center px-5 py-2 rounded-md bg-primary text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors
                   dark:bg-primary-dark dark:hover:bg-primary-darker"
        aria-label="Return back"
      >
        Return back
      </button>
    </div>
  );
}
