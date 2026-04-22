API README

RCC SECURITY

Endpoint : POST /api/sdk
Description : validates against tblUser and resolve SQL connection with using labels

Request (JSON):
{
  "UserLogin": "admin",
  "Password": "yourpassword",
  "ConnectionLabel": "waffle_local_dev"
}

Response (200 is ok):

{
  "token": "string",
  "DisplayName": "string",
  "Role": "string",
  "Portal": "string",
  "IsActive": true
}

TOOL DISCOVERY

end point: GET /api/sdk/tools
description: get list of all internal tools registered

Response (200 is ok):
[
  {
    "id": 1,
    "name": "Tool Name",
    "status": "active",
    "last_updated": "ISO-TIMESTAMP",
    "metadata": { "version": "1.0", "custom_key": "val" }
  }
]

Providers.py

Contains logic for queries and real requests once that is happening

Serializers.py

defines the data and its form, matches the SQL schema. If schema changes, change this file

ERRORS 

500: NameError or ImportError
401: Invalid UserLogin or Password
400: missing json fields or invalid ConnectionLabel in login logic