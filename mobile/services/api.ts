import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://ccs-mobile.onrender.com/api';

export const apiRequest = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
  body?: any
) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await axios({
      method,
      url: `${BASE_URL}${endpoint}`,
      data: body,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    return { data: response.data, error: null };
  } catch (err: any) {
    return {
      data: null,
      error: err?.response?.data || { message: 'Something went wrong' },
    };
  }
};