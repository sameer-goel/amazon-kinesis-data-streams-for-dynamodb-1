/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createWindspeed = /* GraphQL */ `
  mutation CreateWindspeed(
    $input: CreateWindspeedInput!
    $condition: ModelwindspeedConditionInput
  ) {
    createWindspeed(input: $input, condition: $condition) {
      id
      deviceID
      value
      index
      createdAt
      updatedAt
    }
  }
`;
export const updateWindspeed = /* GraphQL */ `
  mutation UpdateWindspeed(
    $input: UpdateWindspeedInput!
    $condition: ModelwindspeedConditionInput
  ) {
    updateWindspeed(input: $input, condition: $condition) {
      id
      deviceID
      value
      index
      createdAt
      updatedAt
    }
  }
`;
export const deleteWindspeed = /* GraphQL */ `
  mutation DeleteWindspeed(
    $input: DeleteWindspeedInput!
    $condition: ModelwindspeedConditionInput
  ) {
    deleteWindspeed(input: $input, condition: $condition) {
      id
      deviceID
      value
      index
      createdAt
      updatedAt
    }
  }
`;
