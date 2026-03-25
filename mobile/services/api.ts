// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const BASE_URL = 'https://ccs-mobile.onrender.com/api';

// export const apiRequest = async (
//   endpoint: string,
//   method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
//   body?: any
// ) => {
//   try {
//     const token = await AsyncStorage.getItem('token');
//     const response = await axios({
//       method,
//       url: `${BASE_URL}${endpoint}`,
//       data: body,
//       headers: {
//         'Content-Type': 'application/json',
//         ...(token ? { Authorization: `Bearer ${token}` } : {}),
//       },
//     });
//     return { data: response.data, error: null };
//   } catch (err: any) {
//     return {
//       data: null,
//       error: err?.response?.data || { message: 'Something went wrong' },
//     };
//   }
// };

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Rule: No trailing slash here
const BASE_URL = 'https://ccs-mobile.onrender.com/api';

export const apiRequest = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
  body?: any
) => {
  // CLEANUP LOGIC: This ensures we always have exactly ONE slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${BASE_URL}${cleanEndpoint}`;
  
  try {
    const token = await AsyncStorage.getItem('token');
    
    console.log(`--- API CALL START ---`);
    console.log(`METHOD: ${method}`);
    console.log(`URL: ${fullUrl}`); // This should now show /api/auth/login
    
    const response = await axios({
      method,
      url: fullUrl,
      data: body,
      timeout: 60000, 
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    console.log(`--- API RESPONSE SUCCESS ---`);
    return { data: response.data, error: null };

  } catch (err: any) {
    console.log(`--- API ERROR ---`);
    console.log(`MSG: ${err?.message}`);
    console.log(`CODE: ${err?.code}`);
    
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