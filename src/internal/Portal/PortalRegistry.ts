import type { PortalMethods } from './PortalHost';

const hosts = new Map<string, PortalMethods>();
const listeners = new Set<() => void>();

export const getPortalHost = (hostId: string) => hosts.get(hostId);

export const subscribeToPortalHosts = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const registerPortalHost = (hostId: string, manager: PortalMethods) => {
  if (hosts.has(hostId)) {
    throw new Error(`A PortalHost with hostId "${hostId}" already exists`);
  }

  hosts.set(hostId, manager);
  listeners.forEach((listener) => listener());

  return () => {
    hosts.delete(hostId);
    listeners.forEach((listener) => listener());
  };
};
