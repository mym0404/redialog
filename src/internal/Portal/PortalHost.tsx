import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { useActiveDialog } from '../DialogAccessibility';

import { PortalManager } from './PortalManager';
import { registerPortalHost } from './PortalRegistry';

type Props = {
  children: React.ReactNode;
  testID?: string;
  hostId?: string;
};

type Operation =
  | { type: 'mount'; key: number; children: React.ReactNode }
  | { type: 'update'; key: number; children: React.ReactNode }
  | { type: 'unmount'; key: number };

export type PortalMethods = {
  getDepth: () => number;
  mount: (children: React.ReactNode) => number;
  update: (key: number, children: React.ReactNode) => void;
  unmount: (key: number) => void;
};

export const PortalContext = React.createContext<PortalMethods | undefined>(
  undefined
);

export function PortalHost(props: Props) {
  const parent = React.useContext(PortalContext);
  const generatedHostId = React.useId();
  const hostId = props.hostId ?? generatedHostId;
  const depth = (parent?.getDepth() ?? -1) + 1;
  const isActive = useActiveDialog(
    (active) => active?.layer?.hostId === hostId
  );
  const shouldHide = useActiveDialog(
    (active) =>
      active?.layer?.hostId === hostId ||
      (depth === 0 && active?.layer?.depth === 0)
  );
  return (
    <PortalHostImplementation
      {...props}
      hostId={hostId}
      depth={depth}
      isActive={isActive}
      shouldHide={shouldHide}
    />
  );
}

class PortalHostImplementation extends React.Component<
  Props & {
    hostId: string;
    depth: number;
    isActive: boolean;
    shouldHide: boolean;
  }
> {
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
    if (previousProps.hostId !== this.props.hostId) {
      this.unregister?.();
      this.unregister = undefined;
      this.register();
    }
  }

  override componentWillUnmount() {
    this.unregister?.();
  }

  private register = () => {
    this.unregister = registerPortalHost(this.props.hostId, this.methods);
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
    getDepth: () => this.props.depth,
    mount: this.mount,
    update: this.update,
    unmount: this.unmount,
  };

  override render() {
    const { hostId, depth, isActive, shouldHide } = this.props;

    return (
      <PortalContext.Provider value={this.methods}>
        <View
          testID={this.props.testID}
          collapsable={false}
          aria-hidden={shouldHide}
          pointerEvents={shouldHide ? 'none' : 'box-none'}
          style={styles.content}
        >
          {this.props.children}
        </View>
        <View
          pointerEvents="box-none"
          style={[StyleSheet.absoluteFill, { zIndex: isActive ? 2 : 1 }]}
        >
          <PortalManager ref={this.setManager} hostId={hostId} depth={depth} />
        </View>
      </PortalContext.Provider>
    );
  }
}

const styles = StyleSheet.create({
  content: { flex: 1 },
});
