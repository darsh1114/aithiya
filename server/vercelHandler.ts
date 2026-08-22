import { createApp } from "./app";

/**
 * Source entrypoint for the Vercel catch-all function.
 *
 * The build script bundles this file to api/[...path].js. Vercel then runs the
 * generated JavaScript directly instead of separately type-checking every
 * imported server TypeScript module with a different compiler configuration.
 */
export default createApp({ storagePathPrefix: "/api/manus-storage" });
