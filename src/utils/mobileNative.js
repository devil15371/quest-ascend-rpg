import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { LocalNotifications } from '@capacitor/local-notifications';

/**
 * Trigger native mobile haptic vibration feedback.
 * Works on Android & iOS via Capacitor, with HTML5 navigator.vibrate fallback.
 */
export async function triggerHapticFeedback(style = 'medium') {
  try {
    if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform()) {
      if (style === 'heavy' || style === 'levelUp') {
        await Haptics.notification({ type: NotificationType.Success });
      } else if (style === 'light') {
        await Haptics.impact({ style: ImpactStyle.Light });
      } else {
        await Haptics.impact({ style: ImpactStyle.Medium });
      }
    } else if (navigator.vibrate) {
      if (style === 'heavy' || style === 'levelUp') {
        navigator.vibrate([100, 50, 100, 50, 200]);
      } else {
        navigator.vibrate(40);
      }
    }
  } catch (err) {
    console.log("Haptics unavailable or non-mobile environment:", err);
  }
}

/**
 * Request permission and schedule native mobile local notifications
 * for Morning Quest setup and Evening Discipline Audit.
 */
export async function scheduleMobileReminders() {
  try {
    if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform()) {
      const permState = await LocalNotifications.requestPermissions();
      if (permState.display !== 'granted') return;

      // Cancel existing to avoid duplicates
      await LocalNotifications.cancel({ notifications: [{ id: 101 }, { id: 102 }] });

      // Schedule 7:00 AM Morning Reminder
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 101,
            title: "🌅 Morning Strategy Session!",
            body: "Set your daily morning quests before 8:00 AM to claim your +25% Early Bird EXP bonus!",
            schedule: {
              on: { hour: 7, minute: 0 },
              repeats: true
            },
            sound: undefined,
            attachments: undefined,
            actionTypeId: "",
            extra: null
          },
          {
            id: 102,
            title: "⚖️ Daily Discipline Audit Warning",
            body: "Check off completed quests before midnight to avoid EXP penalties or activate a Rest Day Pass!",
            schedule: {
              on: { hour: 21, minute: 0 },
              repeats: true
            },
            sound: undefined,
            attachments: undefined,
            actionTypeId: "",
            extra: null
          }
        ]
      });
      console.log("Mobile native reminders scheduled successfully.");
    }
  } catch (err) {
    console.log("LocalNotifications unavailable:", err);
  }
}
