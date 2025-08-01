import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface ImprovementTipsProps {
  tips: string[];
  confidence: number;
}

export default function ImprovementTips({ tips, confidence }: ImprovementTipsProps) {
  if (confidence >= 70 || !tips || tips.length === 0) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AlertCircle size={20} color={Colors.accent} />
        <Text style={styles.title}>Tips for Better Recognition</Text>
      </View>
      
      {tips.map((tip, index) => (
        <Text key={index} style={styles.tipText}>
          • {tip}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 158, 68, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
  },
  tipText: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
    lineHeight: 20,
  },
});