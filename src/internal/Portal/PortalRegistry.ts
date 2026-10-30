import type { PortalMethods } from './PortalHost';

const hosts = new Map<string, PortalMethods>();
const listeners = new Set<() => void>();

export const getPortalHost = (portalId: string) => hosts.get(portalId);

export const subscribeToPortalHosts = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const registerPortalHost = (
  portalId: string,
  manager: PortalMethods
) => {
  if (hosts.has(portalId)) {
    throw new Error(`A PortalHost with portalId "${portalId}" already exists`);
  }

  hosts.set(portalId, manager);
  listeners.forEach((listener) => listener());

  return () => {
    hosts.delete(portalId);
    listeners.forEach((listener) => listener());
  };
};
