import got, { Got, Headers, Method, OptionsOfJSONResponseBody } from 'got';
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
  IDoksRiskAnswers,
  IDoksRiskAssesment,
  IDoksActualBeneficiary,
  IDoksResponsiblePerson,
  IDoksPep
} from './interfaces';

import { HttpsAgent } from 'agentkeepalive';
import * as validators from './helpers/validators';

// Create global https agent and cacheable lookup
const httpsAgent = new HttpsAgent();

export class DoksApiClient {
  options!: IDoksApiClientOptions;

  /** Got instance to be used when making requests */
  gotInstance: Got;

  /** @private */
  accessToken: string | undefined;

  /** @private */
  accessTokenTimeout: any;

  constructor(options: IDoksApiClientOptions) {
    this.options = options;

    // Check that needed options are included
    if (!this.options.apikey) throw new Error('Missing options.apikey');
    if (!this.options.email) throw new Error('Missing options.email');

    // Set default base url and api version if none was provided
    if (!this.options.apiBaseUrl) this.options.apiBaseUrl = 'https://data.doks.fi/api';
    if (!this.options.apiVersion) this.options.apiVersion = 'current';

    // Use internal keepAliveAgent by default
    if (this.options.keepAliveAgent === true || this.options.keepAliveAgent === undefined) {
      this.options.keepAliveAgent = httpsAgent;
    }

    // Use internal dnsCache by default (falls back to got's dnsCache)
    if (this.options.dnsCache === true || this.options.dnsCache === undefined) {
      this.options.dnsCache = true;
    }

    // Set gotInstance defaults, can also include other options
    this.gotInstance = got.extend({
      // Agent options
      agent: { https: this.options.keepAliveAgent || undefined },

      // DNS caching options
      dnsCache: this.options.dnsCache || undefined
    });
  }

  /** @private */
  resetAccessToken() {
    this.accessToken = undefined;
  }

