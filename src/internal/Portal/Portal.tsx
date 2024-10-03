import React from 'react';

import { PortalConsumer } from './PortalConsumer';
import { type PortalMethods, PortalHost, PortalContext } from './PortalHost';

type Props = {
  children: React.ReactNode;
};

class Portal extends React.Component<Props> {
  static Host = PortalHost;

  override render() {
    const { children } = this.props;

    return (
      <PortalContext.Consumer>
        {(manager) => (
          <PortalConsumer manager={manager as PortalMethods}>
            {children}
          </PortalConsumer>
        )}
      </PortalContext.Consumer>
    );
  }
}

export { Portal };
