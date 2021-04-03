import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { CreateContactRequest } from '../../requests/CreateContactRequest';
import { createContact } from '../../bll/contacts';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newContact: CreateContactRequest = JSON.parse(event.body);

  // contactItem cannot be empty
  if (!newContact.name || !newContact.phone) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'name or phone can\'t be empty'
      })
    };
  }

  const contactItem = await createContact(event, newContact);

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item: contactItem
    })
  };
}