  /** @private */
  async refreshAccessToken(): Promise<void> {
    // If refreshing access token is necessary
    if (!this.accessToken) {
      const accessTokenResult: IDoksApiResponse = await this.gotInstance({
        url: `${this.options.apiBaseUrl}/${this.options.apiVersion}/user/auth`,
        method: 'POST',
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
      responseType: 'json',
      throwHttpErrors: false,
      searchParams: params,
      method
    };

    // If body is defined
    if (json) {
      gotOptions.json = json;
    }

    const response: IDoksApiResponse = await this.gotInstance({ ...gotOptions, resolveBodyOnly: true });

    if (!response.status) {
      return this.httpErrorHandler(response);
    }

    return response.data;
  }

  /** @private */
  httpErrorHandler(response: IDoksApiResponse | any) {
    // Unhandled errors without Doks wrapper
    if (!response?.errors) {
      throw new Error(`Doks HTTP error (${response?.code}): ${response.message}`);
    }

    const errors = response.errors.map((e: any) => `${e.message} (CODE: ${e.code})`).join(', ');

    throw new Error(`Doks HTTP error (${response.code}): ${errors}`);
  }

  isValidBusinessId(businessId: string) {
    return validators.isValidBusinessId(businessId);
  }

  /**
   * TODO: Add documentation
   */
  async getCustomers(): Promise<IDoksCustomer[]> {
    return await this.request('GET', 'user/customers');
  }

  /**
   * TODO: Add documentation
   */
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

  /**
   * TODO: Add documentation
   */
  async getIdentificationsByCustomerId(customerId: string): Promise<IDoksIdentification[]> {
    return await this.request('GET', `user/customers/${customerId}/identifications`);
  }

  /**
   * TODO: Add documentation
   */
  async getRiskRatings(): Promise<IDoksRiskRating[]> {
    return await this.request('GET', 'user/riskratings');
  }

  /**
   * TODO: Add documentation
   */
  async getRiskAnswersByCustomerId(customerId: string): Promise<IDoksRiskAnswers[]> {
    return await this.request('GET', `user/customers/${customerId}/riskanswers`);
  }

  /**
   * TODO: Add documentation
   */
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

  /**
   * TODO: Add documentation
   */
  async getIdentificationByCustomerAndIdentificationId(customerId: string, identificationId: string): Promise<IDoksIdentification> {
    return await this.request('GET', `user/customers/${customerId}/identifications/${identificationId}`);
  }

  /**
   * TODO: Add documentation
   */
  async sendIdentificationByCustomerAndIdentificationId(customerId: string, identificationId: string): Promise<IDoksIdentification> {
    return await this.request('POST', `user/customers/${customerId}/identifications/${identificationId}/send`, {});
  }

  /**
   * TODO: Add documentation
   */
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

  /**
   * TODO: Add documentation
   */
  async sendInformationRequestByCustomerAndIdentificationId(
    customerId: string,
    identificationId: string
  ): Promise<IDoksInformationRequest> {
    return await this.request('POST', `user/customers/${customerId}/requests/${identificationId}/send`, {});
  }

  /**
   * TODO: Add documentation
   */
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

  /**
   * TODO: Add documentation
   */
  async getDocumentsByCustomerId(customerId: string): Promise<IDoksDocument[]> {
    return await this.request('GET', `user/customers/${customerId}/documents`);
  }

  /**
   * Gets Customer PDF summary
   * TODO: Add documentation
   */
  async getPdfByCustomerId(customerId: string, params?: Record<string, string | number | boolean | null | undefined>): Promise<Buffer> {
    // Fetch short lived access token for PDF fetching
    await this.refreshAccessToken();

    return await this.gotInstance({
      method: 'GET',
      url: this.constructUrl(`user/customers/${customerId}/pdf`),
      searchParams: { jwt: this.accessToken, ...params },
      resolveBodyOnly: true
    }).buffer();
  }

  /**
   * Gets information request PDF summary
   * TODO: Add documentation
   */
  async getPdfByCustomerIdAndInformationRequestId(
    customerId: string,
    informationRequestId: string,
    params?: Record<string, string | number | boolean | null | undefined>
  ): Promise<Buffer> {
    await this.refreshAccessToken();

    return await this.gotInstance({
      method: 'GET',
      url: this.constructUrl(`user/customers/${customerId}/requests/${informationRequestId}/pdf`),
      searchParams: { jwt: this.accessToken, ...params },
      resolveBodyOnly: true
    }).buffer();
  }

  /**
   * TODO: Add documentation
   */
  async getDocumentsByCustomerIdAndType(customerId: string, type: string): Promise<IDoksDocument[]> {
    const documents = await this.getDocumentsByCustomerId(customerId);
    const filtered = documents.filter((document) => document.type === type);

    return filtered;
  }

  /**
   * TODO: Add documentation
   */
  async getOwnersByCustomerId(customerId: string): Promise<IDoksOwner[]> {
    return await this.request('GET', `user/customers/${customerId}/owners`);
  }

  /**
   * TODO: Add documentation
   */
  async createOwnerByCustomerId(customerId: string, owner: Partial<IDoksOwner>) {
    return await this.request('POST', `user/customers/${customerId}/owners`, owner);
  }

  /**
   * TODO: Add documentation
   */
  async getActualBeneficiariesByCustomerId(customerId: string): Promise<IDoksActualBeneficiary[]> {
    return await this.request('GET', `user/customers/${customerId}/actualbeneficiaries`);
  }

  /**
   * TODO: Add documentation
   */
  async createActualBeneficiaryByCustomerId(customerId: string, actualBeneficiary: Partial<IDoksActualBeneficiary>) {
    return await this.request('POST', `user/customers/${customerId}/actualbeneficiaries`, actualBeneficiary);
  }

  /**
   * TODO: Add documentation
   */
  async getResponsiblePersonsByCustomerId(customerId: string): Promise<IDoksResponsiblePerson[]> {
    return await this.request('GET', `user/customers/${customerId}/responsiblepersons`);
  }

  /**
   * Create responsible person for customer
   * @param customerId Customer id in Doks
   * @param responsiblePerson Required fields: `name` and `source`
   */
  async createResponsiblePersonByCustomerId(customerId: string, responsiblePerson: Partial<IDoksResponsiblePerson>) {
    return await this.request('POST', `user/customers/${customerId}/responsiblepersons`, responsiblePerson);
  }

  /**
   * TODO: Add documentation
   */
  async getPepsByCustomerId(customerId: string): Promise<IDoksPep[]> {
    return await this.request('GET', `user/customers/${customerId}/peps`);
  }

  /**
   * TODO: Add documentation
   */
  async createPepByCustomerId(customerId: string, pep: Partial<IDoksPep>) {
    return await this.request('POST', `user/customers/${customerId}/peps`, pep);
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

  /**
   * @returns `document` if document found or `undefined` if document could not be found
   */
  async buyTradeRegisterByCustomerId(customerId: string): Promise<IDoksActualBeneficiaryDocumentWithMetadata | undefined> {
    try {
      const document = await this.request('POST', `user/customers/${customerId}/documents/buy/traderegister`, {});

      return document;
    } catch (e: any) {
      if (e.message?.includes('USER_CUSTOMERS_DOCUMENTS_FILE_NOT_FOUND')) {
        return undefined;
      } else {
        throw e;
      }
    }
  }

  /**
   * @returns `document` if document found or `undefined` if document could not be found
   */
  async buyResponsiblePersonsByCustomerId(customerId: string): Promise<IDoksActualBeneficiaryDocumentWithMetadata | undefined> {
    try {
      const document = await this.request('POST', `user/customers/${customerId}/documents/buy/responsiblepersons`, {});

      return document;
    } catch (e: any) {
      if (e.message?.includes('USER_CUSTOMERS_DOCUMENTS_FILE_NOT_FOUND')) {
        return undefined;
      } else {
        throw e;
      }
    }
  }
}
