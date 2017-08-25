# Account Server API

## Index Table

#### [Mobile API](#mobile-api)
1. [registration](#1-registration)
2. [token \(POST\)](#2-token-post)
3. [token \(PUT\)](#3-token-put)
4. [fcmID \(GET\)](#4-fcmid-get)
4. [fcmID \(PUT\)](#4-fcmid-put)
5. [iotDeviceID \(GET\)](#5-iotdeviceid-get)
6. [iotDeviceID \(POST\)](#6-iotdeviceid-post)
7. [iotDeviceID \(DELETE\)](#7-iotdeviceid-delete)

#### [Doorbell API](#doorbell-api)
1. [token \(POST\)](#1-token-post)
2. [token \(PUT\)](#2-token-put)
3. [emitSns \(GET\)](#3-emitsns-get)

#### [Error State Response Format](#error-state-response-format)
#### [AWS DynamoDB](#aws-dynamodb)



<a name="mobile-api"></a>
## Mobile API
<a name="1-registration"></a>
### 1. registration
- Description: <br/> 
	Provide a api for mobile to register to account server		
- URL:  <br/> 
	https:HostName:Port/device_api/v1/registeration
- Method: 
	* POST
- Headers:  
    * Content-Type
        application/x-www-form-urlencoded, application/json
	* Body<br>
        ```
        {
            "FCM_ID" : %s,
            "UUID" : %s
            "DEVICE_ID": %s
        }
        ```

- Parameter description    
  
    | Parameter |  Type  |                   Description                   |
    |-----------|--------|-------------------------------------------------|
    | FCM_ID    | String | A token get form firebase CDN (Aka register id) |
    | UUID      | String | One of the Account identification.              |
    | DEVICE_ID | String | Identification for management(mobile) device    |

- Return
    * Headers
        - status : 201
        - content-type : application/json
        - body <br>
        ```
        {
            "Message": "The account was registered successfully"
        }
        ```
    * Parameter description
    
    | Parameter |  Type  |            Description            |
    |-----------|--------|-----------------------------------|
    | Message   | String | Addition Explanation of API state |

<a name="2-token-post"></a>
### 2. token (POST)
- Description: <br/> 
	Provide a API for mobile to get token to access account information
- URL: <br/> 
	https:HostName:Port/device_api/v1/token
- Method: 
    * PUT
- Headers:
    * Content-Type: <br>
        application/x-www-form-urlencoded || application/json
    * Authorization: Bearer {TOKEN}
    * Body <br>
        ```
        {
            "REFRESH_TOKEN" : %s
        }
        ```

- Parameter description   
   
    | Parameter |  Type  | Description |
    |-----------|--------|-------------|
    | TokenType | String |             |

- Return
    * Headers
        - status : 200
        - content-type : application/json
        - body: <br>
            ```
            {
                "Token" : %s,
                "ExpiresIn" : %d
                "TokenType":"Bearer",
                "RefreshToken":%s
            }
            ```

    * Parameter description
    
    |  Parameter   |  Type  |             Description              |
    |--------------|--------|--------------------------------------|
    | Token        | String | Token for aeecss account information |
    | ExpiresIn    | Number | Define token expires time            |
    | TokenType    | String | Authorization type of Token          |
    | RefreshToken | String | To refresh a new token               |

- Return
    * Headers
        - status : 200
        - content-type : application/json
        - body: <br>
        ```
        {
            "Token" : %s,
            "ExpiresIn" : %d
            "TokenType":"Bearer",
            "RefreshToken":%s
        }
        ```

    * Parameter description
    
    |  Parameter   |  Type  |             Description              |
    |--------------|--------|--------------------------------------|
    | Token        | String | Token for aeecss account information |
    | ExpiresIn    | Number | Define token expires time            |
    | TokenType    | String | Authorization type of Token          |
    | RefreshToken | String | To refresh a new token               |

<a name="3-token-put"></a>
### 3. token (PUT)
- Description: <br/> 
    To refresh the token
- URL: <br/> 
    https:HostName:Port/device_api/v1/token
- Method: 
    * PUT
- Headers:  
    * Content-Type
        application/x-www-form-urlencoded, application/json
    * Authorization: Bearer {TOKEN}

- Return
    * Headers
        - status : 204
        - content-type : application/json

<a name="4-fcmid-get"></a>
### 4. fcmID (GET)
- Description: <br/> 
    To get the FCM ID
- URL: <br/> 
    https:HostName:Port/device_api/v1/fcmID/{DEVICE_ID}
- Method: 
    * GET
- Headers:  
    * Content-Type
        application/x-www-form-urlencoded, application/json
    * Authorization: Bearer {TOKEN}
    
- Parameter description

    | Parameter |  Type  |                 Description                  |
    |-----------|--------|----------------------------------------------|
    | DEVICE_ID | String | Identification for management(mobile) device |

- Return
     * Headers
        - status : 200
        - content-type : application/json
        - body: <br>
        ```
        {
            "FcmID" : %s
        }
        ```

    * Parameter description
    
    | Parameter | Type   | Description                                     |
    | --------  | :---:  | ----------:                                     |
    | FCM_ID    | String | A token get form firebase CDN (Aka register id) |

<a name="4-fcmid-put"></a>
### 4. fcmID (PUT)
- Description: <br/> 
    Update the fcm ID
- URL: <br/> 
    https:HostName:Port/device_api/v1/fcmID
- Method: 
    * PUT
- Headers:  
    * Content-Type
        application/x-www-form-urlencoded, application/json
    * Authorization: Bearer {TOKEN}
    * Body <br>
        ```
            {
                "FCM_ID" : %s
            }
        ```


- Parameter description

    | Parameter |  Type  |                   Description                   |
    |-----------|--------|-------------------------------------------------|
    | DEVICE_ID | String | Identification for management(mobile) device    |
    | FCM_ID    | String | A token get form firebase CDN (Aka register id) |

- Return
    * Headers
        - status : 204
        - content-type : application/json

<a name="5-iotdeviceid-get"></a>
### 5. iotDeviceID (GET)
- Description: <br/> 
    Get All Doorbell device under uuid account
- URL: <br/> 
    https:HostName:Port/device_api/v1/iotDeviceID/{UUID}
- Method: 
    * GET
- Headers:  
    * Content-Type
        application/x-www-form-urlencoded, application/json
    * Authorization: Bearer {TOKEN}
- Return
    * Headers
        - status : 200
        - content-type : application/json
        - body <br>
        ```
        {
            "TotalDeviceCount" : %d,
            "DeviceList" : 
                [
                    {
                        "IotDeviceID" : %s,
                        "IotDeviceType" : %s
                    }...
                ]
        }
        ```
    * Parameter description 
    
    | Parameter        | Type   | Description                                   |
    | --------         | :---:  | ----------:                                   |
    | UUID             | String | One of the receiver(mobile) identification.   |
    | TotalDeviceCount | Number | Total device of IoT Device                    |
    | IotDeviceID      | String | To identify the doorbell device               |
    | IotDeviceType    | Number | To identify IoT device type.<br> 0 : doorbell |
            

<a name="6-iotdeviceid-post"></a>
### 6. iotDeviceID (POST)
- Description: <br/> 
    Add Doorbell device under the uuid account
- URL: <br/> 
    https:HostName:Port/device_api/v1/iotDeviceID/{UUID}
- Method: 
    * POST
- Headers:  
    * Content-Type
        application/x-www-form-urlencoded, application/json
    * Authorization: Bearer {TOKEN}
    * Body <br>
        ```
        {
            "IOT_DEVICE_ID" : %s,
            "IOT_DEVICE_TYPE" : %d
        }
        ```
- Parameter description  
  
    |    Parameter    |  Type  |                  Description                  |
    |-----------------|--------|-----------------------------------------------|
    | UUID            | String | One of the receiver(mobile) identification.   |
    | IotDeviceID     | String | To identify the doorbell device               |
    | IOT_DEVICE_TYPE | Number | To identify IoT device type.<br> 0 : doorbell |

- Return
    * Headers
        - status : 204
        - content-type : application/json

<a name="7-iotdeviceid-delete"></a>
### 7. iotDeviceID (DELETE)
- Description: <br/> 
    Delete Doorbell device under the uuid account
- URL: <br/> 
    https:HostName:Port/device_api/v1/iotDeviceID/{UUID}
- Method: 
    * DELETE
- Headers:  
    * Content-Type
        application/x-www-form-urlencoded, application/json
    * Authorization: Bearer {TOKEN}
    * Body <br>
        ```
        {
            "IOT_DEVICE_ID" : %s
        }
        ```

- Parameter description      

    |   Parameter   |  Type  |                 Description                 |
    |---------------|--------|---------------------------------------------|
    | IOT_DEVICE_ID | String | To identify the doorbell device             |

- Return
    * Headers
        - status : 204
        - content-type : application/json

<a name="doorbell-api"></a>
## Doorbell API
<a name="1-token-post"></a>
### 1. token (POST)
- Description: <br/> 
    Provide a token for doorbell device to get permission to access account information
- URL:  <br/> 
    https:HostName:Port/iot_device_api/v1/token

- Method: 
    * POST
- Headers:
    * Content-Type
        application/x-www-form-urlencoded, application/json
    * Body <br>
        ```
        {
            "IOT_DEVICE_ID" : %s
        }
        ```

- Parameter description

    |   Parameter   |  Type  |           Description           |
    |---------------|--------|---------------------------------|
    | IOT_DEVICE_ID | String | To identify the doorbell device |

- Return
    * Headers
        - status : 204
        - content-type : application/json
        - body: <br>
            ```
            {
                "Token" : %s,
                "ExpiresIn" : %d
                "TokenType":"Bearer",
                "RefreshToken":%s
            }
            ```

    * Parameter description
    
    |  Parameter   |  Type  |             Description              |
    |--------------|--------|--------------------------------------|
    | Token        | String | Token for aeecss account information |
    | ExpiresIn    | Number | Define token expires time            |
    | TokenType    | String | Authorization type of Token          |
    | RefreshToken | String | To refresh a new token               |

<a name="2-token-put"></a>
### 2. token (PUT)
- Description: <br/> 
    To refresh the token
- URL:  <br/> 
   https:HostName:Port/iot_device_api/v1/token

- Method: 
    * PUT
- Headers:
    * Content-Type: <br>
        application/x-www-form-urlencoded || application/json
    * Authorization: Bearer {TOKEN}
    * Body <br>
        ```
        {
            "REFRESH_TOKEN" : %s
        }
        ```

- Parameter description      

    |  Parameter   |  Type  |      Description       |
    |--------------|--------|------------------------|
    | RefreshToken | String | To refresh a new token |

- Return
    * Headers
        - status : 200
        - content-type : application/json
        - body: <br>
            ```
            {
                "Token" : %s,
                "ExpiresIn" : %d
                "TokenType":"Bearer",
                "RefreshToken":%s
            }
            ```

    * Parameter description
    
    |  Parameter   |  Type  |             Description              |
    |--------------|--------|--------------------------------------|
    | Token        | String | Token for aeecss account information |
    | ExpiresIn    | Number | Define token expires time            |
    | TokenType    | String | Authorization type of Token          |
    | RefreshToken | String | To refresh a new token               |


<a name="3-emitsns-get"></a>
### 3. emitSns (GET)
- Description: <br/> 
    Send message to endpoint device
- URL:  <br/> 
    https:HostName:Port/iot_device_api/v1/emitSns

- Method: 
    * GET
- Headers:
    * Content-Type: <br>
        application/x-www-form-urlencoded || application/json
    * Authorization: Bearer {TOKEN}

- Return
    * Headers
        - status : 204
        - content-type : application/json
        
<a name="error-state-response-format"></a>
## Error State Response Format

- Headers
    * status : %d
    * content-type : application/json
    * body <br>
    ```
    {
        "Message": %s,
        "Errors": [
            {
                "Message": %s,
                "Code": %s,
                "Field": %s
            }
        ]
    }
    ```
    * Response reference: [https://github.com/adnan-kamili/rest-api-response-format](https://github.com/adnan-kamili/rest-api-response-format)

<a name="aws-dynamodb"></a>
## AWS DynamoDB

Primary Key: ** <br>
Sort Key: *

| DeviceInfo        |         |        |         |                |
| :---------------: | ------- | ------ | ------- | -------------- |
| **DEVICE_ID**     | FCMID   | UUID   | TOKEN   | EXPIRES_TIME   |
| **                |         |        |         |                |

| DeviceAccountInfo |          |
|-------------------|----------|
| **DEVICE_ID**     | **UUID** |
| **                | *        |

| IotAccountInfo |                   |
|----------------|-------------------|
| **UUID**       | **IOT_DEVICE_ID** |
| **             | *                 |

|   IotDeviceInfo   |                  |              |
|-------------------|------------------|--------------|
| **IOT_DEVICE_ID** | IOT_DEVICE_TOKEN | EXPIRES_TIME |
| **                |                  |              |


