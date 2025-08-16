// Store timeout IDs to clear them later
let scheduledTimeoutIds = [];
const DAY_MAP = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Clears all currently scheduled timeouts for notifications.
 */
export function clearScheduledNotifications() {
  scheduledTimeoutIds.forEach(id => clearTimeout(id));
  scheduledTimeoutIds = [];
  console.log('Cleared all scheduled notifications.');
}

/**
 * Schedules notifications for upcoming assignments and classes.
 * @param courses - Array of course objects.
 * @param assignments - Array of assignment objects.
 */
export function scheduleNotifications(courses, assignments) {
  clearScheduledNotifications();
  const now = new Date();

  // --- Schedule Assignment Notifications (24 hours before due) ---
  assignments.forEach(assignment => {
    const dueDate = new Date(assignment.dueDate);
    const notificationTime = new Date(dueDate.getTime() - 24 * 60 * 60 * 1000);
    if (notificationTime > now) {
      const msUntilNotification = notificationTime.getTime() - now.getTime();
      const courseName = courses.find(c => c.id === assignment.courseId)?.name || 'your course';
      const timeoutId = setTimeout(() => {
        new Notification('Assignment Due Tomorrow', {
          body: `${assignment.name} for ${courseName} is due tomorrow.`,
          tag: `assignment-${assignment.id}`
        });
      }, msUntilNotification);
      scheduledTimeoutIds.push(timeoutId);
    }
  });

  // --- Schedule Class Notifications (15 minutes before start) ---
  courses.forEach(course => {
    course.schedule.forEach(slot => {
      const targetDayIndex = DAY_MAP.indexOf(slot.dayOfWeek);
      if (targetDayIndex === -1) return;

      // Find the next date that matches the day of the week
      const nextClassDate = new Date(now);
      const daysUntilTarget = (targetDayIndex - now.getDay() + 7) % 7;
      nextClassDate.setDate(now.getDate() + daysUntilTarget);
      const [hours, minutes] = slot.startTime.split(':').map(Number);
      nextClassDate.setHours(hours, minutes, 0, 0);

      // If the calculated time is in the past for today, schedule it for the next week
      if (nextClassDate <= now) {
        nextClassDate.setDate(nextClassDate.getDate() + 7);
      }
      const notificationTime = new Date(nextClassDate.getTime() - 15 * 60 * 1000);
      if (notificationTime > now) {
        const msUntilNotification = notificationTime.getTime() - now.getTime();
        const timeoutId = setTimeout(() => {
          new Notification('Class Starting Soon', {
            body: `${course.name} starts at ${slot.startTime}.`,
            tag: `class-${course.id}-${slot.dayOfWeek}-${slot.startTime}`
          });
        }, msUntilNotification);
        scheduledTimeoutIds.push(timeoutId);
      }
    });
  });
  if (scheduledTimeoutIds.length > 0) {
    console.log(`Scheduled ${scheduledTimeoutIds.length} new notifications.`);
  }
}