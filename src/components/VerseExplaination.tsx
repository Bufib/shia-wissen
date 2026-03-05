import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const VerseExplanation = ({ sura, verse, onBack }) => {
  if (!verse) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Zurück</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Vers {verse.number}</Text>
          <Text style={styles.headerSubtitle}>{sura.germanName}</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Verse Display */}
          <View style={styles.verseContainer}>
            <View style={styles.verseHeader}>
              <Text style={styles.verseTitle}>Vers {verse.number}</Text>
              <View style={styles.verseNumber}>
                <Text style={styles.verseNumberText}>{verse.number}</Text>
              </View>
            </View>
            
            <Text style={styles.arabicText}>{verse.arabic}</Text>
            <Text style={styles.germanText}>{verse.german}</Text>
          </View>

          {/* Explanation Sections */}
          {verse.explanation && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📖 Erläuterung</Text>
              <Text style={styles.explanationText}>{verse.explanation}</Text>
            </View>
          )}

          {verse.context && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🏛️ Historischer Kontext</Text>
              <Text style={styles.contextText}>{verse.context}</Text>
            </View>
          )}

          {verse.lessons && verse.lessons.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💡 Lehren und Weisheiten</Text>
              {verse.lessons.map((lesson, index) => (
                <View key={index} style={styles.lessonItem}>
                  <Text style={styles.lessonBullet}>•</Text>
                  <Text style={styles.lessonText}>{lesson}</Text>
                </View>
              ))}
            </View>
          )}

          {verse.keywords && verse.keywords.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔑 Schlüsselwörter</Text>
              <View style={styles.keywordsContainer}>
                {verse.keywords.map((keyword, index) => (
                  <View key={index} style={styles.keywordTag}>
                    <Text style={styles.keywordText}>{keyword}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {verse.relatedVerses && verse.relatedVerses.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔗 Verwandte Verse</Text>
              {verse.relatedVerses.map((related, index) => (
                <View key={index} style={styles.relatedVerse}>
                  <Text style={styles.relatedReference}>{related.reference}</Text>
                  <Text style={styles.relatedText}>{related.text}</Text>
                </View>
              ))}
            </View>
          )}
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#d1fae5',
    fontSize: 14,
  },
  placeholder: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  verseContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  verseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  verseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#065f46',
  },
  verseNumber: {
    backgroundColor: '#065f46',
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verseNumberText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  arabicText: {
    fontSize: 24,
    lineHeight: 42,
    textAlign: 'right',
    color: '#1f2937',
    marginBottom: 16,
    fontWeight: '500',
  },
  germanText: {
    fontSize: 17,
    lineHeight: 26,
    color: '#374151',
    fontStyle: 'italic',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#065f46',
    marginBottom: 12,
  },
  explanationText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#374151',
  },
  contextText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#374151',
    fontStyle: 'italic',
  },
  lessonItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  lessonBullet: {
    fontSize: 16,
    color: '#065f46',
    marginRight: 8,
    marginTop: 2,
  },
  lessonText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
    flex: 1,
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  keywordTag: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  keywordText: {
    fontSize: 13,
    color: '#065f46',
    fontWeight: '500',
  },
  relatedVerse: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#065f46',
  },
  relatedReference: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#065f46',
    marginBottom: 4,
  },
  relatedText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
});

export default VerseExplanation;