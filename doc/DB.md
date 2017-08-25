## AWS DynamoDB

Primary Key: ** <br>
Sort Key: *

| DeviceInfo      |               |         |        |         |               |                |
| --------------- | ------------- | ------- | ------ | ------- |               | -------------- |
| **DEVICE_ID**   | DEVICE_NAME   | FCMID   | UUID   | TOKEN   | REFRESH_TOKEN | EXPIRES_TIME   |
| **              |               |         |        |         |               |                |

| DeviceAccountInfo |               |
|-------------------|---------------|
| **UUID**          | **DEVICE_ID** |
| **                | *             |

| IotAccountInfo |                   |
|----------------|-------------------|
| **UUID**       | **IOT_DEVICE_ID** |
| **             | *                 |

|   IotDeviceInfo   |       |               |              |
|-------------------|-------|---------------|--------------|
| **IOT_DEVICE_ID** | TOKEN | REFRESH_TOKEN | EXPIRES_TIME |
| **                |       |               |              |