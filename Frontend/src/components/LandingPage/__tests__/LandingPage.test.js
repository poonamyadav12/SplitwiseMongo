import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import mockAxios from "axios";
import { setupServer } from 'msw/node';
import renderer from 'react-test-renderer'
import React from 'react';
import { fireEvent, render, screen } from '../../../test-utils';
import { LandingPage, LandingPageForTest } from '../LandingPage';


const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('displays landing page', async () => {
  render(<LandingPage />)

  const email = screen.getByText('SIGN UP');
  fireEvent.click(email);
});

test('renders correctly', () => {
  const tree = renderer
    .create(<LandingPageForTest />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
