import CacheableLookup from 'cacheable-lookup';

export interface IDoksApiClientOptions {
  /** API version that should be used, `v1.85` for example. Uses latest API version, `current`, by default */
  apiVersion?: string;

  /** API base url, `https://data.doks.fi/api` by default */
  apiBaseUrl?: string;

  /** API key handed by Doks */
  apikey: string;

  /** API user email */
  email: string;

  /** Instance of cacheable-lookup@5 or `true` when using internal cache, defaults to `false`  */
  dnsCache?: CacheableLookup | boolean;
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

type IDoksEIdMethods =
  | 'NETSEIDENT_BANKID_FI'
  | 'NETSEIDENT_MOBIILIVARMENNE_FI'
  | 'NETSEIDENT_PASSPORTREADER'
  | 'PASSPORTFILE'
  | 'NETSEIDENT_BANKID_SE'
  | 'NETSEIDENT_BANKID_NO'
  | 'NETSEIDENT_BANKID_MOBILE_NO'
  | 'NETSEIDENT_MITID_DK'
  | 'NETSEIDENT_SMARTID'
  | 'NETSEIDENT_MOBILEID';

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

  ask_basic: boolean;

  /** Ask for free text */
  ask_freetext: boolean;

  /** Free-form description text for free text */
  ask_freetext_description: boolean;

  /** Ask for source of fund */
  ask_sof: boolean;

  /** Free-form description text for source of fund */
  ask_sof_description: boolean;

  /** Ask for riskquestions */
  ask_riskquestions: boolean;

  /** Set risk questions type (defined in Doks GUI) */
  riskquestions_type?: string;

  /** Ask for owners */
  ask_owners: boolean;

  /** Pre-fill owners from latest available data */
  prefill_owners: boolean;

  /** Auto-add answered owners to Customer card */
  autofill_owners: boolean;

  /** Allow add file for owners */
  ask_owners_allowfile: boolean;

  /** Free-form description text for owners */
  ask_owners_description: string;

  /** Ask for actual beneficiaries */
  ask_actualbeneficiaries: boolean;

  /** Pre-fill actual beneficiaries from latest available data */
  prefill_actualbeneficiaries: boolean;

  /** Auto-add answered actual beneficiaries to Customer card */
  autofill_actualbeneficiaries: boolean;

  /** Free-form description text for actual beneficiaries */
  ask_actualbeneficiaries_description: string;

  /** Ask for responsible persons */
  ask_responsiblepersons: boolean;

  /** Ask responsible persons only, if there is no actual beneficiaries (and `ask_responsiblepersons` is true) */
  ask_responsiblepersons_ifnecessary: boolean;

  /** Ask for responsible persons ssn (if `ask_responsiblepersons` is also true) */
  ask_responsiblepersons_ssn: boolean;

  /** Pre-fill responsible persons from latest available data */
  prefill_responsiblepersons: boolean;

  /** Auto-add answered responsible persons to Customer card */
  autofill_responsiblepersons: boolean;

  /** Free-form description text for responsible persons */
  ask_responsiblepersons_description: string;

  /** Ask for PEP-persons */
  ask_peps: boolean;

  /** Pre-fill PEP-persons from latest available data */
  prefill_peps: boolean;

  /** Auto-add answered pep-persons to Customer card */
  autofill_peps: boolean;

  /** Free-form description text for PEP-persons */
  ask_peps_description: string;

  /** Allow attachments */
  ask_files: boolean;

  /** Select if attachments are mandatory */
  ask_files_mandatory: boolean;

  /** Free-form description text for ask_files */
  ask_files_description: string;

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

export interface IDoksOwner {
  businessid: string;
  description: string;
  id: string;
  name: string;
  owners_id: string;
  share: number;
  ssn: string;

  customers_id: string;

  /** UTC unix timestamp */
  created_at: number;
  /** UTC unix timestamp */
  updated_at: number;
}

export interface IDoksOwner {
  businessid: string;
  description: string;
  id: string;
  name: string;
  owners_id: string;
  share: number;
  ssn: string;

  customers_id: string;

  /** UTC unix timestamp */
  created_at: number;
  /** UTC unix timestamp */
  updated_at: number;
}

export interface IDoksActualBeneficiary {
  description: string;
  id: string;
  name: string;

  /** Two-letter nationality code, FI for example */
  nationality: string;

  share: number;
  source: 'DATABASE' | 'MANUAL' | 'REQUEST' | 'UNKNOWN';

  customers_id: string;

  /** UTC unix timestamp */
  created_at: number;
  /** UTC unix timestamp */
  updated_at: number;
}

export interface IDoksPep {
  description: string;
  id: string;
  is_pep_family: boolean;
  is_pep_partner: boolean;
  is_pep_self: boolean;
  name: string;
  source: 'MANUAL' | 'REQUEST' | 'IDENTIFICATION' | 'UNKNOWN';
}

export interface IDoksResponsiblePerson {
  description: string;

  /** Date of birth, manually filled in string format */
  dob: string;

  id: string;
  name: string;

  /** Two-letter nationality code, FI for example */
  nationality: string;

  organizations_id: string;
  role: string;
  source: 'DATABASE' | 'MANUAL' | 'REQUEST';
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
  metadata: IDoksActualBeneficiaryDocumentMetadata[];
}

export interface IDoksActualBeneficiaryDocumentMetadata {
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

export interface IDoksRiskAnswers {
  id: string;
  organizations_id: string;
  description: string;
  points: number;
  questions: IDoksRiskAnswerQuestionAnswer[];
  [propName: string]: any;
}

export interface IDoksRiskAnswerQuestionAnswer {
  id: string;
  question: string;
  answer: any;
  description: string;
  points: number;

  [propName: string]: any;
}
