import React from 'react';

import type { PortalMethods } from './PortalHost';

type Props = {
  manager: PortalMethods;
  children: React.ReactNode;
};

export class PortalConsumer extends React.Component<Props> {
  override componentDidMount() {
    this.isMounted = true;
    Promise.resolve().then(() => {
      if (this.isMounted && this.key === undefined) {
        this.key = this.props.manager.mount(this.props.children);
      }
    });
  }

  override componentDidUpdate(previousProps: Props) {
    if (this.key === undefined) return;
    if (previousProps.manager !== this.props.manager) {
      previousProps.manager.unmount(this.key);
      this.key = this.props.manager.mount(this.props.children);
    } else {
      this.props.manager.update(this.key, this.props.children);
    }
  }

  override componentWillUnmount() {
    this.isMounted = false;
    if (this.key !== undefined) {
      this.props.manager.unmount(this.key);
      this.key = undefined;
    }
  }

  private key?: number;
  private isMounted = false;

  override render() {
    return null;
  }
}
