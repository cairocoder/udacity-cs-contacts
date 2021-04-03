import 'source-map-support/register';
import * as uuid from 'uuid';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { getUserId } from '../lambda/utils';
import ContactsAccess from '../dal/contactsAccess';
import ContactsStorage from '../dal/contactsStorage';
import { ContactItem } from '../models/ContactItem';
import { CreateContactRequest } from '../requests/CreateContactRequest';
import { UpdateContactRequest } from '../requests/UpdateContactRequest';
import { createLogger } from '../utils/logger'
const contactsAccess = new ContactsAccess();
const contactsStorage = new ContactsStorage();
const logger = createLogger('contacts')
/**
 *
 * Create a contactlist item
 * @export
 * @param {APIGatewayProxyEvent} event
 * @param {CreateContactRequest} createContactRequest
 * @returns {Promise<ContactItem>}
 */
export async function createContact(event: APIGatewayProxyEvent,
    createContactRequest: CreateContactRequest): Promise<ContactItem> {
    const contactId = uuid.v4();
    const userId = getUserId(event);
    const createdAt = new Date(Date.now()).toISOString();

    const contactItem = {
        userId,
        contactId,
        createdAt,
        done: false,
        //attachmentUrl: `https://${contactsStorage.getBucketName()}.s3-us-east-1.amazonaws.com/images/${contactId}.png`,
        ...createContactRequest
    };

    logger.info('Storing new item: ' + JSON.stringify(contactItem));
    await contactsAccess.addContactToDB(contactItem);

    return contactItem;
}
/**
 * Delete a contact list item from database
 *
 * @export
 * @param {APIGatewayProxyEvent} event
 * @returns
 */
export async function deleteContact(event: APIGatewayProxyEvent) {
    const contactId = event.pathParameters.contactId;
    const userId = getUserId(event);

    if (!(await contactsAccess.getContactFromDB(contactId, userId))) {
        return false;
    }

    await contactsAccess.deleteContactFromDB(contactId, userId);

    return true;
}
/**
 * get a Contact list item from database.
 *
 * @export
 * @param {APIGatewayProxyEvent} event
 * @returns
 */
export async function getContact(event: APIGatewayProxyEvent) {
    const contactId = event.pathParameters.contactId;
    const userId = getUserId(event);

    return await contactsAccess.getContactFromDB(contactId, userId);
}
/**
 * get ToDo list from database
 *
 * @export
 * @param {APIGatewayProxyEvent} event
 * @returns
 */
export async function getContacts(event: APIGatewayProxyEvent) {
    const userId = getUserId(event);

    return await contactsAccess.getAllContactsFromDB(userId);
}
/**
 *  update ToDo list to database
 *
 * @export
 * @param {APIGatewayProxyEvent} event
 * @param {UpdateContactRequest} updateContactRequest
 * @returns
 */
export async function updateContact(event: APIGatewayProxyEvent,
    updateContactRequest: UpdateContactRequest) {
    const contactId = event.pathParameters.contactId;
    const userId = getUserId(event);

    if (!(await contactsAccess.getContactFromDB(contactId, userId))) {
        return false;
    }
    await contactsAccess.updateContactInDB(contactId, userId, updateContactRequest);

    return true;
}
/**
 *
 *
 * @export
 * @param {APIGatewayProxyEvent} event
 * @returns
 */
export async function generateUploadUrl(event: APIGatewayProxyEvent) {
    const bucket = contactsStorage.getBucketName();
    const urlExpiration = +process.env.AWS_S3_SIGNED_URL_EXPIRATION;
    const contactId = event.pathParameters.contactId;
    const userId = getUserId(event);

    const attachmentUrl = `https://${contactsStorage.getBucketName()}.s3.amazonaws.com/images/${contactId}.png`;

    const CreateSignedUrlRequest = {
        Bucket: bucket,
        Key: `images/${contactId}.png`,
        Expires: urlExpiration
    }

    var result = await contactsStorage.getPresignedUploadURL(CreateSignedUrlRequest);
    logger.info("contactsStorage.getPresignedUploadURL", result);

    //update attachment Info to DB.
    if (!(await contactsAccess.getContactFromDB(contactId, userId))) {
      return false;
    }
    logger.info(`{contactId} :: {userId} :: {attachmentUrl}`);
    await contactsAccess.updateAttachmentInDB(contactId, userId, attachmentUrl);

  return result;
}
