import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'
import { secretsManager } from 'middy/middlewares'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-uz2wzhen.auth0.com/.well-known/jwks.json';
const secretId = process.env.AUTH_0_SECRET_ID;
const secretField = process.env.AUTH_0_SECRET_FIELD;

export const handler = middy(
    async (
      event: CustomAuthorizerEvent,
      context
    ): Promise<CustomAuthorizerResult> => {
      logger.info('Authorizing a user', event.authorizationToken);
      logger.info(`jwks url ${jwksUrl}`);

      try {
        const jwtToken = await verifyToken(event.authorizationToken, context.AUTH0_SECRET[secretField]);
        logger.info('User was authorized', jwtToken);

        return {
          principalId: jwtToken.sub,
          policyDocument: {
            Version: '2012-10-17',
            Statement: [
              {
                Action: 'execute-api:Invoke',
                Effect: 'Allow',
                Resource: '*'
              }
            ]
          }
        }
      } catch (e) {
        logger.error('User not authorized', { error: e.message });

        return {
          principalId: 'user',
          policyDocument: {
            Version: '2012-10-17',
            Statement: [
              {
                Action: 'execute-api:Invoke',
                Effect: 'Deny',
                Resource: '*'
              }
            ]
          }
        }
      }
    }
);

async function verifyToken(
  authHeader: string,
  secret: string
): Promise<JwtPayload> {
  const token = getToken(authHeader);

  return verify(token, secret) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header');

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header');

  const split = authHeader.split(' ');
  const token = split[1];

  return token
}

handler.use(
  secretsManager({
    cache: true,
    cacheExpiryInMillis: 60000,
    // Throw an error if can't read the secret
    throwOnFailedCall: true,
    secrets: {
      AUTH0_SECRET: secretId
    }
  })
);
