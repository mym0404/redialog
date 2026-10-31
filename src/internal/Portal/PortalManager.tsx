import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PortalLayerContext, useActiveDialog } from '../DialogAccessibility';

type State = {
  portals: {
    key: number;
    children: React.ReactNode;
  }[];
};

export class PortalManager extends React.PureComponent<
  { hostId: string; depth: number },
  State
> {
  override state: State = {
    portals: [],
  };

  mount = (key: number, children: React.ReactNode) => {
    this.setState((state) => ({
      portals: [...state.portals, { key, children }],
    }));
  };

  update = (key: number, children: React.ReactNode) =>
    this.setState((state) => ({
      portals: state.portals.map((item) => {
        if (item.key === key) {
          return { ...item, children };
        }
        return item;
      }),
    }));

  unmount = (key: number) =>
    this.setState((state) => ({
      portals: state.portals.filter((item) => item.key !== key),
    }));

  override render() {
    return this.state.portals.map(({ key, children }) => (
      <PortalLayer
        key={key}
        hostId={this.props.hostId}
        depth={this.props.depth}
        portalKey={key}
      >
        {children}
      </PortalLayer>
    ));
  }
}

function PortalLayer({
  hostId,
  depth,
  portalKey,
  children,
}: React.PropsWithChildren<{
  hostId: string;
  depth: number;
  portalKey: number;
}>) {
  const shouldHide = useActiveDialog((active) =>
    active?.layer?.hostId === hostId
      ? active?.layer?.key !== portalKey
      : active?.layer?.depth === 0
  );
  const layer = React.useMemo(
    () => ({ hostId, depth, key: portalKey }),
    [hostId, depth, portalKey]
  );
  return (
    <PortalLayerContext.Provider value={layer}>
      <View
        /* Need collapsable=false here to clip the elevations, otherwise they appear above sibling components */
        collapsable={false}
        aria-hidden={shouldHide}
        pointerEvents={shouldHide ? 'none' : 'box-none'}
        style={StyleSheet.absoluteFill}
      >
        {children}
      </View>
    </PortalLayerContext.Provider>
  );
}
