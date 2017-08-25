# Account Server API

### Index Table

##### [Mobile API](#mobile-api)
1. [/account/creates \(POST\)](#1-accountcreates-post)
2. [/account/device/updates \(POST\)](#2-accountdeviceupdate-post)
3. [/account/device/unbinds \(POST\)](#3-accountdeviceunbinds-post)
4. [/certificate/obtains \(POST\)](#4-certificateobtains-post)
5. [/certificate/refreshs \(POST\)](#5-certificaterefreshs-post)
6. [/fcmID \(GET\)](#6-fcmid-get)
7. [/fcmID \(PUT\)](#7-fcmid-put)
8. [/iotDeviceID \(GET\)](#8-iotdeviceid-get)
9. [/iotDeviceID \(POST\)](#9-iotdeviceid-post)
10. [ /iotDeviceID \(DELETE\)](#10-iotdeviceid-delete)
##### [Doorbell API](#doorbell-api)
1. [/certificate/obtains \(POST\)](#1-certificateobtains-post)
2. [certificate/refreshs \(PUT\)](#2-certificaterefreshs-put)
3. [/triggerSns \(GET\)](#3-triggersns-get)
##### [Error State Response Format](#error-state-response-format)
##### [AWS DynamoDB](#aws-dynamodb)


<a name="mobile-api"></a>
## Mobile API
<a name="1-accountcreates-post"></a>
### 1. /account/creates (POST)
- Description: <br/> 
	Provide a api for mobile to register to account server		
- URL:  <br/> 
	https:HostName:Port/device_api/v1/account/creates
- Method: 
	* POST
- Headers:  
    * Content-Type <br>
        application/x-www-form-urlencoded || application/json
	* Body
    
            {
                "FCM_ID" : %s,
                "UUID" : %s
            }


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
        - body
        
                {
                    "DEVICE_ID": %s
                }
    
    
    * Parameter description
    
    | Parameter |  Type  |                 Description                  |
    |-----------|--------|----------------------------------------------|
    | DEVICE_ID | String | Identification for management(mobile) device |

<a name="2-accountdeviceupdate-post"></a>
### 2. /account/device/updates (POST)
- Description: <br/> 
    Update device information      
- URL:  <br/> 
    https:HostName:Port/device_api/v1/account/device/updates
- Method: 
    * POST
- Headers:  
    * Content-Type <br>
        application/x-www-form-urlencoded || application/json
    * Body
    
            {
                "DEVICE_ID" : %s,
                "DEVICE_NAME" : %s
            }


- Parameter description    
  
    |  Parameter  |  Type  |                 Description                  |
    |-------------|--------|----------------------------------------------|
    | DEVICE_ID   | String | Identification for management(mobile) device |
    | DEVICE_NAME | String | Name of the device                           |

- Return
    * Headers
        - status : 204
        - content-type : application/json

<a name="3-accountdeviceunbinds-post"></a>
### 3. /account/device/unbinds (POST)
- Description: <br/> 
    Unbinding device from account
- URL: <br/> 
    https:HostName:Port/device_api/v1/certificate/unbinds
- Method: 
    * POST
- Headers:  
    * Content-Type <br>
        application/x-www-form-urlencoded || application/json
    * Authorization: Bearer {TOKEN}
    * Body
            
            {
                "DEVICE_ID" : %s
            }

- Return
    * Headers
        - status : 204
        - content-type : application/json
        
- Parameter description   
   
    |  Parameter  |  Type  |                   Description                   |
    |-------------|--------|-------------------------------------------------|
    | DEVICE_ID   | String | Identification for management(mobile) device    |

<a name="4-certificateobtains-post"></a>
### 4. /certificate/obtains (POST)
- Description: <br/> 
	Provide a API for mobile to get token to access account information.<br>
    There are two way to get token.<br>
    1. Bring in `UUID/DEVICE_ID`. Server only return Token information
    2. Bring in `UUID` only. Server will return addtion parameter `DEVICE_ID`

- URL: <br/> 
	https:HostName:Port/device_api/v1/certificate/obtains
- Method: 
    * POST
- Headers:
    * Content-Type: <br>
        application/x-www-form-urlencoded || application/json
    * Body<br>
        
            {
                "UUID" : %s
                "DEVICE_ID": %s
            }

- Parameter description   
   
    |  Parameter  |  Type  |                   Description                   |
    |-------------|--------|-------------------------------------------------|
    | FCM_ID      | String | A token get form firebase CDN (Aka register id) |
    | DEVICE_ID   | String | Identification for management(mobile) device    |

- Return
    * Headers
        - status : 200
        - content-type : application/json
        - body: <br>
           
                {
                    "Token" : %s,
                    "ExpiresIn" : %d
                    "TokenType":"Bearer",
                    "RefreshToken":%s
                }
           
    * Parameter description
    
    |  Parameter   |  Type  |             Description              |
    |--------------|--------|--------------------------------------|
    | Token        | String | Token for aeecss account information |
    | ExpiresIn    | Number | Define token expires time            |
    | TokenType    | String | Authorization type of Token          |
    | RefreshToken | String | To refresh a new token               |



<a name="5-certificaterefreshs-post"></a>
### 5. /certificate/refreshs (POST)
- Description: <br/> 
    To refresh the certificate
- URL: <br/> 
    https:HostName:Port/device_api/v1/certificate/refreshs
- Method: 
    * POST
- Headers:  
    * Content-Type <br>
        application/x-www-form-urlencoded || application/json
    * Authorization: Bearer {TOKEN}

- Return
    * Headers
        - status : 200
        - content-type : application/json
        - body:
       
                {
                    "Token" : %s,
                    "ExpiresIn" : %d
                    "TokenType":"Bearer",
                    "RefreshToken":%s
                }
       
    * Parameter description
    
    |  Parameter   |  Type  |             Description              |
    |--------------|--------|--------------------------------------|
    | Token        | String | Token for aeecss account information |
    | ExpiresIn    | Number | Define token expires time            |
    | TokenType    | String | Authorization type of Token          |
    | RefreshToken | String | To refresh a new token               |

<a name="6-fcmid-get"></a>
### 6. /fcmID (GET)
- Description: <br/> 
    To get the FCM ID
- URL: <br/> 
    https:HostName:Port/device_api/v1/fcmID/{DEVICE_ID}
- Method: 
    * GET
- Headers:  
    * Content-Type<br>
        application/x-www-form-urlencoded || application/json
    * Authorization: Bearer {TOKEN}
    
- Parameter description

    | Parameter |  Type  |                 Description                  |
    |-----------|--------|----------------------------------------------|
    | DEVICE_ID | String | Identification for management(mobile) device |

- Return
    * Headers
        - status : 200
        - content-type : application/json
        - body:
        
                {
                    "FcmID" : %s
                }
        
    * Parameter description
    
    | Parameter | Type   | Description                                     |
    | --------  | :---:  | ----------:                                     |
    | FCM_ID    | String | A token get form firebase CDN (Aka register id) |

<a name="7-fcmid-put"></a>
### 7. /fcmID (PUT)
- Description: <br/> 
    Update the fcm ID
- URL: <br/> 
    https:HostName:Port/device_api/v1/fcmID
- Method: 
    * PUT
- Headers:  
    * Content-Type<br>
        application/x-www-form-urlencoded || application/json
    * Authorization: Bearer {TOKEN}
    * Body:
        
            {
                "FCM_ID" : %s
            }
        
- Parameter description

    | Parameter |  Type  |                   Description                   |
    |-----------|--------|-------------------------------------------------|
    | DEVICE_ID | String | Identification for management(mobile) device    |
    | FCM_ID    | String | A token get form firebase CDN (Aka register id) |

- Return
    * Headers
        - status : 204
        - content-type : application/json

<a name="8-iotdeviceid-get"></a>
### 8. /iotDeviceID (GET)
- Description: <br/> 
    Get All Doorbell device under uuid account
- URL: <br/> 
    https:HostName:Port/device_api/v1/iotDeviceID/{UUID}
- Method: 
    * GET
- Headers:  
    * Content-Type<br>
        application/x-www-form-urlencoded || application/json
    * Authorization: Bearer {TOKEN}
- Return
    * Headers
        - status : 200
        - content-type : application/json
        - body:
        
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
        
    * Parameter description 
    
    | Parameter        | Type   | Description                                   |
    | --------         | :---:  | ----------:                                   |
    | UUID             | String | One of the receiver(mobile) identification.   |
    | TotalDeviceCount | Number | Total device of IoT Device                    |
    | IotDeviceID      | String | To identify the doorbell device               |
    | IotDeviceType    | Number | To identify IoT device type.<br> 0 : doorbell |
            

<a name="9-iotdeviceid-post"></a>
### 9. /iotDeviceID (POST)
- Description: <br/> 
    Add Doorbell device under the uuid account
- URL: <br/> 
    https:HostName:Port/device_api/v1/iotDeviceID/{UUID}
- Method: 
    * POST
- Headers:  
    * Content-Type<br>
        application/x-www-form-urlencoded || application/json
    * Authorization: Bearer {TOKEN}
    * Body:
        
            {
                "IOT_DEVICE_ID" : %s,
                "IOT_DEVICE_TYPE" : %d
            }
        
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

<a name="10-iotdeviceid-delete"></a>
### 10. /iotDeviceID (DELETE)
- Description: <br/> 
    Delete Doorbell device under the uuid account
- URL: <br/> 
    https:HostName:Port/device_api/v1/iotDeviceID/{UUID}
- Method: 
    * DELETE
- Headers:  
    * Content-Type<br>
        application/x-www-form-urlencoded || application/json
    * Authorization: Bearer {TOKEN}
    * Body:
        
            {
                "IOT_DEVICE_ID" : %s
            }
        
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
<a name="1-certificateobtains-post"></a>
### 1. /certificate/obtains (POST)
- Description: <br/> 
    Provide a token for doorbell device to get permission to access account information
- URL:  <br/> 
    https:HostName:Port/iot_device_api/v1/certificate/obtains

- Method: 
    * POST
- Headers:
    * Content-Type<br>
        application/x-www-form-urlencoded || application/json
    * Body:
        
            {
                "IOT_DEVICE_ID" : %s
            }
        
- Parameter description

    |   Parameter   |  Type  |           Description           |
    |---------------|--------|---------------------------------|
    | IOT_DEVICE_ID | String | To identify the doorbell device |

- Return
    * Headers
        - status : 204
        - content-type : application/json
        - body:
            
                {
                    "Token" : %s,
                    "ExpiresIn" : %d
                    "TokenType":"Bearer",
                    "RefreshToken":%s
                }
            
    * Parameter description
    
    |  Parameter   |  Type  |             Description              |
    |--------------|--------|--------------------------------------|
    | Token        | String | Token for aeecss account information |
    | ExpiresIn    | Number | Define token expires time            |
    | TokenType    | String | Authorization type of Token          |
    | RefreshToken | String | To refresh a new token               |

<a name="2-certificaterefreshs-put"></a>
### 2. certificate/refreshs (PUT)
- Description: <br/> 
    To refresh the certificate
- URL:  <br/> 
   https:HostName:Port/iot_device_api/v1/certificate/refreshs

- Method: 
    * PUT
- Headers:
    * Content-Type: <br>
        application/x-www-form-urlencoded || application/json
    * Authorization: Bearer {TOKEN}
    * Body <br>
        
            {
                "REFRESH_TOKEN" : %s
            }
        
- Parameter description      

    |  Parameter   |  Type  |      Description       |
    |--------------|--------|------------------------|
    | RefreshToken | String | To refresh a new token |

- Return
    * Headers
        - status : 200
        - content-type : application/json
        - body: <br>
            
                {
                    "Token" : %s,
                    "ExpiresIn" : %d
                    "TokenType":"Bearer",
                    "RefreshToken":%s
                }
            

    * Parameter description
    
    |  Parameter   |  Type  |             Description              |
    |--------------|--------|--------------------------------------|
    | Token        | String | Token for aeecss account information |
    | ExpiresIn    | Number | Define token expires time            |
    | TokenType    | String | Authorization type of Token          |
    | RefreshToken | String | To refresh a new token               |


<a name="3-triggersns-get"></a>
### 3. /triggerSns (GET)
- Description: <br/> 
    Send message to endpoint device
- URL:  <br/> 
    https:HostName:Port/iot_device_api/v1/triggerSns

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
    * body: 
    
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
    
    * Response reference: [https://github.com/adnan-kamili/rest-api-response-format](https://github.com/adnan-kamili/rest-api-response-format)

<a name="aws-dynamodb"></a>
## AWS DynamoDB

Primary Key: ** <br>
Sort Key: *

| DeviceInfo      |               |         |        |         |               |                |
| --------------- | ------------- | ------- | ------ | ------- |               | -------------- |
| **DEVICE_ID**   | DEVICE_NAME   | FCMID   | UUID   | TOKEN   | REFRESH_TOKEN | EXPIRES_TIME   |
| **              |               |         |        |         |               |                |

| DeviceAccountInfo |               |        |
|-------------------|---------------|--------|
| **UUID**          | **DEVICE_ID** | ACTIVE |
| **                | *             |        |

| IotAccountInfo |                   |
|----------------|-------------------|
| **UUID**       | **IOT_DEVICE_ID** |
| **             | *                 |

|   IotDeviceInfo   |       |               |              |
|-------------------|-------|---------------|--------------|
| **IOT_DEVICE_ID** | TOKEN | REFRESH_TOKEN | EXPIRES_TIME |
| **                |       |               |              |


