import axios from 'axios';
import { getGlobalOptions } from '@options';
import * as util from '../../../utils';
const global = getGlobalOptions();
const BASE_URL = global.url;
export const sendVerification = (data, token) => {
  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `${BASE_URL}/modules/two-factor-authentication/send/otp`,
    headers: {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json'
    },
    data: data
  };
  return axios.request(config);
};
export const getGoogleAuthenticatorQR = token => {
  const config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `${BASE_URL}/modules/two-factor-authentication/google/authenticator/qr`,
    headers: {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json'
    }
  };
  return axios.request(config);
};
export const verifyCode = (data, token) => {
  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `${BASE_URL}/modules/two-factor-authentication/verify/otp`,
    headers: {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json'
    },
    data: data
  };
  return axios.request(config);
};
export const enableAuthentication = (data, token) => {
  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `${BASE_URL}/modules/two-factor-authentication/enable/2fa`,
    headers: {
      Authorization: `Token ${util.Interceptor.getToken()}`,
      'Content-Type': 'application/json'
    },
    data: data
  };
  return axios.request(config);
};
export const verifyEnableAuthenticationCode = data => {
  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `${BASE_URL}/modules/two-factor-authentication/verify/otp/enable`,
    headers: {
      Authorization: `Token ${util.Interceptor.getToken()}`,
      'Content-Type': 'application/json'
    },
    data: data
  };
  return axios.request(config);
}; //static value added

export const checkAuthenticationStatus = token => {
  const config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `${BASE_URL}/modules/two-factor-authentication/enable/2fa`,
    headers: {
      Authorization: `Token ${util.Interceptor.getToken()}`,
      'Content-Type': 'application/json'
    }
  };
  return axios.request(config);
};
export const disableAuthenticationStatus = () => {
  const config = {
    method: 'delete',
    maxBodyLength: Infinity,
    url: `${BASE_URL}/modules/two-factor-authentication/enable/2fa`,
    headers: {
      Authorization: `Token ${util.Interceptor.getToken()}`,
      'Content-Type': 'application/json'
    }
  };
  return axios.request(config);
};
export const api = {
  sendVerification,
  getGoogleAuthenticatorQR,
  verifyCode,
  enableAuthentication,
  verifyEnableAuthenticationCode,
  checkAuthenticationStatus,
  disableAuthenticationStatus
};