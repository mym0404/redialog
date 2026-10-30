import * as React from 'react';

import { PortalManager } from './PortalManager';
import { registerPortalHost } from './PortalRegistry';

type Props = {
  children: React.ReactNode;
  testID?: string;
  portalId?: string;
};

type Operation =
  | { type: 'mount'; key: number; children: React.ReactNode }
  | { type: 'update'; key: number; children: React.ReactNode }
  | { type: 'unmount'; key: number };

export type PortalMethods = {
  mount: (children: React.ReactNode) => number;
  update: (key: number, children: React.ReactNode) => void;
  unmount: (key: number) => void;
};

export const PortalContext = React.createContext<PortalMethods | undefined>(
  undefined
);

export class PortalHost extends React.Component<Props> {
  static displayName = 'Portal.Host';

  private nextKey = 0;
  private queue: Operation[] = [];
  private manager: PortalManager | null | undefined;
  private unregister?: () => void;

  override componentDidMount() {
    const manager = this.manager;
    const queue = this.queue;

    while (queue.length && manager) {
      const action = queue.pop();
      if (action) {
        switch (action.type) {
          case 'mount':
            manager.mount(action.key, action.children);
            break;
          case 'update':
            manager.update(action.key, action.children);
            break;
          case 'unmount':
            manager.unmount(action.key);
            break;
        }
      }
    }

    this.register();
  }

  override componentDidUpdate(previousProps: Props) {
    if (previousProps.portalId !== this.props.portalId) {
      this.unregister?.();
      this.unregister = undefined;
      this.register();
    }
  }

  override componentWillUnmount() {
    this.unregister?.();
  }

  private register = () => {
    if (this.props.portalId !== undefined) {
      this.unregister = registerPortalHost(this.props.portalId, this.methods);
    }
  };

  private setManager = (manager: PortalManager | undefined | null) => {
    this.manager = manager;
  };

  private mount = (children: React.ReactNode) => {
    const key = this.nextKey++;

    if (this.manager) {
      this.manager.mount(key, children);
    } else {
      this.queue.push({ type: 'mount', key, children });
    }

    return key;
  };

  private update = (key: number, children: React.ReactNode) => {
    if (this.manager) {
      this.manager.update(key, children);
    } else {
      const op: Operation = { type: 'mount', key, children };
      const index = this.queue.findIndex(
        (o) => o.type === 'mount' || (o.type === 'update' && o.key === key)
      );

      if (index > -1) {
        this.queue[index] = op;
      } else {
        this.queue.push(op as Operation);
      }
    }
  };

  private unmount = (key: number) => {
    if (this.manager) {
      this.manager.unmount(key);
    } else {
      this.queue.push({ type: 'unmount', key });
    }
  };

  private methods: PortalMethods = {
    mount: this.mount,
    update: this.update,
    unmount: this.unmount,
  };

  override render() {
    return (
      <PortalContext.Provider value={this.methods}>
        {this.props.children}
        <PortalManager ref={this.setManager} />
      </PortalContext.Provider>
    );
  }
}
