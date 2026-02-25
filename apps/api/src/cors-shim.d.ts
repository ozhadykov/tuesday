declare module 'cors' {
  import type { RequestHandler } from 'express';

  type Cors = (options?: unknown) => RequestHandler;

  const cors: Cors;
  export default cors;
}
