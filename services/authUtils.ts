import { UserProfile } from '../types';

export const isPaidStudent = (user: UserProfile | null): boolean => {
  if (!user) return false;
  if (user.is_admin) return true;
  // A user is a paid student if they have purchased at least one course that is NOT the free PDF guide
  return user.purchased_courses.some(id => id !== 'course_pdf_guide_free');
};
