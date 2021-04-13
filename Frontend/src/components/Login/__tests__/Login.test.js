import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import mockAxios from "axios";
import { setupServer } from 'msw/node';
import React from 'react';
import { fireEvent, render, screen } from '../../../test-utils';
import { Login } from '../Login';


const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('displays login page and makes API call', async () => {
  const user = {
    "user": {
      "avatar": "https://s3.amazonaws.com/splitwise/uploads/user/default_avatars/avatar-ruby47-100px.png",
      "default_currency": "USD",
      "email": "abc@gmail.com",
      "first_name": "Robert",
      "last_name": "Leland",
      "password": "Abc@1234",
      "registration_status": "JOINED",
      "time_zone": "Europe/Berlin"
    }
  };
  mockAxios.post.mockResolvedValue({
    data: user
  });

  render(<Login />)

  const email = screen.getByPlaceholderText('Enter email');
  fireEvent.change(email, { target: { value: 'michael@gmail.com' } });
  const password = screen.getByPlaceholderText('Password');
  fireEvent.change(password, { target: { value: 'password' } });

  fireEvent.click(screen.getByText('Submit'));

  setTimeout(() => {
    expect(mockAxios.post).toBeCalledWith("http://localhost:3001/user/login", {
      "id": "michael@gmail.com",
      "password": "password"
    });
  }, 100);
});
