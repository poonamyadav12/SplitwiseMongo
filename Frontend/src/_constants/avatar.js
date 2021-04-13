var _ = require('lodash');

export const userImages = [
  'https://s3.amazonaws.com/splitwise/uploads/user/default_avatars/avatar-ruby47-100px.png',
  'https://s3.amazonaws.com/splitwise/uploads/user/default_avatars/avatar-orange23-100px.png',
  'https://s3.amazonaws.com/splitwise/uploads/user/default_avatars/avatar-ruby44-100px.png',
  'https://s3.amazonaws.com/splitwise/uploads/user/default_avatars/avatar-teal12-100px.png',
  'https://s3.amazonaws.com/splitwise/uploads/user/default_avatars/avatar-blue40-100px.png',
  'https://s3.amazonaws.com/splitwise/uploads/user/default_avatars/avatar-blue35-100px.png',
];

export function getDefaultUserImage() {
  return _.sample(userImages);
}

export const groupImages = [
  'https://s3.amazonaws.com/splitwise/uploads/group/default_avatars/avatar-teal12-house-50px.png',
  'https://s3.amazonaws.com/splitwise/uploads/group/default_avatars/avatar-blue5-house-50px.png',
  'https://s3.amazonaws.com/splitwise/uploads/group/default_avatars/avatar-ruby18-house-50px.png',
];

export function getDefaultGroupImage() {
  return _.sample(groupImages);
}