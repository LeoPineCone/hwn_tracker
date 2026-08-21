/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

function node(tree: ReactTestRenderer.ReactTestRenderer, testID: string) {
  return tree.root.findAllByProps({ testID })[0];
}

async function press(tree: ReactTestRenderer.ReactTestRenderer, testID: string) {
  await ReactTestRenderer.act(() => {
    node(tree, testID).props.onPress();
  });
}

async function createApp(): Promise<ReactTestRenderer.ReactTestRenderer> {
  let tree: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<App />);
  });
  return tree!;
}

test('Karte is the default active tab', async () => {
  const tree = await createApp();

  expect(node(tree, 'tab-map').props.accessibilityState.selected).toBe(true);
  expect(node(tree, 'tab-rewards').props.accessibilityState.selected).toBe(false);
  expect(node(tree, 'tab-profile').props.accessibilityState.selected).toBe(false);

  expect(node(tree, 'tabslot-map').props.style.display).toBe('flex');
  expect(node(tree, 'tabslot-rewards').props.style.display).toBe('none');
  expect(node(tree, 'tabslot-profile').props.style.display).toBe('none');
});

test('tapping Erfolge activates it', async () => {
  const tree = await createApp();

  await press(tree, 'tab-rewards');

  expect(node(tree, 'tab-rewards').props.accessibilityState.selected).toBe(true);
  expect(node(tree, 'tab-map').props.accessibilityState.selected).toBe(false);

  expect(node(tree, 'tabslot-rewards').props.style.display).toBe('flex');
  expect(node(tree, 'tabslot-map').props.style.display).toBe('none');
});

test('tapping Profil activates it', async () => {
  const tree = await createApp();

  await press(tree, 'tab-profile');

  expect(node(tree, 'tab-profile').props.accessibilityState.selected).toBe(true);
  expect(node(tree, 'tab-map').props.accessibilityState.selected).toBe(false);

  expect(node(tree, 'tabslot-profile').props.style.display).toBe('flex');
  expect(node(tree, 'tabslot-map').props.style.display).toBe('none');
});

test('tapping back to Karte restores it', async () => {
  const tree = await createApp();

  await press(tree, 'tab-rewards');
  await press(tree, 'tab-map');

  expect(node(tree, 'tab-map').props.accessibilityState.selected).toBe(true);
  expect(node(tree, 'tabslot-map').props.style.display).toBe('flex');
});

test('segmented control defaults to Karte', async () => {
  const tree = await createApp();

  expect(node(tree, 'map-segment-map').props.accessibilityState.selected).toBe(true);
  expect(node(tree, 'map-segment-stamp').props.accessibilityState.selected).toBe(false);
  expect(node(tree, 'map-view-readout').props.children).toBe('Kartenansicht kommt bald.');
});

test('segmented control selection survives a tab round trip', async () => {
  const tree = await createApp();

  await press(tree, 'map-segment-stamp');

  expect(node(tree, 'map-segment-stamp').props.accessibilityState.selected).toBe(true);
  expect(node(tree, 'map-view-readout').props.children).toBe('Stempelansicht kommt bald.');

  await press(tree, 'tab-rewards');
  await press(tree, 'tab-map');

  expect(node(tree, 'map-segment-stamp').props.accessibilityState.selected).toBe(true);
  expect(node(tree, 'map-view-readout').props.children).toBe('Stempelansicht kommt bald.');
});
