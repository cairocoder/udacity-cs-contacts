import * as AWS from 'aws-sdk';

import { DocumentClient } from 'aws-sdk/clients/dynamodb';
//import * as AWSXRay from 'aws-xray-sdk';
const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS);

export default class ContactsAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly contactsTable = process.env.AWS_DB_APP_TABLE,
        private readonly indexName = process.env.AWS_DB_INDEX_NAME
    ) { }
    /**
     *
     *
     * @param {*} contactItem
     * @memberof ContactsAccess
     */
    async addContactToDB(contactItem) {
        await this.docClient.put({
            TableName: this.contactsTable,
            Item: contactItem
        }).promise();
    }
    /**
     *
     *
     * @param {*} contactId
     * @param {*} userId
     * @memberof ContactsAccess
     */
    async deleteContactFromDB(contactId, userId) {
        await this.docClient.delete({
            TableName: this.contactsTable,
            Key: {
                contactId,
                userId
            }
        }).promise();
    }
    /**
     *
     *
     * @param {*} contactId
     * @param {*} userId
     * @returns
     * @memberof ContactsAccess
     */
    async getContactFromDB(contactId, userId) {
        const result = await this.docClient.get({
            TableName: this.contactsTable,
            Key: {
                contactId,
                userId
            }
        }).promise();

        return result.Item;
    }

    /**
     *
     *
     * @param {*} userId
     * @returns
     * @memberof ContactsAccess
     */
    async getAllContactsFromDB(userId) {
        const result = await this.docClient.query({
            TableName: this.contactsTable,
            IndexName: this.indexName,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise();

        return result.Items;
    }
    /**
     *
     *
     * @param {*} contactId
     * @param {*} userId
     * @param {*} updatedContact
     * @memberof ContactsAccess
     */
    async updateContactInDB(contactId, userId, updatedContact) {
        await this.docClient.update({
            TableName: this.contactsTable,
            Key: {
                contactId,
                userId
            },
            UpdateExpression: 'set #name = :n, #phone = :phn',
            ExpressionAttributeValues: {
                ':n': updatedContact.name,
                ':phn': updatedContact.phone,
                ':d': updatedContact.done
            },
            ExpressionAttributeNames: {
                '#name': 'name',
                '#phone': 'phone'
            }
        }).promise();
    }

  /**
   *
   *
   * @param {*} contactId
   * @param {*} userId
   * @param {*} attachmentUrl
   * @memberof ContactsAccess
   */
  async updateAttachmentInDB(contactId, userId, attachmentUrl) {
    await this.docClient.update({
      TableName: this.contactsTable,
      Key: {
        contactId,
        userId
      },
      UpdateExpression: 'set #attachmentUrl = :a',
      ExpressionAttributeValues: {
        ':a': attachmentUrl
      },
      ExpressionAttributeNames: {
        '#attachmentUrl': 'attachmentUrl'
      }
    }).promise();
  }
}
