/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getWindspeed = /* GraphQL */ `
  query GetWindspeed($id: ID!) {
    getWindspeed(id: $id) {
      id
      deviceID
      value
      index
      createdAt
      updatedAt
    }
  }
`;
export const listWindspeeds = /* GraphQL */ `
  query ListWindspeeds(
    $filter: ModelwindspeedFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listWindspeeds(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        deviceID
        value
        index
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
