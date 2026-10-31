import { type ReactNode, useContext, useSyncExternalStore } from 'react';

import { PortalConsumer } from './PortalConsumer';
import { PortalHost, PortalContext } from './PortalHost';
import { getPortalHost, subscribeToPortalHosts } from './PortalRegistry';

type Props = {
  children: ReactNode;
  hostId?: string;
};

function Portal({ children, hostId }: Props) {
  const nearestManager = useContext(PortalContext);
  const namedManager = useSyncExternalStore(
    subscribeToPortalHosts,
    () => (hostId === undefined ? undefined : getPortalHost(hostId)),
    () => undefined
  );
  const manager = hostId === undefined ? nearestManager : namedManager;

  if (!manager) {
    if (hostId === undefined) {
      throw new Error("Wrapped PortalHost doesn't exist");
    }
    return null;
  }

  return <PortalConsumer manager={manager}>{children}</PortalConsumer>;
}

Portal.Host = PortalHost;

export { Portal };
