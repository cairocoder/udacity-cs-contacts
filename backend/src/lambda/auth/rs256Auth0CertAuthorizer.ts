
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { Jwt } from '../../auth/Jwt'

/**
 *  A clone copy from exercise. Just to verify the auth. Will not be used.
 */
const cert = `-----BEGIN CERTIFICATE-----
MIIDCTCCAfGgAwIBAgIJGoZbG6ROwpnfMA0GCSqGSIb3DQEBCwUAMCIxIDAeBgNV
BAMTF2NhaXJvY29kZXIudXMuYXV0aDAuY29tMB4XDTIxMDMyMjE4MzYwNFoXDTM0
MTEyOTE4MzYwNFowIjEgMB4GA1UEAxMXY2Fpcm9jb2Rlci51cy5hdXRoMC5jb20w
ggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC7hSfqz2wZPHQOiGMuUtxl
2xIY8DCWSsWJ0K5+sAJSJXxiNgBgTf+i2rRMsN7GWetq5Zl3JkCFFAarkdaM6fF0
89AKA9wUUHdZ4ATwDPeb1oa+hmxkvmAeWhimB+NwzhBB7vOUy4YBYcxY3QGUAEi/
6HOLAFoCtXAtSLwoX+2CbCn4sv6UaX0HoIWZ+S/lWXiRYluuNcmSoiRU55PiQAO+
jWQx9Vz/2R9fqYxndyHX/R8d3g1zmB40hyhHHvi77TDBgBRAuQwuGF2srisPK01Y
qjhyi56VMgjbais1aIKtuxp9/hK+mp8wRU+VkkbLsdVQgRfLwMjeTlcyTJOLufG5
AgMBAAGjQjBAMA8GA1UdEwEB/wQFMAMBAf8wHQYDVR0OBBYEFKYpiSvn/FZ/PP9u
zkuXYTWju0+rMA4GA1UdDwEB/wQEAwIChDANBgkqhkiG9w0BAQsFAAOCAQEASq2I
BFLiBit3Vn1wbSpQtBeeexoQR4ZUL6ptSVUtqbRbOiL530r1ZEZs3oZDtR6qhcKn
LtYt/YXaTXzmYbzyEJ9jx8IcXj9H144Mapjz6JDK5/TgrAJNdfBK7jhMohTTsOiC
4AbO34Ckmv3J733g1Ih74Mg94drHcCB7M4xOPGxeYSzTeQ+khVr58WYz5AwyAj8Q
6bJsstWLuLdyKx6ns8r3CQWafCmnIjq6wtN5PRS5XW/ojGJ203RBN+oFavQT4NhQ
TVUnFOC0XCtzxuJx4F+xdJLsQ4R44P6D++2ib6whwPlKWA6Xv49xjPEHbxP1cjkf
we5bJ9EjcsS510bYSg==
-----END CERTIFICATE-----`

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    const jwtToken = verifyToken(event.authorizationToken)
    console.log('User was authorized', jwtToken)

    return {
      principalId: jwtToken.payload.sub,
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
    console.log('User authorized', e.message)

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

function verifyToken(authHeader: string): Jwt {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, cert, { algorithms: ['RS256'] }) as Jwt
}
