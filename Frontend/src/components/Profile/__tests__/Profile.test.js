import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import mockAxios from "axios";
import { setupServer } from 'msw/node';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { fireEvent, render, screen } from '../../../test-utils';
import { ProfileForTest } from '../Profile';
import renderer from 'react-test-renderer';


const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

let updateValue = {};
const user = {
  "email": "abc@gmail.com",
  "first_name": "Michael",
  "last_name": "Clarke",
  "password": "Abc@1234",
  "time_zone": "Asia/Kolkata",
  "default_currency": "USD",
  "avatar": "www.example.com",
};
const update = (user) => { updateValue = user };

test('displays profile page and makes API call', async () => {

  mockAxios.post.mockImplementationOnce(() =>
    Promise.resolve({
      data: user
    })
  );

  render(<BrowserRouter><ProfileForTest user={user} update={update} /></BrowserRouter>)

  const firstName = screen.getByText('Michael');
  const lastName = screen.getByText('Clarke');
  const email = screen.getByText('abc@gmail.com');

  fireEvent.click(screen.getByText('Submit'));

  expect(updateValue).toEqual({ user });
});

test('renders correctly', () => {
  const tree = renderer
    .create(<ProfileForTest user={user} update={update}/>)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
