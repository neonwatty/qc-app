import { mockReminders } from './src/lib/mock-data.ts';

console.log('Mock reminders count:', mockReminders ? mockReminders.length : 'undefined');
if (mockReminders && mockReminders.length > 0) {
  console.log('First reminder:', mockReminders[0].title);
} else {
  console.log('No reminders found or mockReminders is undefined');
}