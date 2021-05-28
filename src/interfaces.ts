export interface IDoksApiClientOptions {
  /** API version that should be used, `v1.85` for example. Uses latest API version, `current`, by default */
  apiVersion?: string;

  /** API base url, `https://data.doks.fi/api` by default */
  apiBaseUrl?: string;

  /** API key handed by Doks */
  apikey: string;

  /** API user email */
  email: string;
}

type IDoksStatusTypes = 0 | 1;

export interface IDoksApiResponseError {
  code: string;
  message: string;
} 

export interface IDoksApiResponse {
  /** false if errors */
  status: boolean;

  /** 200 for successfull calls, 4xx for failed */
  code: number;

  /** Payload */
  data: any;

  /** Error messages and codes as array if call has errors, Empty array if no errors */
  errors: IDoksApiResponseError[];
}

export interface IDoksNewCustomer {
  businessid: string;
  name: string;
  country: string;
  type: string;

  [propName: string]: any;
}

export interface IDoksCustomer {
  id: string;
  organizations_id: string;
  users_id: string;
  type: string;
  is_removed: boolean;
  is_kycclock: boolean;
  /** UTC unix timestamp */
  kycclock_alarm_at: number;
  name: string;
  businessid: string;
  ssn: string;
  department: string;
  country: string;
  riskratings_id: string;
  /** UTC unix timestamp */
  created_at: number;
}

type IDoksLanguage = 'FI' | 'EN' | 'SE';

export interface IDoksIdentification {
  id: string;
  organizations_id: string;
  customers_id: string;
  users_id: string;
  is_identified: boolean;
  is_accepted: boolean;
  email: string;
  name: string;
  /** Description is visible in identification form */
  description: string;
  /** Note is visible in invitation email */
  note: string;
  language: IDoksLanguage;
  /** UTC unix timestamp */
  created_at: number;
  /** UTC unix timestamp */
  sent_at: number;
  /** UTC unix timestamp */
  resent_at: number;
  /** UTC unix timestamp */
  identified_at: number;
  /** UTC unix timestamp */
  accepted_at: number;
}

export interface IDoksInformationRequest {
  id: string;
  organizations_id: string;
  customers_id: string;
  users_id: string;
  is_answered: boolean;
  ask_freetext: boolean;
  ask_owners: boolean;
  ask_sof: boolean;
  ask_riskquestions: boolean;
  riskquestions_type?: string;
  email: string;
  /** Description is visible in identification form */
  description: string;
  /** Note is visible in invitation email */
  note: string;
  language: IDoksLanguage;
  /** UTC unix timestamp */
  created_at: number;
  /** UTC unix timestamp */
  sent_at: number;
  /** UTC unix timestamp */
  resent_at: number;
  /** UTC unix timestamp */
  answered_at: number;
}