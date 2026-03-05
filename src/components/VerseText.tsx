import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const VerseText = ({ sura, onBack, onVerseSelect }) => {
  if (!sura || !sura.versesText) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Zurück</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{sura.arabicName}</Text>
          <Text style={styles.headerSubtitle}>{sura.germanName}</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Bismillah */}
      {sura.number !== 1 && sura.number !== 9 && (
        <View style={styles.bismillahContainer}>
          <Text style={styles.bismillahArabic}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
          <Text style={styles.bismillahGerman}>Im Namen Allahs, des Allerbarmers, des Barmherzigen</Text>
        </View>
      )}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.instructionText}>
            💡 Tippen Sie auf einen Vers für die Erläuterung
          </Text>
          
          {sura.versesText.map((verse, index) => (
            <TouchableOpacity
              key={index}
              style={styles.verseContainer}
              onPress={() => onVerseSelect(verse)}
              activeOpacity={0.7}
            >
              <View style={styles.verseHeader}>
                <View style={styles.verseNumber}>
                  <Text style={styles.verseNumberText}>{verse.number}</Text>
                </View>
              </View>
              
              <Text style={styles.arabicText}>{verse.arabic}</Text>
              <Text style={styles.germanText}>{verse.german}</Text>
              
              <View style={styles.tapHint}>
                <Text style={styles.tapHintText}>Tippen für Erläuterung →</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
  },
  header: {
    backgroundColor: '#065f46',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#d1fae5',
    fontSize: 14,
  },
  placeholder: {
    width: 60,
  },
  bismillahContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  bismillahArabic: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#065f46',
    marginBottom: 8,
    textAlign: 'center',
  },
  bismillahGerman: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  instructionText: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    textAlign: 'center',
    color: '#92400e',
    fontSize: 14,
  },
  verseContainer: {
    backgroundColor: '#ffffff',
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  verseHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  verseNumber: {
    backgroundColor: '#065f46',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verseNumberText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  arabicText: {
    fontSize: 22,
    lineHeight: 40,
    textAlign: 'right',
    color: '#1f2937',
    marginBottom: 12,
    fontWeight: '500',
  },
  germanText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    marginBottom: 8,
  },
  tapHint: {
    alignItems: 'flex-end',
  },
  tapHintText: {
    fontSize: 12,
    color: '#065f46',
    fontStyle: 'italic',
  },
});

export default VerseText;