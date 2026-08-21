/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import Svg, { Path } from 'react-native-svg';
import { Icon, ICON_PATHS } from '../src/components/Icon';

test('renders the vendored map paths as separate Path elements in order', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<Icon name="map" color="#c67139" />);
  });

  const paths = renderer!.root.findAllByType(Path);
  expect(paths).toHaveLength(2);
  expect(paths.map(p => p.props.d)).toEqual([...ICON_PATHS.map]);
});

test('renders the Svg with the vendored viewBox/fill/stroke attributes', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<Icon name="profile" color="#82796a" />);
  });

  const svg = renderer!.root.findByType(Svg);
  expect(svg.props.viewBox).toBe('0 0 24 24');
  expect(svg.props.fill).toBe('none');
  expect(svg.props.strokeWidth).toBe(2.75);
  expect(svg.props.strokeLinecap).toBe('round');
  expect(svg.props.strokeLinejoin).toBe('round');
  expect(svg.props.width).toBe(21);
  expect(svg.props.height).toBe(21);
});

test('passes the color prop through as the Svg stroke', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<Icon name="rewards" color="#3d472b" />);
  });

  const svg = renderer!.root.findByType(Svg);
  expect(svg.props.stroke).toBe('#3d472b');
});
