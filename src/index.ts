import got, { Headers, Method, OptionsOfJSONResponseBody } from 'got';
import { IDoksApiClientOptions, IDoksApiResponse, IDoksCustomer, IDoksIdentification, IDoksInformationRequest } from './interfaces';
import moment from 'moment';
import { HttpsAgent } from 'agentkeepalive';
import * as validators from './helpers/validators';

export class DoksApiClient {
  options!: IDoksApiClientOptions;

  /** @private */
  keepAliveAgent: HttpsAgent = new HttpsAgent();

  /** @private */
  accessToken: string | undefined;

  /** @private */
  accessTokenExpiresAt: moment.Moment | undefined;

  constructor(options: IDoksApiClientOptions) {
    this.options = options;

    if ( ! this.options.apikey) {
      throw new Error('Missing options.apikey');
    }

    if ( ! this.options.email) {
      throw new Error('Missing options.email');
    }

    if ( ! this.options.apiBaseUrl) {
      this.options.apiBaseUrl = 'https://data.doks.fi/api';
    }

    if ( ! this.options.apiVersion) {
      this.options.apiVersion = 'current';
    }
  }

  /** @private */
  async refreshAccessToken(): Promise<void> {
    
    // If refreshing access token is necessary
    if ( ! this.accessTokenExpiresAt || moment().isAfter(this.accessTokenExpiresAt)) {
      const accessTokenResult : IDoksApiResponse = await got({
        url    : `${this.options.apiBaseUrl}/${this.options.apiVersion}/user/auth`,
        method : 'POST',
        agent  : { https : this.keepAliveAgent },
        json   : { 
          apikey : this.options.apikey,
          email  : this.options.email 
        },

        resolveBodyOnly : true
      }).json();

      this.accessToken = accessTokenResult.data.jwt;

      // Access token expires in 10 seconds, subract 1 seconds just to make sure we refresh in time
      this.accessTokenExpiresAt = moment().add(9, 'seconds');
    }
  }

  /** @private */
  constructUrl(uri: string): string {
    return `${this.options.apiBaseUrl}/${this.options.apiVersion}/${uri}`;
  }

  /** @private */
  async getDefaultHttpHeaders(): Promise<Headers> {
    await this.refreshAccessToken();

    return {
      Authorization: `Bearer ${this.accessToken}`
    };
  }

  /** @private */
  async request(method: Method, uri: string, json?: any): Promise<any> {
    const response: IDoksApiResponse = await got({
      url  : this.constructUrl(uri),
      json : json,

      headers : await this.getDefaultHttpHeaders(),
      agent   : { https : this.keepAliveAgent },

      resolveBodyOnly: true,
      responseType    : 'json',
      throwHttpErrors : false,

      method
    });

    if ( ! response.status ) {
      return this.httpErrorHandler(response);
    }

    return response.data;
  }

  /** @private */
  httpErrorHandler(response: IDoksApiResponse) {
    const errors = response.errors.map((e) => `${e.message} (CODE: ${e.code})`).join(', ');

    throw new Error(`Doks HTTP error (${response.code}): ${errors}`);
  }

  isValidBusinessId(businessId: string) {
    return validators.isValidBusinessId(businessId);
  }

  async getCustomers(): Promise<IDoksCustomer[]> {
    return await this.request('GET', 'user/customers');
  }

  async getCustomerById(customerId: string): Promise<IDoksCustomer> {
    return await this.request('GET', `user/customers/${customerId}`);
  }

  /**
   * Create new customer to Doks
   * @param customer Required fields: `businessid`, `name`, `country`, `type`
   */
  async createCustomer(customer: Partial<IDoksCustomer>): Promise<IDoksCustomer> {
    return await this.request('POST', 'user/customers', customer);
  }

  async getIdentificationsByCustomerId(customerId: string): Promise<IDoksIdentification> {
    return await this.request('GET', `user/customers/${customerId}/identifications`);
  }

  /**
   * Create identification (will not be sent when created)
   * @param customerId Customer id in Doks
   * @param identification Required fields: `name` and `email`
   */
  async createIdentificationByCustomerId(customerId: string, identification: Partial<IDoksIdentification>): Promise<IDoksIdentification> {
    return await this.request('POST', `user/customers/${customerId}/identifications`, identification);
  }

  async getIdentificationByCustomerAndIdentificationId(customerId: string, identificationId: string) {
    return await this.request('GET', `user/customers/${customerId}/identifications/${identificationId}/send`);
  }

  async sendIdentificationByCustomerAndIdentificationId(customerId: string, identificationId: string) {
    return await this.request('POST', `user/customers/${customerId}/identifications/${identificationId}/send`, {});
  }

  async getInformationRequestsByCustomerId(customerId: string): Promise<IDoksInformationRequest> {
    return await this.request('GET', `user/customers/${customerId}/requests`);
  }

  /**
   * Create information request (will not be sent when created)
   * @param customerId Customer id in Doks
   * @param request Required fields: `email`
   */
   async createInformationRequestByCustomerId(customerId: string, request: Partial<IDoksInformationRequest>): Promise<IDoksInformationRequest> {
    return await this.request('POST', `user/customers/${customerId}/requests`, request);
  }

  async sendInformationRequestByCustomerAndIdentificationId(customerId: string, identificationId: string) {
    return await this.request('POST', `user/customers/${customerId}/requests/${identificationId}/send`, {});
  }

}