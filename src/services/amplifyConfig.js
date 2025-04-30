import { Amplify } from "aws-amplify";

export const configureAmplify = (
  region,
  userPoolId,
  userPoolWebClientId,
  identityPoolId
) => {
  Amplify.configure({
    Auth: {
      Cognito: {
        region: region,
        userPoolId: userPoolId,
        userPoolClientId: userPoolWebClientId,
        identityPoolId: identityPoolId,
      },
    },
  });
};
