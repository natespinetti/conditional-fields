import { createClient } from "contentful";

const environment = process.env.NODE_ENV === "production" ? "master" : "staging";

export const client = createClient({
  space: 'epr5de294ckl',
  accessToken: '5eRLGi-fdgvxWKM9vWn1sO66mcNZgJhXPQlNIcJI8GY',
  environment: environment,
});