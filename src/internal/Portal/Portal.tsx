import { type ReactNode, useContext, useSyncExternalStore } from 'react';

import { PortalConsumer } from './PortalConsumer';
import { PortalHost, PortalContext } from './PortalHost';
import { getPortalHost, subscribeToPortalHosts } from './PortalRegistry';

type Props = {
  children: ReactNode;
  portalId?: string;
};

function Portal({ children, portalId }: Props) {
  const nearestManager = useContext(PortalContext);
  const namedManager = useSyncExternalStore(
    subscribeToPortalHosts,
    () => (portalId === undefined ? undefined : getPortalHost(portalId)),
    () => undefined
  );
  const manager = portalId === undefined ? nearestManager : namedManager;

  if (!manager) {
    if (portalId === undefined) {
      throw new Error("Wrapped PortalHost doesn't exist");
    }
    return null;
  }

  return <PortalConsumer manager={manager}>{children}</PortalConsumer>;
}

Portal.Host = PortalHost;

export { Portal };
