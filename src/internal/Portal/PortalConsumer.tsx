import React from 'react';

import type { PortalMethods } from './PortalHost';

type Props = {
  manager: PortalMethods;
  children: React.ReactNode;
};

export class PortalConsumer extends React.Component<Props> {
  override async componentDidMount() {
    this.checkManager();

    await Promise.resolve();

    this.key = this.props.manager.mount(this.props.children);
  }

  override componentDidUpdate() {
    this.checkManager();

    this.props.manager.update(this.key, this.props.children);
  }

  override componentWillUnmount() {
    this.checkManager();

    this.props.manager.unmount(this.key);
  }

  private key: any;

  private checkManager() {
    if (!this.props.manager) {
      throw new Error("Wrapped PortalHost doesn't exist");
    }
  }

  override render() {
    return null;
  }
}
