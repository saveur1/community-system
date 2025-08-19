declare module '../dist/server/entry-server.js' {
  export const render: (options: {
    req: any;
    res: any;
    head: any;
  }) => Promise<void>;
}
