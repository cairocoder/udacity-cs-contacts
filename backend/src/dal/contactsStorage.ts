import { CreateSignedUrlRequest } from '../requests/CreateSignedUrlRequest';
import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import { createLogger } from '../utils/logger'
const XAWS = AWSXRay.captureAWS(AWS);

const s3 = new XAWS.S3({
    signatureVersion: 'v4'
  })
const contactsStorage = process.env.AWS_BUCKET;


const logger = createLogger('ContactsStorage')
//env: process.env.AWS_BUCKET
export default class ContactsStorage {
    constructor(

    ) { }
    /**
     *To get the storage bucket name
     *
     * @returns
     * @memberof ContactsStorage
     */
    getBucketName() {
        return contactsStorage;
    }
    /**
     * Ge the item using Signed Url
     *
     * @param {CreateSignedUrlRequest} CreateSignedUrlRequest
     * @returns
     * @memberof ContactsStorage
     */
    async getPresignedUploadURL(createSignedUrlRequest: CreateSignedUrlRequest) {
        logger.info('getPresignedUploadURL', {
            // Additional information stored with a log statement
            requestData: createSignedUrlRequest
          });

        /*return s3.getSignedUrl('putObject',
           {
            Bucket: createSignedUrlRequest.Bucket,
            Key: createSignedUrlRequest.Key,
            Expires: createSignedUrlRequest.Expires
          }); */
          const signedUrl = await  this.getSignedUrl(createSignedUrlRequest);
          return signedUrl;
    }


    async getSignedUrl(createSignedUrlRequest: CreateSignedUrlRequest){
        return new Promise((resolve,reject) => {
          let params = { Bucket: createSignedUrlRequest.Bucket, Key: createSignedUrlRequest.Key, Expires: createSignedUrlRequest.Expires };
          s3.getSignedUrl('putObject', params, (err, url) => {
            if (err) reject(err)
            resolve(url);
          })
        })
    }
}
