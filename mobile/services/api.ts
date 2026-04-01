// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const BASE_URL = 'https://ccs-mobile.onrender.com/api';

// interface ApiResponse {
//   data: any | null;
//   error: any | null;
// }

// export const apiRequest = async (
//   endpoint: string,
//   method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
//   body?: any,
//   retries = 2
// ): Promise<ApiResponse> => {
//   const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
//   const fullUrl = `${BASE_URL}${cleanEndpoint}`;

//   try {
//     const token = await AsyncStorage.getItem('token');

//     console.log(`--- API CALL: ${method} ${fullUrl} ---`);

//     const response = await axios({
//       method,
//       url: fullUrl,
//       data: body,
//       timeout: 90000,
//       headers: {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json',
//         ...(token ? { Authorization: `Bearer ${token}` } : {}),
//       },
//     });

//     console.log(`--- API SUCCESS: ${fullUrl} ---`);
//     return { data: response.data, error: null };

//   } catch (err: any) {
//     console.log(`--- API ERROR: ${err?.message} | CODE: ${err?.code} ---`);

//     // If network error and retries left, wait 3s and retry
//     if (err?.code === 'ERR_NETWORK' && retries > 0) {
//       console.log(`Retrying... attempts left: ${retries}`);
//       await new Promise(res => setTimeout(res, 3000));
//       return apiRequest(endpoint, method, body, retries - 1);
//     }

//     if (err.response) {
//       console.log(`STATUS: ${err.response.status}`);
//       console.log(`DATA: ${JSON.stringify(err.response.data)}`);
//     }

//     return {
//       data: null,
//       error: err?.response?.data || { message: err?.message || 'Something went wrong' },
//     };
//   }
// };

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://ccs-mobile.onrender.com/api';

interface ApiResponse {
  data: any | null;
  error: any | null;
}

export const apiRequest = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
  body?: any,
  retries = 2
): Promise<ApiResponse> => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${BASE_URL}${cleanEndpoint}`;

  try {
    const token = await AsyncStorage.getItem('token');
    console.log(`--- API CALL: ${method} ${fullUrl} ---`);

    const response = await axios({
      method,
      url: fullUrl,
      data: body,
      timeout: 90000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    console.log(`--- API SUCCESS: ${fullUrl} ---`);
    return { data: response.data, error: null };

  } catch (err: any) {
    console.log(`--- API ERROR: ${err?.message} | CODE: ${err?.code} ---`);

    if (err?.code === 'ERR_NETWORK' && retries > 0) {
      console.log(`Retrying... attempts left: ${retries}`);
      await new Promise(res => setTimeout(res, 3000));
      return apiRequest(endpoint, method, body, retries - 1);
    }

    if (err.response) {
      console.log(`STATUS: ${err.response.status}`);
      console.log(`DATA: ${JSON.stringify(err.response.data)}`);
    }

    return {
      data: null,
      error: err?.response?.data || { message: err?.message || 'Something went wrong' },
    };
  }
};


export const wakeUpServer = async (): Promise<void> => {
  try {
    console.log('--- WAKING UP SERVER ---');
    await axios.get(`${BASE_URL}/health`, { timeout: 60000 });
    console.log('--- SERVER IS AWAKE ---');
  } catch (err) {
    console.log('--- WAKE UP ATTEMPT DONE (may still be starting) ---');
  }
};