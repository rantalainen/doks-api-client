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

type DoksCustomerType = 'business' | 'person';

export interface IDoksNewCustomer {
  businessid?: string;
  ssn?: string;

  name: string;
  country: string;
  type: DoksCustomerType;

  [propName: string]: any;
}

type RiskScoresLevel = 'NA' | 'LOW' | 'REGULAR' | 'HIGH';

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
  riskscores_level: RiskScoresLevel;
  /** UTC unix timestamp */
  riskscores_calculated_at: number;
  /** UTC unix timestamp */
  created_at: number;

  [propName: string]: any;
}

type IDoksLanguage = 'FI' | 'EN' | 'SE';

type IDoksEIdMethods = 'PASSPORTFILE' | 'NETSEIDENT_BANKID_FI' | 'NETSEIDENT_MOBIILIVARMENNE_FI' | 'NETSEIDENT_PASSPORTREADER';

export interface IDoksIdentification {
  id: string;
  organizations_id: string;
  customers_id: string;
  users_id: string;
  is_identified: boolean;
  is_accepted: boolean;
  email: string;
  name: string;
  /** Should we ask pep questions */
  ask_pep: boolean;
  /** Pass available identification methods in an array, acceptable values listed in IDoksEIdMethods */
  available_eidmethods?: IDoksEIdMethods[];
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
  prefill_owners: boolean;
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

export interface IDoksDocument {
  id: string;
  organizations_id: string;
  name: string;
  users_id: string;
  type: string;
  files_id: string;
  /** UTC unix timestamp */
  created_at: number;
  /** UTC unix timestamp */
  updated_at: number;
  /** UTC unix timestamp */
  expires_at: number;

  metadata?: any[];
}

export interface IDoksActualBeneficiaryDocumentWithMetadata extends IDoksDocument {
  metadata: IDoksActualBeneficiary[];
}

export interface IDoksOwner {
  id: string;
  name: string;
  is_beneficial: boolean;
  share: number;
  ssn: string;

  is_pep_family: boolean;
  is_pep_partner: boolean;
  is_pep_self: boolean;
  nationality: string;

  customers_id: string;
  owners_id: string;

  supress_alerts: boolean;

  /** UTC unix timestamp */
  created_at: number;
  /** UTC unix timestamp */
  updated_at: number;
}

export interface IDoksActualBeneficiary {
  dateOfBirth: string;
  domicile: string;
  firstname: string;
  homeCountry: string;
  nationality: string;
  otherBeneficialOwnership: boolean;
  ownershipExtent: number;
  role: string;
  socialSecurityNumber: string;
  status: string;
  statusEndDate: string;
  statusStartDate: string;
  surname: string;
  voteExtent: number;
}

export interface IDoksRiskAssesment {
  id: string;
  customers_id: string;
  organizations_id: string;
  users_id: string;
  description: string;
  name: string;
  riskratings_id: string;
  /** UTC unix timestamp */
  created_at: number;
  /** UTC unix timestamp */
  updated_at: number;
  /** UTC unix timestamp */
  expires_at: number;

  [propName: string]: any;
}

export interface IDoksRiskRating {
  id: string;
  organizations_id: string;
  description: string;
  name: string;
  number: number;

  [propName: string]: any;
}
