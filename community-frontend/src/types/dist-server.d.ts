declare module '../dist/server/entry-server.js' {
  export const render: (options: {
    req: any;
    res: any;
    head: any;
  }) => Promise<void>;
}

declare module 'file-saver' {
  export function saveAs(data: Blob | File | string, filename?: string, options?: any): void
  export default saveAs
}
