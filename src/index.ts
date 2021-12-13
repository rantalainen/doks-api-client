import got, { Headers, Method, OptionsOfJSONResponseBody, OptionsOfUnknownResponseBody } from 'got';
import {
  IDoksActualBeneficiaryDocumentWithMetadata,
  IDoksApiClientOptions,
  IDoksApiResponse,
  IDoksCustomer,
  IDoksDocument,
  IDoksIdentification,
  IDoksInformationRequest,
  IDoksNewCustomer,
  IDoksOwner,
  IDoksRiskRating,
  IDoksRiskAssesment
} from './interfaces';
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
  accessTokenTimeout: any;

  constructor(options: IDoksApiClientOptions) {
    this.options = options;

    if (!this.options.apikey) {
      throw new Error('Missing options.apikey');
    }

    if (!this.options.email) {
      throw new Error('Missing options.email');
    }

    if (!this.options.apiBaseUrl) {
      this.options.apiBaseUrl = 'https://data.doks.fi/api';
    }

    if (!this.options.apiVersion) {
      this.options.apiVersion = 'current';
    }
  }

  /** @private */
  resetAccessToken() {
    this.accessToken = undefined;
  }

  /** @private */
  async refreshAccessToken(): Promise<void> {
    // If refreshing access token is necessary
    if (!this.accessToken) {
      const accessTokenResult: IDoksApiResponse = await got({
        url: `${this.options.apiBaseUrl}/${this.options.apiVersion}/user/auth`,
        method: 'POST',
        agent: { https: this.keepAliveAgent },
        json: {
          apikey: this.options.apikey,
          email: this.options.email
        },

        resolveBodyOnly: true
      }).json();

      this.accessToken = accessTokenResult.data.jwt;

      // Reset token after 50 seconds
      this.accessTokenTimeout = setTimeout(() => this.resetAccessToken(), 50000);
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
  async request(method: Method, uri: string, json?: any, params?: any): Promise<any> {
    const gotOptions: OptionsOfJSONResponseBody = {
      url: this.constructUrl(uri),

      headers: await this.getDefaultHttpHeaders(),
      agent: { https: this.keepAliveAgent },

      responseType: 'json',
      throwHttpErrors: false,

      searchParams: params,

      method
    };

    // If body is defined
    if (json) {
      gotOptions.json = json;
    }

    const response: IDoksApiResponse = await got({ ...gotOptions, resolveBodyOnly: true });

    if (!response.status) {
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
   * @param customer Required fields: `name`, `country`, `type` (person or business)
   */
  async createCustomer(customer: Partial<IDoksNewCustomer>): Promise<IDoksCustomer> {
    return await this.request('POST', 'user/customers', customer);
  }

  /** Update customer
   * @param properties updated fields
   */
  async patchCustomerById(customerId: string, properties: Partial<IDoksCustomer>): Promise<IDoksCustomer> {
    return await this.request('PATCH', `user/customers/${customerId}`, properties);
  }

  async getIdentificationsByCustomerId(customerId: string): Promise<IDoksIdentification[]> {
    return await this.request('GET', `user/customers/${customerId}/identifications`);
  }

  async getRiskRatings(): Promise<IDoksRiskRating[]> {
    return await this.request('GET', 'user/riskratings');
  }

  async getRiskAssesmentsByCustomerId(customerId: string): Promise<IDoksRiskAssesment[]> {
    return await this.request('GET', `user/customers/${customerId}/riskassessments`);
  }

  /**
   * Create identification (will not be sent when created)
   * @param customerId Customer id in Doks
   * @param identification Required fields: `name` and `email`
   */
  async createIdentificationByCustomerId(customerId: string, identification: Partial<IDoksIdentification>): Promise<IDoksIdentification> {
    if (!identification.available_eidmethods && this.options.apiVersion == 'current') {
      identification['available_eidmethods'] = ['NETSEIDENT_BANKID_FI', 'NETSEIDENT_MOBIILIVARMENNE_FI'];
    }

    return await this.request('POST', `user/customers/${customerId}/identifications`, identification);
  }

  async getIdentificationByCustomerAndIdentificationId(customerId: string, identificationId: string): Promise<IDoksIdentification> {
    return await this.request('GET', `user/customers/${customerId}/identifications/${identificationId}`);
  }

  async sendIdentificationByCustomerAndIdentificationId(customerId: string, identificationId: string): Promise<IDoksIdentification> {
    return await this.request('POST', `user/customers/${customerId}/identifications/${identificationId}/send`, {});
  }

  async getInformationRequestsByCustomerId(customerId: string): Promise<IDoksInformationRequest[]> {
    return await this.request('GET', `user/customers/${customerId}/requests`);
  }

  /**
   * Create information request (will not be sent when created)
   * @param customerId Customer id in Doks
   * @param request Required fields: `email`
   */
  async createInformationRequestByCustomerId(
    customerId: string,
    request: Partial<IDoksInformationRequest>
  ): Promise<IDoksInformationRequest> {
    return await this.request('POST', `user/customers/${customerId}/requests`, request);
  }

  async sendInformationRequestByCustomerAndIdentificationId(
    customerId: string,
    identificationId: string
  ): Promise<IDoksInformationRequest> {
    return await this.request('POST', `user/customers/${customerId}/requests/${identificationId}/send`, {});
  }

  async getInformationRequestByCustomerAndIdentificationId(customerId: string, identificationId: string): Promise<IDoksInformationRequest> {
    return await this.request('GET', `user/customers/${customerId}/identifications/${identificationId}`);
  }

  /**
   * Get customers by filters
   * @param filters filter field name must be contained in `IDoksCustomer`
   * @param fields list of fields that should be returned, fields must be contained in `IDoksCustomer` and `id` is always returned
   */
  async getCustomersByFilters(filters: Partial<IDoksCustomer>, fields?: string[]): Promise<Partial<IDoksCustomer[]>> {
    const params: any = { ...filters };

    if (fields) {
      params.fields = fields.join(',');
    }

    return await this.request('GET', `user/filter`, null, params);
  }

  async getDocumentsByCustomerId(customerId: string): Promise<IDoksDocument[]> {
    return await this.request('GET', `user/customers/${customerId}/documents`);
  }

  async getPdfByCustomerId(customerId: string): Promise<Buffer> {
    // Fetch short lived access token for PDF fetching
    const accessTokenResponse: IDoksApiResponse = await got({
      method: 'PUT',
      url: this.constructUrl('user/auth'),
      json: { lifetime: 5 },
      headers: await this.getDefaultHttpHeaders()
    }).json();

    const url = this.constructUrl(`user/customers/${customerId}/pdf`);

    return await got({
      method: 'GET',
      url: url,
      searchParams: { jwt: accessTokenResponse.data.jwt },
      resolveBodyOnly: true,
      agent: { https: this.keepAliveAgent }
    }).buffer();
  }

  async getDocumentsByCustomerIdAndType(customerId: string, type: string): Promise<IDoksDocument[]> {
    const documents = await this.getDocumentsByCustomerId(customerId);
    const filtered = documents.filter((document) => document.type === type);

    return filtered;
  }

  async getOwnersByCustomerId(customerId: string): Promise<IDoksOwner[]> {
    return await this.request('GET', `user/customers/${customerId}/owners`);
  }

  async createOwnerByCustomerId(customerId: string, owner: Partial<IDoksOwner>) {
    return await this.request('POST', `user/customers/${customerId}/owners`, owner);
  }

  /**
   * @returns `document` if document found or `undefined` if document could not be found
   */
  async buyActualBeneficiariesDocumentByCustomerId(customerId: string): Promise<IDoksActualBeneficiaryDocumentWithMetadata | undefined> {
    try {
      const document = await this.request('POST', `user/customers/${customerId}/documents/buy/actualbeneficiaries`, {});

      return document;
    } catch (e: any) {
      if (e.message?.includes('USER_CUSTOMERS_DOCUMENTS_ACTUALBENEFICIARIES_NO_ACTUAL_BENEFICIARIES_FOUND')) {
        return undefined;
      } else {
        throw e;
      }
    }
  }
}
