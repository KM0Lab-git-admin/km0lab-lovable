import type { ReactNode } from "react";
/** Lovable-only chrome. Product pages receive their frame from App. */
const DeviceShell = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-dvh w-full items-center justify-center overflow-hidden bg-km0-beige-50">
    <div data-bp="vertical-mobile portrait" className="relative flex h-[min(calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)),920px)] w-[min(100vw,420px)] flex-col overflow-hidden rounded-3xl border-2 border-km0-blue-700/80 bg-km0-beige-50 shadow-device-frame">{children}</div>
  </div>
);
export default DeviceShell;
