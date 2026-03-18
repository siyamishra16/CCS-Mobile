import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { moderateScale, verticalScale } from 'react-native-size-matters';

interface ButtonCompProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outline';
}

export default function ButtonComp({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
}: ButtonCompProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'outline' ? styles.outlineButton : styles.primaryButton,
        disabled && styles.disabledButton,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#0A66C2' : '#fff'} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            variant === 'outline' ? styles.outlineText : styles.primaryText,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(14),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(8),
  },
  primaryButton: {
    backgroundColor: '#0A66C2',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#0A66C2',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  primaryText: {
    color: '#fff',
  },
  outlineText: {
    color: '#0A66C2',
  },
});