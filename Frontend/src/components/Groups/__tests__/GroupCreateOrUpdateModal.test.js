import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import mockAxios from "axios";
import { setupServer } from 'msw/node';
import renderer from 'react-test-renderer'
import React from 'react';
import { fireEvent, render, screen } from '../../../test-utils';
import { GroupCreateOrUpdateModalForTest } from '../GroupCreateOrUpdateModel';
import ReactDOM from 'react-dom';

const server = setupServer()

beforeAll(() => {

  server.listen()
})
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const user1 = {
  "avatar": "https://s3.amazonaws.com/splitwise/uploads/user/default_avatars/avatar-ruby47-100px.png",
  "default_currency": "USD",
  "email": "michael@gmail.com",
  "first_name": "Michael",
  "last_name": "Leland",
  "password": "Abc@1234",
  "registration_status": "JOINED",
  "time_zone": "Europe/Berlin"
};
const user2 = {
  "avatar": "https://s3.amazonaws.com/splitwise/uploads/user/default_avatars/avatar-ruby47-100px.png",
  "default_currency": "USD",
  "email": "brett@gmail.com",
  "first_name": "Brett",
  "last_name": "Lee",
  "password": "Abc@1234",
  "registration_status": "JOINED",
  "time_zone": "Europe/Berlin"
};

const group = {
  id: 'b839cd93-ce8b-4443-8cb6-eaa4d5ae519b',
  name: 'Farewell Party',
  avatar:
    'https://splitwise-images.s3.us-east-2.amazonaws.com/images/1616208501244',
  creator: 'michael@gmail.com',
  members: [user1, user2],
  group_join_status: ['JOINED', 'JOINED'],
};


test('displays group update modal page and makes API call', async () => {
  mockAxios.post.mockResolvedValue({
    data: group
  });

  render(<GroupCreateOrUpdateModalForTest user={user1} group={group} isOpen={true} />)

  const groupName = screen.getByPlaceholderText('1600 Pennsylvania Ave');
  expect(groupName).toHaveValue('Farewell Party');
  fireEvent.change(groupName, { target: { value: 'Farewell party again' } });
  expect(screen.getByText('brett@gmail.com')).toBeInTheDocument();
  expect(screen.getByText('michael@gmail.com')).toBeInTheDocument();

  fireEvent.click(screen.getByText('Save'));

  setTimeout(() => {
    expect(mockAxios.post).toBeCalledWith("http://localhost:3001/group/update", {
      group: {
        id: 'b839cd93-ce8b-4443-8cb6-eaa4d5ae519b',
        name: 'Farewell party again',
        avatar:
          'https://splitwise-images.s3.us-east-2.amazonaws.com/images/1616208501244',
        creator: 'michael@gmail.com',
        members: [user1, user2],
        group_join_status: ['JOINED', 'JOINED'],
      }
    });
  }, 100);
});


test('displays group create modal page and makes API call', async () => {
  mockAxios.post.mockResolvedValue({
    data: group
  });

  const newGroup = group;
  delete newGroup.id;
  render(<GroupCreateOrUpdateModalForTest createMode={true} user={user1} group={newGroup} isOpen={true} />)

  const groupName = screen.getByPlaceholderText('1600 Pennsylvania Ave');
  expect(groupName).toHaveValue('Farewell Party');
  fireEvent.change(groupName, { target: { value: 'Farewell party again' } });
  expect(screen.getByText('brett@gmail.com')).toBeInTheDocument();
  expect(screen.getByText('michael@gmail.com')).toBeInTheDocument();

  fireEvent.click(screen.getByText('Save'));

  setTimeout(() => {
    expect(mockAxios.post).toBeCalledWith("http://localhost:3001/group/create", {
      group: {
        name: 'Farewell party again',
        avatar:
          'https://splitwise-images.s3.us-east-2.amazonaws.com/images/1616208501244',
        creator: 'michael@gmail.com',
        members: [user1, user2],
        group_join_status: ['JOINED', 'JOINED'],
      }
    });
  }, 100);
});


test('displays group create modal page and user cancels the changes', async () => {
  mockAxios.post.mockResolvedValue({
    data: group
  });

  const newGroup = group;
  delete newGroup.id;
  render(<GroupCreateOrUpdateModalForTest createMode={true} user={user1} group={newGroup} isOpen={true} />)

  const groupName = screen.getByPlaceholderText('1600 Pennsylvania Ave');
  expect(groupName).toHaveValue('Farewell Party');
  fireEvent.change(groupName, { target: { value: 'Farewell party again' } });
  expect(screen.getByText('brett@gmail.com')).toBeInTheDocument();
  expect(screen.getByText('michael@gmail.com')).toBeInTheDocument();

  fireEvent.click(screen.getByText('Cancel'));

  setTimeout(() => {
    expect(mockAxios.post).toHaveBeenCalledTimes(0);
  }, 100);
});

test('renders correctly', () => {
  ReactDOM.createPortal = jest.fn((element, node) => {
    return element
  });
  const tree = renderer
    .create(<GroupCreateOrUpdateModalForTest user={user1} group={group} isOpen={true} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});