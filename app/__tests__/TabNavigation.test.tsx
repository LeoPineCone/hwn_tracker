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

  expect(node(tree, 'tab-karte').props.accessibilityState.selected).toBe(true);
  expect(node(tree, 'tab-erfolge').props.accessibilityState.selected).toBe(false);
  expect(node(tree, 'tab-profil').props.accessibilityState.selected).toBe(false);

  expect(node(tree, 'tabslot-karte').props.style.display).toBe('flex');
  expect(node(tree, 'tabslot-erfolge').props.style.display).toBe('none');
  expect(node(tree, 'tabslot-profil').props.style.display).toBe('none');
});

test('tapping Erfolge activates it', async () => {
  const tree = await createApp();

  await press(tree, 'tab-erfolge');

  expect(node(tree, 'tab-erfolge').props.accessibilityState.selected).toBe(true);
  expect(node(tree, 'tab-karte').props.accessibilityState.selected).toBe(false);

  expect(node(tree, 'tabslot-erfolge').props.style.display).toBe('flex');
  expect(node(tree, 'tabslot-karte').props.style.display).toBe('none');
});

test('tapping Profil activates it', async () => {
  const tree = await createApp();

  await press(tree, 'tab-profil');

  expect(node(tree, 'tab-profil').props.accessibilityState.selected).toBe(true);
  expect(node(tree, 'tab-karte').props.accessibilityState.selected).toBe(false);

  expect(node(tree, 'tabslot-profil').props.style.display).toBe('flex');
  expect(node(tree, 'tabslot-karte').props.style.display).toBe('none');
});

test('tapping back to Karte restores it', async () => {
  const tree = await createApp();

  await press(tree, 'tab-erfolge');
  await press(tree, 'tab-karte');

  expect(node(tree, 'tab-karte').props.accessibilityState.selected).toBe(true);
  expect(node(tree, 'tabslot-karte').props.style.display).toBe('flex');
});
