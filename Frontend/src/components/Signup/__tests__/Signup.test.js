import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import mockAxios from "axios";
import { setupServer } from 'msw/node';
import React from 'react';
import { fireEvent, render, screen } from '../../../test-utils';
import { Signup, SignupForTest } from '../Signup';
import renderer from 'react-test-renderer';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';


const server = setupServer();

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('displays signup page and makes API call', async () => {
  const user = {
    "user": {
      "email": "abc@gmail.com",
      "first_name": "Michael",
      "last_name": "Clarke",
      "password": "Abc@1234",
    }
  };
  mockAxios.post.mockImplementationOnce(() =>
    Promise.resolve({
      data: user
    })
  );

  render(<Signup />)

  const firstName = screen.getByPlaceholderText('Enter first name');
  fireEvent.change(firstName, { target: { value: 'Michael' } });

  const lastName = screen.getByPlaceholderText('Enter last name');
  fireEvent.change(firstName, { target: { value: 'Clarke' } });

  const email = screen.getByPlaceholderText('Enter email');
  fireEvent.change(email, { target: { value: 'abc@gmail.com' } });

  const password = screen.getByPlaceholderText('Password');
  fireEvent.change(password, { target: { value: 'Abc@1234' } });

  fireEvent.click(screen.getByText('Submit'));

  setTimeout(() => {
    expect(mockAxios.post).toHaveBeenCalledWith("http://localhost:3001/user/signup", {
      user: {
        "email": "abc@gmail.com",
        "first_name": "Michael",
        "last_name": "Clarke",
        "password": "Abc@1234",
      }
    });
  }, 100);
});

test('renders correctly', () => {
  const tree = renderer
    .create(<SignupForTest user={null} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

