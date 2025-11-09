import * as Haptics from 'expo-haptics';

export const hapticFeedback = {
  light: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },
  
  medium: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },
  
  heavy: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },
  
  success: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },
  
  warning: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  },
  
  error: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },
  
  selection: () => {
    Haptics.selectionAsync();
  },
};

export const useHapticFeedback = () => {
  return {
    onPress: () => hapticFeedback.light(),
    onSuccess: () => hapticFeedback.success(),
    onError: () => hapticFeedback.error(),
    onSwipe: () => hapticFeedback.medium(),
    onLongPress: () => hapticFeedback.heavy(),
  };
};
