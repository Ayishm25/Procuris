import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Platform, AppState } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { unwrapResult } from '@reduxjs/toolkit';
import { useSelector, useDispatch } from 'react-redux';
import { verifyCode, sendVerification, verifyEnableAuthenticationCode, enableAuthentication } from '../../store';
import Wrapper from '../../../../components/Wrapper';
import TextElement from '../../../../components/TextElement';
import { Colors, Mixins } from '../../../../utils/styles';
import OtpInputs from 'react-native-otp-inputs';
import Button from '../../../../components/Button';
import { ShowToast } from '../../../../utils/helperFunctions';
import QRCode from 'react-native-qrcode-svg';
import { setIsLogin, setOtpTime } from '../../../../store/coldShapeAPI/logins.slice';
/**
 * Verification Component.
 * @returns {React.ReactNode} - The verification component.
 */

const Verification = props => {
  const refOtpInput = useRef();
  const [isWrongOtp, setIsWrongOtp] = useState(false);
  const [otpEditable, setOtpEditable] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [loader, setLoader] = useState(false);
  const [seconds, setSeconds] = useState(59);
  const {
    entities,
    otpTime
  } = useSelector(state => state.auth);
  const backgroundTimeRef = useRef(null);
  const {
    navFrom,
    data
  } = props.route.params || {};
  useEffect(() => {
    if (seconds) {
      if (otpTime == 0) {
        dispatch(setOtpTime(new Date()));
      }

      let timer = setTimeout(() => {
        setSeconds(seconds - 1);
      }, 1000);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [seconds]);
  const appState = useRef(AppState.currentState);
  useEffect(() => {
    const handleAppStateChange = nextAppState => {
      if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        // App goes into the background
        backgroundTimeRef.current = new Date();
      } else if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App comes into the foreground
        const secondsDifference = Math.floor((new Date() - new Date(otpTime)) / 1000);
        setSeconds(secondsDifference);
      }

      appState.current = nextAppState;
    };

    AppState.addEventListener('change', handleAppStateChange);
    return () => {// AppState.removeEventListener('change', handleAppStateChange)
    };
  }, []);
  const dispatch = useDispatch();
  const route = useRoute(); // This variables gets the loading status for sendVerification code api

  const loading = useSelector(state => state?.Authentication?.sendVerification?.api?.loading); // This variables gets the loading status for code verification code api

  const verifyCodeLoading = useSelector(state => state?.Authentication?.verifyCode?.api?.loading);
  const {
    method,
    link,
    authenticationType
  } = route.params; // This variables gets the loading status for enableAuthentication api

  const enableAuthenticationLoading = useSelector(state => state?.Authentication?.enableAuthentication?.api?.loading); // This variables gets the loading status for verifyEnableAuthenticationCode api

  const verifyEnableAuthenticationCodeLoading = useSelector(state => state?.Authentication?.verifyEnableAuthenticationCode?.api?.loading);
  const isLoading = !!(verifyCodeLoading === 'pending' || loading === 'pending' || enableAuthenticationLoading === 'pending' || verifyEnableAuthenticationCodeLoading === 'pending');
  const [code, setCode] = useState('');

  const handleVerification = async () => {
    if (navFrom == 'more' && authenticationType) {
      // This action dispatches api to get authentication enabling code. It takes verification method and code as params
      dispatch(verifyEnableAuthenticationCode({
        method: data?.method,
        code: parseInt(code)
      })).then(unwrapResult).then(() => {
        props.navigation.navigate('More');
        ShowToast('Two-factor authentication has been enabled', 1);
      }).catch(err => {
        ShowToast(err.message);
      });
    } else {
      // This action dispatches api for code verification. It takes verification method and code as params
      dispatch(verifyCode({
        method: method,
        code: parseInt(code)
      })).then(unwrapResult).then(res => {
        dispatch(setIsLogin(true));
      }).catch(err => {
        dispatch(setIsLogin(false));
        ShowToast(err.message);
      });
    }
  };

  const handleResendCode = async () => {
    setSeconds(59);
    dispatch(setOtpTime(new Date()));
    setLoader(true);

    if (authenticationType) {
      // This action dispatches api to get the code again for authentication enabling. It takes verification method as params
      dispatch(enableAuthentication({
        method: data?.method
      })).then(unwrapResult).then(res => {
        setLoader(false);
        ShowToast('OTP sent,Please check your inbox!', 1);
      }).catch(err => console.log('Error', err));
    } else {
      // This action dispatches api to get code. It takes verification method as params
      dispatch(sendVerification({
        method: method
      })).then(unwrapResult).then(res => {
        setLoader(false);
        ShowToast('OTP sent, Please check your inbox!', 1);
      }).catch(err => console.log('Error', err));
    }
  };

  return <Wrapper backPress={() => {
    props.navigation.goBack();
  }}>
      <View style={styles.container}>
        <TextElement textStyle={styles.heading}>
          {navFrom ? 'Enter Authentication Code' : 'Enter Verification Code'}
        </TextElement>
        <TextElement textStyle={styles.subText}>
          {`Enter 6-digit verification code we’ve sent to your ` + (method == 'google_authenticator' || data?.method == 'google_authenticator' ? 'google authenticator' : `email id ${entities.email}`)}
        </TextElement>
        <View style={[styles.emailWrapRow]}>
          {data?.method == 'google_authenticator' && <View style={styles.qrCodeContainer}>
              {link && <QRCode value={link} size={150} />}
            </View>}
          <OtpInputs autofillFromClipboard={Platform.OS !== 'ios'} ref={refOtpInput} handleChange={code => {
          if (code.length === 6) {
            setCode(code);
          } else if (isWrongOtp && code.length < 6) {
            setIsWrongOtp(false);
            setErrorMessage('');
          }
        }} numberOfInputs={6} style={styles.otpContainer} inputContainerStyles={[styles.otpInputContainer, isWrongOtp && styles.errorInputStyle]} focusStyles={[styles.otpInputFocus, isWrongOtp && styles.errorInputStyle]} inputStyles={styles.otpInput} selectTextOnFocus={false} editable={otpEditable} />
          {errorMessage != '' && <TextElement font={'regular'} fontType={'h6'} textStyle={{
          color: Colors.DARK_RED,
          marginTop: scaleSize(16)
        }}>
              {errorMessage}
            </TextElement>}
          {(method && method != 'google_authenticator' || data?.method && data?.method != 'google_authenticator') && <View style={styles.timerStyle}>
              {seconds > 0 && seconds < 60 ? <TextElement textStyle={styles.timerText}>
                  {`Code expires in 00 : ${seconds < 10 ? '0' : ''}${seconds}`}
                </TextElement> : <View style={styles.timerContainer}>
                  <TextElement textStyle={styles.timerText}>
                    {'Didn’t receive code? '}
                  </TextElement>
                  <TextElement onPress={handleResendCode} textStyle={styles.timerText}>
                    {'Resend Code'}
                  </TextElement>
                </View>}
            </View>}
        </View>
        <View style={styles.buttonContainer}>
          <Button title={'Continue'} onPress={() => {
          handleVerification();
        }} />
        </View>
      </View>
    </Wrapper>;
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Mixins.scaleSize(20),
    flex: 1
  },
  qrCodeContainer: {
    alignSelf: 'center',
    marginBottom: Mixins.scaleSize(20)
  },
  heading: {
    fontSize: Mixins.scaleSize(24),
    lineHeight: Mixins.scaleSize(32),
    marginBottom: Mixins.scaleSize(4),
    color: Colors.GREY
  },
  subText: {
    fontSize: Mixins.scaleSize(14),
    lineHeight: Mixins.scaleSize(20),
    fontWeight: '400',
    color: Colors.GREY
  },
  timerText: {
    textAlign: 'center',
    color: Colors.GREY,
    fontSize: Mixins.scaleSize(12)
  },
  timerContainer: {
    flexDirection: 'row',
    marginTop: Mixins.scaleSize(10)
  },
  inputContainer: {
    marginTop: Mixins.scaleSize(30),
    marginVertical: Mixins.scaleSize(20)
  },
  otpContainer: {
    width: '100%',
    height: Mixins.WINDOW_HEIGHT * 0.065,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  timerStyle: {
    width: Mixins.WINDOW_WIDTH * 0.9,
    alignItems: 'center',
    marginVertical: Mixins.scaleSize(35)
  },
  buttonContainer: {
    justifyContent: 'flex-end',
    flex: 1
  },
  emailWrapRow: {
    width: Mixins.WINDOW_WIDTH * 0.9,
    justifyContent: 'center',
    marginTop: Mixins.WINDOW_HEIGHT * 0.05,
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  otpInputContainer: {
    width: Mixins.WINDOW_WIDTH * 0.12,
    height: Platform.OS === 'ios' ? '90%' : '100%',
    borderRadius: Mixins.scaleSize(8),
    color: Colors.BLACK,
    backgroundColor: Colors.WHITE,
    borderColor: Colors.LIGHT_GREY,
    borderWidth: 1
  },
  otpInput: {
    width: Mixins.WINDOW_WIDTH * 0.11,
    height: '100%',
    textAlign: 'center',
    color: Colors.BLACK,
    fontSize: Mixins.scaleSize(13)
  },
  otpInputFocus: {
    borderColor: Colors.BLUE,
    borderWidth: 1
  },
  errorInputStyle: {
    borderColor: Colors.DARK_RED,
    borderWidth: 1
  }
});
export default Verification;