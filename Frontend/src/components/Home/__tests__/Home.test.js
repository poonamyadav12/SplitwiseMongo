import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import mockAxios from "axios";
import { setupServer } from 'msw/node';
import renderer from 'react-test-renderer'
import React from 'react';
import { fireEvent, render, screen } from '../../../test-utils';
import { HomeForTest } from '../Home';
import { BrowserRouter } from 'react-router-dom';

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const clearAlert = () => { };

test('renders correctly', () => {
  const tree = renderer
    .create(<BrowserRouter><HomeForTest clearAlert={clearAlert} /></BrowserRouter>)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
