import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { X, Brain, Zap, Globe, Video, Camera, Upload } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface AIInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AIInfoModal({ visible, onClose }: AIInfoModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Fish Recognition AI</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Brain size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>AI Technology</Text>
            </View>
            <Text style={styles.sectionText}>
              Our fish recognition system uses advanced computer vision and machine learning models 
              trained on thousands of fish species images. The AI can identify over 1,000 different 
              fish species with high accuracy.
            </Text>
          </View>
          
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Zap size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Unlimited Recognition</Text>
            </View>
            <Text style={styles.sectionText}>
              Yes! You can identify fish unlimited times. There are no restrictions on how many 
              photos or videos you can analyze. The more you use it, the better you'll get at taking 
              photos that help the AI provide accurate results.
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Upload size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Video Upload Process</Text>
            </View>
            <Text style={styles.sectionText}>
              When you upload a video, our AI analyzes it using this process:
            </Text>
            <View style={styles.processSteps}>
              <Text style={styles.stepText}>1. 📹 Video is received and processed</Text>
              <Text style={styles.stepText}>2. 🔍 AI scans for fish presence in frames</Text>
              <Text style={styles.stepText}>3. 🎯 You select the clearest frame showing the fish</Text>
              <Text style={styles.stepText}>4. 🧠 AI analyzes the selected frame for species identification</Text>
              <Text style={styles.stepText}>5. ✅ Results provided with confidence level</Text>
            </View>
            <Text style={styles.sectionText}>
              The AI will tell you if a fish is detected or not, and explain the confidence level of the identification.
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Video size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Live Video Detection</Text>
            </View>
            <Text style={styles.sectionText}>
              Use the camera feature for real-time fish detection while recording:
            </Text>
            <View style={styles.featureList}>
              <Text style={styles.featureItem}>• Switch to video mode in the camera</Text>
              <Text style={styles.featureItem}>• Hold the fish steady in frame</Text>
              <Text style={styles.featureItem}>• AI analyzes frames every 2 seconds</Text>
              <Text style={styles.featureItem}>• See confidence levels in real-time</Text>
            </View>
          </View>
          
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Globe size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Global Fish Database</Text>
            </View>
            <Text style={styles.sectionText}>
              Our AI recognizes fish species from around the world, including:
            </Text>
            <View style={styles.fishList}>
              <Text style={styles.fishItem}>• Freshwater fish (Bass, Trout, Pike, etc.)</Text>
              <Text style={styles.fishItem}>• Saltwater fish (Tuna, Salmon, Snapper, etc.)</Text>
              <Text style={styles.fishItem}>• Tropical fish (Angelfish, Parrotfish, etc.)</Text>
              <Text style={styles.fishItem}>• Deep sea species</Text>
              <Text style={styles.fishItem}>• Regional specialties</Text>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Video Recognition Tips</Text>
            <Text style={styles.sectionText}>
              For best video results:
            </Text>
            <View style={styles.tipsList}>
              <Text style={styles.tipItem}>• Fish should be clearly visible and well-lit</Text>
              <Text style={styles.tipItem}>• Steady camera work (avoid shaky footage)</Text>
              <Text style={styles.tipItem}>• Fish fills a good portion of the frame</Text>
              <Text style={styles.tipItem}>• Clear focus on the fish's features</Text>
              <Text style={styles.tipItem}>• Good contrast between fish and background</Text>
              <Text style={styles.tipItem}>• Avoid motion blur from fast movements</Text>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Catchbook Feature</Text>
            <Text style={styles.sectionText}>
              After identifying a fish, you can:
            </Text>
            <View style={styles.tipsList}>
              <Text style={styles.tipItem}>• View the identification results first</Text>
              <Text style={styles.tipItem}>• Choose to save it to your personal catchbook</Text>
              <Text style={styles.tipItem}>• View all your catches in your profile</Text>
              <Text style={styles.tipItem}>• Share catches as posts to the community</Text>
              <Text style={styles.tipItem}>• Track your fishing progress over time</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detection Results</Text>
            <Text style={styles.sectionText}>
              The AI will always tell you:
            </Text>
            <View style={styles.tipsList}>
              <Text style={styles.tipItem}>• Whether a fish was detected or not</Text>
              <Text style={styles.tipItem}>• Confidence level (0-100%)</Text>
              <Text style={styles.tipItem}>• Species name if identified</Text>
              <Text style={styles.tipItem}>• Tips for better photos if confidence is low</Text>
              <Text style={styles.tipItem}>• Reasons why detection might have failed</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
  },
  sectionText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
    marginBottom: 12,
  },
  processSteps: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  stepText: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 6,
    lineHeight: 20,
  },
  featureList: {
    marginTop: 8,
  },
  featureItem: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 6,
    lineHeight: 20,
  },
  fishList: {
    marginTop: 8,
  },
  fishItem: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 6,
    lineHeight: 20,
  },
  tipsList: {
    marginTop: 8,
  },
  tipItem: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 6,
    lineHeight: 20,
  },
});