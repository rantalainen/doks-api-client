# Doks API Client

Doks third party API client. Doks website: https://doks.fi

:warning: This tool is in early stages and is subject to change.

## Installation

Install from npm (not available yet):

```
npm install doks-api-client
```

## Setup

### Import to NodeJS project

```javascript
const DoksApiClient = require('doks-api-client').DoksApiClient;
```

### Import to TypeScript project

```javascript
import { DoksApiClient } from 'doks-api-client';
```

### Setup client with options

Please consult Doks to get your `email` and `apikey` for API usage.

```javascript
const doks = new DoksApiClient({
  apikey: 'doks-api-key-here',
  email: 'api-user-email-here',

  // optional
  apiVersion: 'v1.89', // lock api version
  apiBaseUrl: 'https://url' // change base url, defaults to https://data.doks.fi/api
});
```

## Methods (examples)

```javascript
const exampleCustomerId = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx';
const exampleIdentificationId = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx';
const exampleRequestId = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx';

// Get all customers
const customers = await doks.getCustomers();

// Get single customer
const customer = await doks.getCustomerById(exampleCustomerId);

// Create customer (see src/interfaces.ts for available properties)
const newCustomer = await doks.createCustomer({
  businessid: '1234567-8',
  name: 'Example Oy',
  country: 'fi',
  type: 'business'
});

// Filter customers and return only needed fields
const customers = await doks.getCustomersByFilters(
  // Filtered fields
  { businessid: '1234567-8' },

  // Returned fields
  ['name', 'businessid']
);

// Get customer identifications
const identifications = await doks.getIdentificationsByCustomerId(exampleCustomerId);

// Create identification
const newIdentification = await doks.createIdentificationByCustomerId(exampleCustomerId, {
  name: 'Person Name',
  email: 'person.name@email.ltd'

  // other specs
});

// Send identification
const sentIdentification = await doks.sendIdentificationByCustomerAndIdentificationId(exampleCustomerId, newIdentification.id);

// Get single identification
const identification = await doks.getIdentificationByCustomerAndIdentificationId(exampleCustomerId, newIdentification.id);

// Get customer information requests
const informationRequests = await doks.getInformationRequestsByCustomerId(exampleCustomerId);

// Create information request
const newInformationRequest = await doks.createInformationRequestByCustomerId(exampleCustomerId, {
  email: 'person.name@email.ltd',
  ask_riskquestions: true

  // other specs
});

// Send information request
const sentInformationRequest = await doks.sendInformationRequestByCustomerAndIdentificationId(exampleCustomerId, newInformationRequest.id);

// Get single information request
const informationRequest = await doks.getInformationRequestByCustomerAndIdentificationId(exampleCustomerId, newInformationRequest.id);
```

## Helpers

Contains some helpers for handling customers details.

```javascript
// Validate business id
const validBusinessId = doks.isValidBusinessId('1234567-8'); // true or false
```

## Changelog

0.0.1 Under development
0.0.4 Add actual beneficiaries document purchase option
0.0.8 Fixed jwt token fetch in get pdf summary
0.0.10 Update customer with patchCustomerById, added property available_eidmethods to IDoksIdentification
0.0.11 Added risk assesments and scores
