// src/components/TimePickerModal.tsx
import React, { useCallback, useState, useRef, useEffect } from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { Colors } from "@/constants/Colors";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

interface TimePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: Date, repeatWeekly: boolean) => void;
  todoText: string;
  initialTime?: Date;
  initialRepeatWeekly?: boolean;
}

const ITEM_HEIGHT = 48; // approximate row height (padding + margin)

export const TimePickerModal: React.FC<TimePickerModalProps> = ({
  visible,
  onClose,
  onConfirm,
  todoText,
  initialTime,
  initialRepeatWeekly = false,
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() || "light";

  const now = new Date();
  const [selectedHour, setSelectedHour] = useState(
    initialTime ? initialTime.getHours() : now.getHours()
  );
  const [selectedMinute, setSelectedMinute] = useState(
    initialTime ? initialTime.getMinutes() : now.getMinutes()
  );
  const [repeatWeekly, setRepeatWeekly] = useState(initialRepeatWeekly);

  const hourScrollRef = useRef<ScrollView | null>(null);
  const minuteScrollRef = useRef<ScrollView | null>(null);

  // // Sync state when editing an existing reminder
  // useEffect(() => {
  //   if (visible && initialTime) {
  //     setSelectedHour(initialTime.getHours());
  //     setSelectedMinute(initialTime.getMinutes());
  //   }
  //   if (visible) {
  //     setRepeatWeekly(initialRepeatWeekly);
  //   }
  // }, [visible, initialTime, initialRepeatWeekly]);

  // Sync state when opening (new reminder = current time, edit reminder = initialTime)
  useEffect(() => {
    if (!visible) return;

    const current = new Date();

    if (initialTime) {
      setSelectedHour(initialTime.getHours());
      setSelectedMinute(initialTime.getMinutes());
    } else {
      // always fresh current time when opening for a NEW reminder
      setSelectedHour(current.getHours());
      setSelectedMinute(current.getMinutes());
    }

    setRepeatWeekly(initialRepeatWeekly);
  }, [visible, initialTime, initialRepeatWeekly]);

  // Auto-scroll to selected hour and minute when modal opens
  useEffect(() => {
    if (!visible) return;

    const timeout = setTimeout(() => {
      if (hourScrollRef.current) {
        hourScrollRef.current.scrollTo({
          y: selectedHour * ITEM_HEIGHT,
          animated: false,
        });
      }
      if (minuteScrollRef.current) {
        minuteScrollRef.current.scrollTo({
          y: selectedMinute * ITEM_HEIGHT,
          animated: false,
        });
      }
    }, 0);

    return () => clearTimeout(timeout);
  }, [visible, selectedHour, selectedMinute]);

  const handleConfirm = useCallback(() => {
    const date = new Date();
    date.setHours(selectedHour, selectedMinute, 0, 0);
    onConfirm(date, repeatWeekly);
    onClose();
  }, [selectedHour, selectedMinute, repeatWeekly, onConfirm, onClose]);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const renderTimeUnit = (
    value: number,
    selectedValue: number,
    onSelect: (val: number) => void
  ) => {
    const isSelected = value === selectedValue;
    return (
      <TouchableOpacity
        key={value}
        style={[
          styles.timeItem,
          isSelected && {
            backgroundColor: Colors.universal.primary,
          },
        ]}
        onPress={() => onSelect(value)}
        activeOpacity={0.7}
      >
        <ThemedText
          style={[styles.timeText, isSelected && styles.timeTextSelected]}
        >
          {value.toString().padStart(2, "0")}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={[
            styles.modalContent,
            { backgroundColor: Colors[colorScheme].background },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <Ionicons
              name="alarm-outline"
              size={24}
              color={Colors.universal.primary}
            />
            <ThemedText style={styles.title} type="subtitle">
              {t("setReminder")}
            </ThemedText>
          </View>

          {/* Todo Text */}
          <ThemedText style={styles.todoPreview} numberOfLines={2}>
            {todoText}
          </ThemedText>

          {/* Time Display */}
          <View style={styles.timeDisplay}>
            <ThemedText style={styles.timeDisplayText} type="title">
              {selectedHour.toString().padStart(2, "0")}:
              {selectedMinute.toString().padStart(2, "0")}
            </ThemedText>
          </View>

          {/* Time Picker */}
          <View style={styles.pickerContainer}>
            {/* Hours */}
            <View style={styles.pickerColumn}>
              <ThemedText style={styles.pickerLabel}>
                {t("hours") || "Hours"}
              </ThemedText>
              <ScrollView
                ref={hourScrollRef}
                style={styles.scrollPicker}
                showsVerticalScrollIndicator={false}
              >
                {hours.map((hour) =>
                  renderTimeUnit(hour, selectedHour, setSelectedHour)
                )}
              </ScrollView>
            </View>

            {/* Separator */}
            <ThemedText style={styles.separator}>:</ThemedText>

            {/* Minutes */}
            <View style={styles.pickerColumn}>
              <ThemedText style={styles.pickerLabel}>{t("minutes")}</ThemedText>
              <ScrollView
                ref={minuteScrollRef}
                style={styles.scrollPicker}
                showsVerticalScrollIndicator={false}
              >
                {minutes.map((minute) =>
                  renderTimeUnit(minute, selectedMinute, setSelectedMinute)
                )}
              </ScrollView>
            </View>
          </View>

          {/* Repeat Weekly Toggle */}
          <TouchableOpacity
            style={styles.repeatRow}
            onPress={() => setRepeatWeekly((prev) => !prev)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={repeatWeekly ? "checkbox" : "square-outline"}
              size={22}
              color={Colors.universal.primary}
            />
            <ThemedText style={styles.repeatText}>
              {t("repeatWeekly")}
            </ThemedText>
          </TouchableOpacity>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.cancelButton,
                { borderColor: Colors[colorScheme].border },
              ]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.cancelButtonText}>
                {t("cancel")}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                { backgroundColor: Colors.universal.primary },
              ]}
              onPress={handleConfirm}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.confirmButtonText}>
                {t("confirm")}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  title: {},
  todoPreview: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
    lineHeight: 20,
  },
  timeDisplay: {
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "rgba(128, 128, 128, 0.1)",
  },
  timeDisplayText: {
    fontWeight: "600",
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    gap: 10,
  },
  pickerColumn: {
    flex: 1,
    alignItems: "center",
  },
  pickerLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 8,
    fontWeight: "500",
  },
  scrollPicker: {
    maxHeight: 180,
    width: "100%",
  },
  timeItem: {
    height: ITEM_HEIGHT,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginVertical: 2,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  timeText: {
    fontSize: 18,
  },
  timeTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  separator: {
    fontSize: 24,
    fontWeight: "600",
    marginTop: 20,
  },
  repeatRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 10,
  },
  repeatText: {
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  confirmButton: {},
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
