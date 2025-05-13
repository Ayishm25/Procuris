import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { unwrapResult } from '@reduxjs/toolkit';
import { useIsFocused } from '@react-navigation/native';
import SvgIcons from '../../../../components/assets/svgs';
import { getGoogleAuthenticatorQR, sendVerification } from '../../store';
import Wrapper from '../../../../components/Wrapper';
import TextElement from '../../../../components/TextElement';
import { Mixins, Colors } from '../../../../utils/styles';

/**
 * Authentication Types Component.
 * @param {Object} navigation - React Navigation prop.
 * @returns {React.ReactNode} - The authentication types component.
 */
const AuthTypes = ({
  navigation,
  route
}) => {
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const {
    token
  } = useSelector(state => state);
  const isLoading = useSelector(state => {
    const loadingStates = [state?.Authentication?.sendVerification?.api?.loading, state?.Authentication?.getGoogleAuthenticatorQR?.api?.loading, state?.Authentication?.enableAuthentication?.api?.loading, state?.Authentication?.checkAuthenticationStatus?.api?.loading, state?.Authentication?.disableAuthentication?.api?.loading];
    return loadingStates.some(loading => loading === 'pending');
  });
  const {
    method
  } = route.params || {};

  const OptionsContainer = props => {
    const {
      title,
      icon,
      onPress
    } = props;
    return <TouchableOpacity onPress={onPress} style={styles.optionView}>
        <View style={styles.row}>
          <View style={styles.icon}>{icon}</View>
          <TextElement onPress={onPress} textStyle={styles.title}>
            {title}
          </TextElement>
          <View style={styles.rightIconView}>
            <SvgIcons.RightArrow />
          </View>
        </View>
      </TouchableOpacity>;
  };

  const onApiSuccess = (res, value, type) => {
    navigation.navigate('Verification', {
      method: value,
      link: res?.link,
      authenticationType: type ? 'enable' : null
    });
  };

  const onHandleMethod = async method => {
    if (method === 'google_authenticator') {
      // This action dispatches api to get google authenticator qr code link.
      dispatch(getGoogleAuthenticatorQR()).then(unwrapResult).then(res => {
        onApiSuccess(res, method, false);
      }).catch(err => console.log('NOT WORKING', err));
    } else {
      // This action dispatches api to get code. It takes verification method as params
      dispatch(sendVerification({
        method: method
      })).then(unwrapResult).then(res => {
        onApiSuccess(res, method, false);
      }).catch(err => console.log('NOT WORKING', err));
    }
  };

  return <Wrapper backPress={() => {
    navigation.goBack();
  }}>
      <View style={styles.container}>
        <TextElement textStyle={styles.heading}>
          {'Security Verification'}
        </TextElement>
        <TextElement textStyle={styles.subText}>
          {'Please select the verification method.'}
        </TextElement>
        <View style={styles.inputContainer}>
          {method == 'phone_number' && <OptionsContainer onPress={() => {
          onHandleMethod('phone_number');
        }} title={'Phone No'} icon={<SvgIcons.Message />} />}
          {method == 'email' && <OptionsContainer onPress={() => {
          onHandleMethod('email'); // navigation.navigate('2FA')
        }} title={'Email'} icon={<SvgIcons.Email />} />}
          {method == 'google_authenticator' && <OptionsContainer onPress={() => {
          onHandleMethod('google_authenticator');
        }} title={'Google Authenticator'} icon={<SvgIcons.Gauth />} />}
        </View>
      </View>
    </Wrapper>;
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Mixins.scaleSize(20),
    flex: 1
  },
  icon: {
    marginHorizontal: Mixins.scaleSize(15)
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
  inputContainer: {
    marginTop: Mixins.scaleSize(30),
    marginVertical: Mixins.scaleSize(20)
  },
  buttonStyle: {
    backgroundColor: Colors.PRIMARY
  },
  row: {
    flexDirection: 'row'
  },
  rightIconView: {
    flex: 1,
    marginHorizontal: Mixins.scaleSize(15),
    alignItems: 'flex-end'
  },
  optionView: {
    borderWidth: 1,
    borderColor: Colors.BORDER,
    borderRadius: Mixins.scaleSize(8),
    paddingHorizontal: Mixins.scaleSize(12),
    paddingVertical: Mixins.scaleSize(24),
    marginBottom: Mixins.scaleSize(16)
  },
  title: {
    color: Colors.TEXT_BLACK
  }
});
export default AuthTypes;