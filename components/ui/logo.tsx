import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function Logo() {
  return (
    <View style={styles.wrapper}>
      <View style={styles.box}>
        <Text style={styles.text}>Ŕ</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: 12,
  },
  box: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#5DC264',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 6,
  },
  text: {
    fontSize: 60,
    fontWeight: '800',
    color: '#111111',
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
  },
});

